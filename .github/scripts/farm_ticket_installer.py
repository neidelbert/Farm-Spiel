INSTALLER V8 – EXAKTE PATCH-SPEZIFIKATION

Ausgangsdatei:
.github/scripts/farm_ticket_installer.py
Mega Installer v7 auf main.

======================================================================
A) SCHEMA 4 AKTIVIEREN
======================================================================

ERSETZE exakt:
SUPPORTED_SCHEMAS = {2, 3}

DURCH:
SUPPORTED_SCHEMAS = {2, 3, 4}


ERSETZE exakt:
TEST_SUFFIXES = (".test.js", ".test.mjs", ".test.cjs")
ROOT_KEYS_SCHEMA_2 = {
    "schema", "repository", "target_branch", "ticket", "base_sha",
    "commit_message", "files",
}
ROOT_KEYS_SCHEMA_3 = ROOT_KEYS_SCHEMA_2 | {"checks"}
CHECK_KEYS_SCHEMA_3 = {"require_tests"}

DURCH:
TEST_SUFFIXES = (".test.js", ".test.mjs", ".test.cjs")
MARKDOWN_SUFFIXES = {".md", ".markdown"}
ROOT_KEYS_SCHEMA_2 = {
    "schema", "repository", "target_branch", "ticket", "base_sha",
    "commit_message", "files",
}
ROOT_KEYS_SCHEMA_3 = ROOT_KEYS_SCHEMA_2 | {"checks"}
ROOT_KEYS_SCHEMA_4 = ROOT_KEYS_SCHEMA_3
CHECK_KEYS_SCHEMA_3 = {"require_tests"}
MAX_EDIT_REPLACEMENTS = 100


======================================================================
B) MARKDOWN-NORMALISIERUNG EINFÜGEN
======================================================================

Direkt VOR:
def decode_payload(payload_text: str) -> dict:

EINFÜGEN:

def normalize_markdown_whitespace(rel: str, content: bytes) -> tuple[bytes, bool]:
    if PurePosixPath(rel).suffix.lower() not in MARKDOWN_SUFFIXES:
        return content, False
    normalized = re.sub(rb"[ \t]+(?=\r?$)", b"", content, flags=re.MULTILINE)
    return normalized, normalized != content


======================================================================
C) MANIFEST-SHAPE FÜR SCHEMA 4
======================================================================

In validate_manifest_shape(manifest):

ERSETZE:
    allowed = ROOT_KEYS_SCHEMA_2 if schema == 2 else ROOT_KEYS_SCHEMA_3

DURCH:
    if schema == 2:
        allowed = ROOT_KEYS_SCHEMA_2
    elif schema == 3:
        allowed = ROOT_KEYS_SCHEMA_3
    else:
        allowed = ROOT_KEYS_SCHEMA_4


ERSETZE:
    if schema == 3:
        checks = manifest.get("checks", {})

DURCH:
    if schema in {3, 4}:
        checks = manifest.get("checks", {})


======================================================================
D) WRITE-OPERATION: MARKDOWN AUTOMATISCH BEREINIGEN
======================================================================

Im action == "write"-Block:

Direkt NACH:
            if hashlib.sha256(content).hexdigest() != expected_sha256:
                fail(f"SHA-256 mismatch for {rel}")

EINFÜGEN:

            content, normalized = normalize_markdown_whitespace(rel, content)
            final_sha256 = hashlib.sha256(content).hexdigest()
            if normalized:
                print(f"MARKDOWN_WHITESPACE_NORMALIZED {rel}")


Im selben Block ERSETZE bei operations.append:

                "sha256": expected_sha256,

DURCH:

                "sha256": final_sha256,


WICHTIG:
Die erste SHA-256-Prüfung gegen expected_sha256 MUSS VOR der
Markdown-Normalisierung bestehen bleiben.
Damit bleibt die Transportintegrität vollständig erhalten.


======================================================================
E) NEUE ACTION "edit" FÜR SCHEMA 4
======================================================================

Direkt VOR:
        elif action == "delete":

EINFÜGEN:

        elif action == "edit":
            if schema != 4:
                fail(f"edit action requires payload schema 4: {rel}")

            allowed_keys = {
                "path", "action", "base_sha256", "replacements",
                "sha256", "executable",
            }
            unknown = set(item) - allowed_keys
            if unknown:
                fail(f"Unknown edit-operation keys for {rel}: {sorted(unknown)}")

            base_sha256 = item.get("base_sha256")
            replacements = item.get("replacements")
            expected_sha256 = item.get("sha256")
            executable = item.get("executable")

            if not isinstance(base_sha256, str) or not SHA256_RE.fullmatch(base_sha256):
                fail(f"Missing or invalid base_sha256 for {rel}")
            if not isinstance(expected_sha256, str) or not SHA256_RE.fullmatch(expected_sha256):
                fail(f"Missing or invalid sha256 for {rel}")
            if executable is not None and not isinstance(executable, bool):
                fail(f"executable must be boolean for {rel}")
            if not isinstance(replacements, list) or not (
                1 <= len(replacements) <= MAX_EDIT_REPLACEMENTS
            ):
                fail(f"Invalid replacement count for {rel}")
            if not target.is_file():
                fail(f"Edit target is missing or not a file: {rel}")

            content = target.read_bytes()
            if hashlib.sha256(content).hexdigest() != base_sha256:
                fail(f"Base SHA-256 mismatch for edit target {rel}")

            old_mode = stat.S_IMODE(target.stat().st_mode)

            for index, replacement in enumerate(replacements, start=1):
                if not isinstance(replacement, dict):
                    fail(f"Replacement {index} in {rel} must be an object.")
                allowed_replacement_keys = {"old_b64", "new_b64"}
                unknown_replacement = set(replacement) - allowed_replacement_keys
                if unknown_replacement:
                    fail(
                        f"Unknown replacement keys for {rel} #{index}: "
                        f"{sorted(unknown_replacement)}"
                    )

                old_b64 = replacement.get("old_b64")
                new_b64 = replacement.get("new_b64")
                if not isinstance(old_b64, str) or not isinstance(new_b64, str):
                    fail(f"Replacement {index} in {rel} needs old_b64/new_b64.")

                try:
                    old = base64.b64decode(old_b64, validate=True)
                    new = base64.b64decode(new_b64, validate=True)
                except Exception:
                    fail(f"Invalid base64 replacement in {rel} #{index}")

                if not old:
                    fail(f"Empty edit search fragment in {rel} #{index}")

                occurrences = content.count(old)
                if occurrences != 1:
                    fail(
                        f"Edit anchor occurrence mismatch in {rel} #{index}: "
                        f"expected 1, found {occurrences}"
                    )

                content = content.replace(old, new, 1)

                if len(content) > MAX_FILE_BYTES:
                    fail(f"Edited file exceeds {MAX_FILE_BYTES} bytes: {rel}")

            if hashlib.sha256(content).hexdigest() != expected_sha256:
                fail(f"Edited SHA-256 mismatch for {rel}")

            content, normalized = normalize_markdown_whitespace(rel, content)
            final_sha256 = hashlib.sha256(content).hexdigest()
            if normalized:
                print(f"MARKDOWN_WHITESPACE_NORMALIZED {rel}")

            total_bytes += len(content)
            if total_bytes > MAX_TOTAL_FILE_BYTES:
                fail("Total written file content exceeds installer limit.")

            target.write_bytes(content)

            if executable is True:
                target.chmod(0o755)
            elif executable is False:
                target.chmod(0o644)
            else:
                target.chmod(old_mode)

            operations.append({
                "path": rel,
                "action": "write",
                "sha256": final_sha256,
                "executable": executable,
            })


======================================================================
F) TEST-FEHLERMELDUNG AUF SCHEMA 3/4 ANPASSEN
======================================================================

ERSETZE:
            fail("Schema 3 requires automated Node tests, but none were found.")

DURCH:
            fail("Schema 3/4 requires automated Node tests, but none were found.")


======================================================================
G) SELF-TEST: BASELINE FÜR EDIT TEST
======================================================================

Im self_test(), direkt NACH:
        (seed / "unchanged.txt").write_text("protected baseline\n")

EINFÜGEN:
        (seed / "editme.txt").write_text("alpha beta gamma\n")


Direkt NACH der bestehenden Hilfsfunktion operation(...):

EINFÜGEN:

        def edit_operation(
            path: str,
            before: str,
            old: str,
            new: str,
            after: str,
        ) -> dict:
            before_raw = before.encode()
            after_raw = after.encode()
            return {
                "path": path,
                "action": "edit",
                "base_sha256": hashlib.sha256(before_raw).hexdigest(),
                "replacements": [{
                    "old_b64": base64.b64encode(old.encode()).decode(),
                    "new_b64": base64.b64encode(new.encode()).decode(),
                }],
                "sha256": hashlib.sha256(after_raw).hexdigest(),
            }


ERSETZE die bestehende manifest-Hilfsfunktion:

        def manifest(files: list[dict]) -> dict:
            return {"schema": 3, ...

DURCH:

        def manifest(files: list[dict], schema: int = 3) -> dict:
            return {
                "schema": schema,
                "repository": EXPECTED_REPOSITORY,
                "target_branch": TARGET_BRANCH,
                "ticket": "TOOLS-999999",
                "base_sha": base,
                "commit_message": "TOOLS-999999: Disposable installer self-test",
                "checks": {"require_tests": True},
                "files": files,
            }


======================================================================
H) SELF-TESTS FÜR V8 ERGÄNZEN
======================================================================

Direkt NACH:
        execute("valid-payload-single-branch", manifest([operation("ok.test.mjs", good_test)]))

EINFÜGEN:

        compact_repo = execute(
            "compact-edit-schema4",
            manifest([
                operation("ok.test.mjs", good_test),
                edit_operation(
                    "editme.txt",
                    "alpha beta gamma\n",
                    "beta",
                    "delta",
                    "alpha delta gamma\n",
                ),
            ], schema=4),
        )
        if (compact_repo / "editme.txt").read_text() != "alpha delta gamma\n":
            fail("Schema 4 compact edit produced wrong content")

        markdown_repo = execute(
            "markdown-whitespace-normalized",
            manifest([
                operation("ok.test.mjs", good_test),
                operation(
                    "notes.md",
                    "line with spaces   \nline with tab\t\n",
                ),
            ]),
        )
        if (markdown_repo / "notes.md").read_text() != (
            "line with spaces\nline with tab\n"
        ):
            fail("Markdown trailing whitespace was not normalized")


======================================================================
I) SICHERHEITSREGELN – DÜRFEN NICHT GEÄNDERT WERDEN
======================================================================

Folgende v7-Regeln müssen unverändert erhalten bleiben:

- TARGET_BRANCH = "develop"
- PROTECTED_PREFIXES = (".git", ".github")
- MAX_PAYLOAD_CHARS = 60_000
- exakter remote base_sha Check
- detach checkout auf base_sha
- git clean -fdx
- expected_paths == actual_paths
- conflict marker check
- node --check
- relative import check
- JSON check
- Docker:
  --network=none
  --read-only
  --user=65534:65534
  --cap-drop=ALL
  --security-opt=no-new-privileges
- HEAD darf während Tests nicht wechseln
- staged file set muss exakt expected_paths entsprechen
- Staged SHA-256 muss stimmen
- genau ein Commit
- Parent muss exakt base_sha sein
- committed file set muss exakt expected_paths entsprechen
- Workflow Push bleibt non-force auf develop

NICHT ÄNDERN:
.github/workflows/farm-ticket-installer.yml


======================================================================
J) ERWARTETES ERGEBNIS
======================================================================

Nach Patch:
- Schema 2: kompatibel
- Schema 3: kompatibel
- Schema 4: neu
- write: wie bisher + automatische Markdown-Bereinigung
- edit: kompakte exakte Byte-Ersetzungen
- delete: unverändert
- 60k bleibt Sicherheitsgrenze
- iPhone-Kurzbefehl bleibt unverändert
- normale FS-Payloads können künftig viel kleiner gebaut werden
