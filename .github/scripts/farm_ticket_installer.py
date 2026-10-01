#!/usr/bin/env python3
"""Farm-Spiel long-lived ticket installer.

Trusted infrastructure lives on main. Ticket payloads target develop only.
The workflow invokes this script from the exact main commit that was dispatched.
This script validates the payload, applies only declared changes, performs static
checks, runs Node tests in a restricted Docker container, and creates one local commit.
The workflow performs the authenticated non-force push in a separate step.
"""

from __future__ import annotations

import base64
import gzip
import hashlib
import io
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path, PurePosixPath
from typing import NoReturn

EXPECTED_REPOSITORY = "neidelbert/Farm-Spiel"
EXPECTED_ACTOR = "neidelbert"
TARGET_BRANCH = "develop"
SUPPORTED_SCHEMAS = {2, 3, 4}
TICKET_RE = re.compile(r"(?:FS|TOOLS)-\d{3,6}")
SHA_RE = re.compile(r"[0-9a-f]{40}")
SHA256_RE = re.compile(r"[0-9a-f]{64}")
BASE64URL_RE = re.compile(r"[A-Za-z0-9_-]+")

MAX_PAYLOAD_CHARS = 60_000
MAX_JSON_BYTES = 8_000_000
MAX_FILES = 200
MAX_FILE_BYTES = 5_000_000
MAX_TOTAL_FILE_BYTES = 15_000_000
TEST_TIMEOUT_SECONDS = 180

PROTECTED_PREFIXES = (".git", ".github")
JS_SUFFIXES = {".js", ".mjs", ".cjs"}
TEST_SUFFIXES = (".test.js", ".test.mjs", ".test.cjs")
MARKDOWN_SUFFIXES = {".md", ".markdown"}
MAX_EDIT_REPLACEMENTS = 100
ROOT_KEYS_SCHEMA_2 = {
    "schema", "repository", "target_branch", "ticket", "base_sha",
    "commit_message", "files",
}
ROOT_KEYS_SCHEMA_3 = ROOT_KEYS_SCHEMA_2 | {"checks"}
ROOT_KEYS_SCHEMA_4 = ROOT_KEYS_SCHEMA_3
CHECK_KEYS_SCHEMA_3 = {"require_tests"}


def fail(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(
    *args: str,
    timeout: int | None = None,
    env: dict[str, str] | None = None,
    cwd: Path | None = None,
    clean_env: bool = False,
) -> subprocess.CompletedProcess[str]:
    if clean_env:
        merged_env = {
            "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
            "HOME": os.environ.get("HOME", "/tmp"),
            "LANG": os.environ.get("LANG", "C.UTF-8"),
            "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"),
        }
    else:
        merged_env = os.environ.copy()
    if env:
        merged_env.update(env)

    try:
        result = subprocess.run(
            args,
            text=True,
            capture_output=True,
            timeout=timeout,
            env=merged_env,
            cwd=str(cwd) if cwd else None,
        )
    except subprocess.TimeoutExpired:
        fail(f"Command timed out: {' '.join(args)}")

    if result.returncode != 0:
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        fail(f"Command failed ({result.returncode}): {' '.join(args)}")
    return result


def normalize_markdown_whitespace(rel: str, content: bytes) -> tuple[bytes, bool]:
    if PurePosixPath(rel).suffix.lower() not in MARKDOWN_SUFFIXES:
        return content, False
    normalized = re.sub(rb"[ \t]+(?=\r?$)", b"", content, flags=re.MULTILINE)
    return normalized, normalized != content


def decode_payload(payload_text: str) -> dict:
    payload_text = payload_text.strip()
    if not payload_text:
        fail("Ticket payload is empty.")
    if len(payload_text) > MAX_PAYLOAD_CHARS:
        fail(f"Ticket payload exceeds {MAX_PAYLOAD_CHARS} characters.")
    if not BASE64URL_RE.fullmatch(payload_text):
        fail("Ticket payload is not valid base64url text.")

    padded = payload_text + "=" * (-len(payload_text) % 4)
    try:
        compressed = base64.urlsafe_b64decode(padded.encode("ascii"))
        with gzip.GzipFile(fileobj=io.BytesIO(compressed), mode="rb") as gz:
            raw = gz.read(MAX_JSON_BYTES + 1)
        if len(raw) > MAX_JSON_BYTES:
            fail("Decoded manifest is too large.")
        manifest = json.loads(raw.decode("utf-8"))
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"Could not decode payload: {exc}")

    if not isinstance(manifest, dict):
        fail("Manifest root must be an object.")
    return manifest


def validate_manifest_shape(manifest: dict) -> tuple[int, bool]:
    schema = manifest.get("schema")
    if schema not in SUPPORTED_SCHEMAS:
        fail(f"Unsupported payload schema: {schema!r}")

    if schema == 2:
        allowed = ROOT_KEYS_SCHEMA_2
    elif schema == 3:
        allowed = ROOT_KEYS_SCHEMA_3
    else:
        allowed = ROOT_KEYS_SCHEMA_4
    unknown = set(manifest) - allowed
    missing = ROOT_KEYS_SCHEMA_2 - set(manifest)
    if unknown:
        fail(f"Unknown manifest keys for schema {schema}: {sorted(unknown)}")
    if missing:
        fail(f"Missing manifest keys: {sorted(missing)}")

    require_tests = False
    if schema in {3, 4}:
        checks = manifest.get("checks", {})
        if not isinstance(checks, dict):
            fail("Schema 3 checks must be an object.")
        unknown_checks = set(checks) - CHECK_KEYS_SCHEMA_3
        if unknown_checks:
            fail(f"Unknown schema 3 check keys: {sorted(unknown_checks)}")
        require_tests = checks.get("require_tests", False)
        if not isinstance(require_tests, bool):
            fail("checks.require_tests must be boolean.")

    return schema, require_tests


def validate_rel_path(rel: str, repo_root: Path) -> Path:
    if not isinstance(rel, str) or not rel:
        fail("Invalid empty file path.")
    if any(ord(c) < 32 for c in rel) or "\\" in rel:
        fail(f"Unsafe file path encoding: {rel!r}")

    posix = PurePosixPath(rel)
    if posix.is_absolute() or "." in posix.parts or ".." in posix.parts:
        fail(f"Unsafe file path: {rel}")

    if str(posix) != rel:
        fail(f"Non-canonical path: {rel}")
    cursor = repo_root
    for part in posix.parts:
        cursor = cursor / part
        if cursor.is_symlink():
            fail(f"Symlink paths are not allowed: {rel}")
    first = posix.parts[0] if posix.parts else ""
    if first in PROTECTED_PREFIXES:
        fail(f"Protected path is not writable by tickets: {rel}")

    target = (repo_root / Path(*posix.parts)).resolve()
    try:
        target.relative_to(repo_root)
    except ValueError:
        fail(f"Path escapes repository: {rel}")
    return target


def collect_actual_changes() -> set[str]:
    # Include staged changes and ignored new files; NUL delimiters preserve names.
    changed = set(run("git", "diff", "HEAD", "--name-only", "-z").stdout.split("\0"))
    untracked = set(run("git", "ls-files", "--others", "-z").stdout.split("\0"))
    return (changed | untracked) - {""}


def verify_declared_file_state(
    repo_root: Path,
    operations: list[dict],
    expected_paths: set[str],
) -> None:
    actual_paths = collect_actual_changes()
    if actual_paths != expected_paths:
        fail(
            "Changed-file set mismatch. "
            f"Expected {sorted(expected_paths)}, got {sorted(actual_paths)}."
        )

    for item in operations:
        rel = item["path"]
        target = validate_rel_path(rel, repo_root)
        action = item["action"]

        if action == "write":
            if not target.is_file():
                fail(f"Declared write target is missing or not a file: {rel}")
            actual_sha = hashlib.sha256(target.read_bytes()).hexdigest()
            if actual_sha != item["sha256"]:
                fail(f"Post-check SHA-256 mismatch for {rel}")
            executable = item.get("executable")
            if executable is not None:
                is_executable = bool(target.stat().st_mode & stat.S_IXUSR)
                if is_executable != executable:
                    fail(f"Executable-bit mismatch for {rel}")

        elif action == "delete":
            if target.exists() or target.is_symlink():
                fail(f"Declared deletion still exists: {rel}")


def check_conflict_markers(repo_root: Path, expected_paths: set[str]) -> None:
    markers = (b"<<<<<<< ", b"=======", b">>>>>>> ")
    for rel in sorted(expected_paths):
        path = repo_root / rel
        if not path.is_file():
            continue
        data = path.read_bytes()
        if b"\x00" in data:
            continue
        if any(marker in data for marker in markers):
            fail(f"Merge-conflict marker found in {rel}")


def check_relative_imports(repo_root: Path) -> None:
    # Lightweight browser-ESM import check. It intentionally verifies only
    # relative specifiers and strips browser cache-busting query/hash suffixes.
    patterns = (
        re.compile(r"(?:import|export)\s+(?:[^;\n]*?\s+from\s+)?[\"'](\.[^\"']+)[\"']"),
        re.compile(r"import\s*\(\s*[\"'](\.[^\"']+)[\"']\s*\)"),
    )
    for path in sorted(repo_root.rglob("*")):
        if not path.is_file() or path.suffix not in JS_SUFFIXES:
            continue
        if ".git" in path.parts or "node_modules" in path.parts:
            continue
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            fail(f"JavaScript file is not UTF-8: {path.relative_to(repo_root)}")
        for pattern in patterns:
            for match in pattern.finditer(source):
                specifier = match.group(1).split("?", 1)[0].split("#", 1)[0]
                resolved = (path.parent / specifier).resolve()
                try:
                    resolved.relative_to(repo_root)
                except ValueError:
                    fail(
                        f"Relative import escapes repository in {path.relative_to(repo_root)}: "
                        f"{match.group(1)}"
                    )
                if not resolved.is_file():
                    fail(
                        f"Missing relative import in {path.relative_to(repo_root)}: "
                        f"{match.group(1)}"
                    )


def run_static_checks(repo_root: Path, expected_paths: set[str]) -> None:
    run("git", "diff", "--check")
    check_conflict_markers(repo_root, expected_paths)

    if not shutil.which("node"):
        fail("Node.js is unavailable on the GitHub runner.")

    source_files = sorted(
        p
        for p in repo_root.rglob("*")
        if p.is_file()
        and ".git" not in p.parts
        and "node_modules" not in p.parts
        and p.suffix in JS_SUFFIXES
    )
    for path in source_files:
        rel = str(path.relative_to(repo_root))
        run("node", "--check", rel, timeout=30)

    check_relative_imports(repo_root)

    json_files = sorted(
        p
        for p in repo_root.rglob("*.json")
        if ".git" not in p.parts and "node_modules" not in p.parts
    )
    for path in json_files:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"Invalid JSON in {path.relative_to(repo_root)}: {exc}")


def create_test_snapshot(repo_root: Path, destination: Path) -> None:
    # Only ordinary files are admitted to the sandbox. Never mount Git metadata.
    destination.mkdir()
    for root, dirs, files in os.walk(repo_root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in {".git", ".github", "node_modules"}]
        for name in dirs + files:
            source = Path(root) / name
            if source.is_symlink():
                fail(f"Symlink is not allowed in test snapshot: {source}")
        relative = Path(root).relative_to(repo_root)
        target = destination / relative
        target.mkdir(exist_ok=True)
        target.chmod(0o755)
        for name in files:
            source = Path(root) / name
            if not stat.S_ISREG(source.stat().st_mode):
                fail(f"Non-regular file in test snapshot: {source}")
            shutil.copyfile(source, target / name)
            (target / name).chmod(0o644)


def sandbox_node(snapshot: Path, args: list[str]) -> subprocess.CompletedProcess[str]:
    image = os.environ.get("FARM_TEST_IMAGE", "")
    if not re.fullmatch(r"node@sha256:[0-9a-f]{64}", image):
        fail("FARM_TEST_IMAGE must be an immutable official Node image digest.")
    name = "farm-tests-" + uuid.uuid4().hex
    try:
        return run(
            "docker", "run", "--rm", "--name", name, "--pull=never",
            "--network=none", "--read-only", "--user=65534:65534",
            "--cap-drop=ALL", "--security-opt=no-new-privileges",
            "--pids-limit=128", "--memory=512m", "--memory-swap=512m", "--cpus=1",
            "--ulimit", "nofile=256:256",
            "--tmpfs", "/tmp:rw,noexec,nosuid,nodev,size=64m,mode=1777",
            "--mount", f"type=bind,src={snapshot},dst=/work,readonly",
            "--workdir=/work", "--env=HOME=/tmp", "--env=CI=1",
            "--env=NODE_ENV=test", "--env=TZ=UTC",
            "--entrypoint=node", image, *args,
            timeout=TEST_TIMEOUT_SECONDS, clean_env=True,
        )
    finally:
        # A killed client must not leave test processes alive on the runner.
        subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=30)


def run_node_tests(repo_root: Path, require_tests: bool) -> str:
    test_files = sorted(
        p for p in repo_root.rglob("*")
        if p.is_file() and not {".git", ".github", "node_modules"}.intersection(p.parts)
        and p.name.endswith(TEST_SUFFIXES)
    )
    if not test_files:
        if require_tests:
            fail("Schema 3/4 requires automated Node tests, but none were found.")
        print("AUTOMATED_TESTS NOT_FOUND")
        return "NOT_FOUND"
    with tempfile.TemporaryDirectory(prefix="farm-spiel-tests-") as tmp:
        snapshot = Path(tmp) / "repo"
        create_test_snapshot(repo_root, snapshot)
        result = sandbox_node(snapshot, ["--test", *["./" + str(p.relative_to(repo_root)) for p in test_files]])
        if result.stdout:
            print(result.stdout)
    print(f"AUTOMATED_TESTS PASS {len(test_files)} files")
    return f"PASS ({len(test_files)} files)"


def write_output(name: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        return
    if "\n" in value or "\r" in value:
        fail(f"Unsafe multiline workflow output: {name}")
    with open(output_path, "a", encoding="utf-8") as output:
        output.write(f"{name}={value}\n")


def main() -> None:
    repository = os.environ.get("FARM_REPOSITORY", "").strip()
    actor = os.environ.get("FARM_ACTOR", "").strip()
    target_branch = os.environ.get("FARM_TARGET_BRANCH", "").strip()
    payload_text = os.environ.get("FARM_PAYLOAD", "")

    if repository != EXPECTED_REPOSITORY:
        fail("Repository mismatch.")
    if actor != EXPECTED_ACTOR:
        fail("Unauthorized workflow actor.")
    if target_branch != TARGET_BRANCH:
        fail("Target branch mismatch.")

    repo_root = Path.cwd().resolve()
    if not (repo_root / ".git").is_dir():
        fail("Installer is not running inside a normal Git clone.")

    manifest = decode_payload(payload_text)
    schema, require_tests = validate_manifest_shape(manifest)

    if manifest.get("repository") != EXPECTED_REPOSITORY:
        fail("Payload repository mismatch.")
    if manifest.get("target_branch") != TARGET_BRANCH:
        fail("Payload target branch mismatch.")

    ticket = manifest.get("ticket")
    base_sha = manifest.get("base_sha")
    commit_message = manifest.get("commit_message")
    files = manifest.get("files")

    if not isinstance(ticket, str) or not TICKET_RE.fullmatch(ticket):
        fail("Invalid ticket ID. Expected FS-### or TOOLS-###.")
    if not isinstance(base_sha, str) or not SHA_RE.fullmatch(base_sha):
        fail("Invalid base SHA.")
    if (
        not isinstance(commit_message, str)
        or not re.fullmatch(rf"{re.escape(ticket)}: [^\r\n]{{1,160}}", commit_message)
    ):
        fail("Commit message must start with the exact ticket ID and a colon.")
    if not isinstance(files, list) or not (1 <= len(files) <= MAX_FILES):
        fail("Invalid file operation count.")

    run(
        "git", "fetch", "--quiet", "origin",
        f"refs/heads/{TARGET_BRANCH}:refs/remotes/origin/{TARGET_BRANCH}",
    )
    remote_sha = run("git", "rev-parse", f"origin/{TARGET_BRANCH}").stdout.strip()
    if remote_sha != base_sha:
        fail(f"Remote develop moved. Expected {base_sha}, found {remote_sha}.")

    run("git", "checkout", "--quiet", "--detach", base_sha)
    run("git", "clean", "-fdx")

    expected_paths: set[str] = set()
    operations: list[dict] = []
    total_bytes = 0

    for item in files:
        if not isinstance(item, dict):
            fail("Each file operation must be an object.")

        rel = item.get("path")
        action = item.get("action")
        if not isinstance(rel, str):
            fail("Every file operation needs a string path.")
        if rel in expected_paths:
            fail(f"Duplicate file operation: {rel}")

        target = validate_rel_path(rel, repo_root)
        expected_paths.add(rel)

        if action == "write":
            allowed_keys = {"path", "action", "content_b64", "sha256", "executable"}
            unknown = set(item) - allowed_keys
            if unknown:
                fail(f"Unknown write-operation keys for {rel}: {sorted(unknown)}")

            content_b64 = item.get("content_b64")
            expected_sha256 = item.get("sha256")
            executable = item.get("executable")
            if not isinstance(content_b64, str):
                fail(f"Missing content_b64 for {rel}")
            if not isinstance(expected_sha256, str) or not SHA256_RE.fullmatch(expected_sha256):
                fail(f"Missing or invalid sha256 for {rel}")
            if executable is not None and not isinstance(executable, bool):
                fail(f"executable must be boolean for {rel}")

            try:
                content = base64.b64decode(content_b64, validate=True)
            except Exception:
                fail(f"Invalid base64 file content for {rel}")

            if len(content) > MAX_FILE_BYTES:
                fail(f"File exceeds {MAX_FILE_BYTES} bytes: {rel}")
            total_bytes += len(content)
            if total_bytes > MAX_TOTAL_FILE_BYTES:
                fail("Total written file content exceeds installer limit.")
            if hashlib.sha256(content).hexdigest() != expected_sha256:
                fail(f"SHA-256 mismatch for {rel}")

            content, normalized = normalize_markdown_whitespace(rel, content)
            final_sha256 = hashlib.sha256(content).hexdigest()
            if normalized:
                print(f"MARKDOWN_WHITESPACE_NORMALIZED {rel}")

            old_mode = None
            if target.exists() and target.is_file():
                old_mode = stat.S_IMODE(target.stat().st_mode)

            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)

            if executable is True:
                target.chmod(0o755)
            elif executable is False:
                target.chmod(0o644)
            elif old_mode is not None:
                target.chmod(old_mode)

            operations.append({
                "path": rel,
                "action": "write",
                "sha256": final_sha256,
                "executable": executable,
            })

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
                unknown_replacement = set(replacement) - {"old_b64", "new_b64"}
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

        elif action == "delete":
            allowed_keys = {"path", "action"}
            unknown = set(item) - allowed_keys
            if unknown:
                fail(f"Unknown delete-operation keys for {rel}: {sorted(unknown)}")
            if target.exists() or target.is_symlink():
                if target.is_dir() and not target.is_symlink():
                    fail(f"Directory deletion is not allowed: {rel}")
                target.unlink()
            operations.append({"path": rel, "action": "delete"})

        else:
            fail(f"Unsupported action for {rel}: {action!r}")

    verify_declared_file_state(repo_root, operations, expected_paths)
    run_static_checks(repo_root, expected_paths)
    test_result = run_node_tests(repo_root, require_tests=require_tests)

    # Tests have no mount of this worktree, its index, the runner or credentials.
    if run("git", "rev-parse", "HEAD").stdout.strip() != base_sha:
        fail("HEAD changed while testing.")
    # Verify all declared bytes and both staged and unstaged changes before commit.
    verify_declared_file_state(repo_root, operations, expected_paths)

    run("git", "config", "user.name", "Farm-Spiel Ticket Installer")
    run("git", "config", "user.email", "farm-spiel-installer@users.noreply.github.com")
    run("git", "add", "-A", "--", *sorted(expected_paths))

    staged = {
        line.strip()
        for line in run("git", "diff", "--cached", "--name-only").stdout.splitlines()
        if line.strip()
    }
    if staged != expected_paths:
        fail("Staged-file set mismatch.")

    for item in operations:
        if item["action"] == "write":
            blob = subprocess.run(["git", "show", ":" + item["path"]], capture_output=True, check=True).stdout
            if hashlib.sha256(blob).hexdigest() != item["sha256"]:
                fail(f"Staged SHA-256 mismatch for {item['path']}")
    run("git", "-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", commit_message)
    result_sha = run("git", "rev-parse", "HEAD").stdout.strip()
    parent_sha = run("git", "rev-parse", "HEAD^").stdout.strip()
    if parent_sha != base_sha:
        fail("Created commit has the wrong parent SHA.")

    committed = {
        line.strip()
        for line in run(
            "git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"
        ).stdout.splitlines()
        if line.strip()
    }
    if committed != expected_paths:
        fail("Committed-file set mismatch.")

    write_output("ticket", ticket)
    write_output("result_sha", result_sha)
    write_output("test_result", test_result)
    write_output("schema", str(schema))
    print(f"READY_FOR_PUSH {ticket} {result_sha}")


def self_test() -> None:
    """Only disposable local repositories; never push or use a real ticket."""
    script = Path(__file__).resolve()
    original_cwd = Path.cwd()
    passes = []
    with tempfile.TemporaryDirectory(prefix="farm-installer-selftest-") as tmp:
        root = Path(tmp)
        origin = root / "origin.git"
        seed = root / "seed"
        run("git", "init", "--bare", str(origin))
        run("git", "init", "-b", "develop", str(seed))
        run("git", "config", "user.name", "Self Test", cwd=seed)
        run("git", "config", "user.email", "selftest@example.invalid", cwd=seed)
        (seed / "package.json").write_text('{"type":"module"}\n')
        (seed / "unchanged.txt").write_text("protected baseline\n")
        (seed / "editme.txt").write_text("alpha beta gamma\n")
        run("git", "add", ".", cwd=seed)
        run("git", "commit", "-qm", "self-test baseline", cwd=seed)
        base = run("git", "rev-parse", "HEAD", cwd=seed).stdout.strip()
        run("git", "remote", "add", "origin", str(origin), cwd=seed)
        run("git", "push", "-q", "origin", "develop", cwd=seed)
        run("git", "branch", "main", cwd=seed)
        run("git", "push", "-q", "origin", "main", cwd=seed)

        def clone(label: str) -> Path:
            path = root / label
            run("git", "clone", "--quiet", "--branch", "main", "--single-branch", str(origin), str(path))
            return path

        def operation(path: str, content: str) -> dict:
            raw = content.encode()
            return {"path": path, "action": "write", "content_b64": base64.b64encode(raw).decode(),
                    "sha256": hashlib.sha256(raw).hexdigest()}

        def edit_operation(path: str, before: str, old: str, new: str, after: str) -> dict:
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

        good_test = "import test from 'node:test'; import assert from 'node:assert/strict'; test('pass',()=>assert.equal(2+2,4));\n"

        def execute(label: str, data: dict, expected_error: str | None = None, work: Path | None = None) -> Path:
            work = work or clone(label)
            encoded = base64.urlsafe_b64encode(gzip.compress(json.dumps(data).encode())).decode().rstrip("=")
            env = {"PATH": os.environ["PATH"], "HOME": str(root), "LANG": "C.UTF-8",
                   "FARM_REPOSITORY": EXPECTED_REPOSITORY, "FARM_ACTOR": EXPECTED_ACTOR,
                   "FARM_TARGET_BRANCH": TARGET_BRANCH, "FARM_PAYLOAD": encoded,
                   "FARM_TEST_IMAGE": os.environ.get("FARM_TEST_IMAGE", "")}
            result = subprocess.run([sys.executable, str(script)], cwd=work, env=env,
                                    text=True, capture_output=True, timeout=300)
            logs = result.stdout + result.stderr
            if expected_error:
                if result.returncode == 0 or expected_error not in logs:
                    fail(f"Self-test {label} did not reject correctly: {logs}")
                if run("git", "rev-parse", "HEAD", cwd=work).stdout.strip() != base:
                    fail(f"Self-test {label} created a commit on failure")
            else:
                if result.returncode != 0:
                    fail(f"Self-test {label} failed: {logs}")
                if run("git", "rev-parse", "HEAD^", cwd=work).stdout.strip() != base:
                    fail("Self-test result parent mismatch")
                if run("git", "log", "-1", "--format=%s", cwd=work).stdout.strip() != data["commit_message"]:
                    fail("Self-test result message mismatch")
                actual = set(run("git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD", cwd=work).stdout.splitlines())
                if actual != {f["path"] for f in data["files"]}:
                    fail("Self-test result file mismatch")
            passes.append(label)
            print("SELFTEST PASS " + label)
            return work

        execute("valid-payload-single-branch", manifest([operation("ok.test.mjs", good_test)]))

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
                operation("notes.md", "line with spaces   \nline with tab\t\n"),
            ]),
        )
        if (markdown_repo / "notes.md").read_text() != (
            "line with spaces\nline with tab\n"
        ):
            fail("Markdown trailing whitespace was not normalized")
        bad = manifest([operation("ok.test.mjs", good_test)])
        bad["base_sha"] = "0" * 40
        execute("wrong-base", bad, "Remote develop moved")
        bad = manifest([operation("ok.test.mjs", good_test)])
        bad["files"][0]["sha256"] = "0" * 64
        execute("wrong-hash", bad, "SHA-256 mismatch")
        execute("protected-path", manifest([operation(".github/unwanted.yml", "x")]), "Protected path")
        execute("missing-required-tests", manifest([operation("new.txt", "x")]), "requires automated Node tests")
        execute("no-op", manifest([operation("unchanged.txt", "protected baseline\n")]), "Changed-file set mismatch")
        execute("failing-node-test", manifest([operation("bad.test.mjs", "import test from 'node:test'; test('fail',()=>{throw Error('expected')});\n")]), "Command failed")
        attack_repo = clone("sandbox-boundary")
        canary = root / "host-canary"
        canary.write_text("intact")
        attack_source = r'''import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
test('host files, git, credentials and write paths are inaccessible', () => {
  const targets = TARGETS;
  for (const target of targets) {
    assert.throws(() => fs.readFileSync(target));
    assert.throws(() => fs.writeFileSync(target, 'tampered'));
  }
  assert.equal(process.getuid(), 65534);
  for (const key of ['GH_TOKEN','GITHUB_TOKEN','GITHUB_OUTPUT','GITHUB_ENV','FARM_PAYLOAD']) assert.equal(process.env[key], undefined);
  assert.equal(fs.existsSync('/var/run/docker.sock'), false);
  assert.equal(fs.existsSync('/work/.git'), false);
  assert.equal(fs.existsSync('/work/.github'), false);
  assert.throws(() => fs.writeFileSync('/work/unchanged.txt', 'tampered'));
  fs.writeFileSync('/tmp/allowed', 'ok');
  assert.equal(fs.readFileSync('/tmp/allowed','utf8'),'ok');
  const status = fs.readFileSync('/proc/self/status', 'utf8');
  assert.match(status, /NoNewPrivs:\s+1/);
  assert.match(status, /CapEff:\s+0+/);
});
test('external network unavailable', async () => {
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({host:'1.1.1.1',port:443});
    socket.on('connect',()=>{socket.destroy();reject(Error('network escaped'));});
    socket.on('error',()=>resolve());
    socket.setTimeout(1500,()=>{socket.destroy();resolve();});
  });
});
'''.replace("TARGETS", json.dumps([str(canary), str(attack_repo / ".git/index"), str(attack_repo / "unchanged.txt")]))
        execute("sandbox-boundary", manifest([operation("boundary.test.mjs", attack_source)]), work=attack_repo)
        if canary.read_text() != "intact" or (attack_repo / "unchanged.txt").read_text() != "protected baseline\n":
            fail("Sandbox altered host files")

        index_repo = clone("staged-tampering")
        try:
            os.chdir(index_repo)
            (index_repo / "hidden.txt").write_text("unexpected")
            run("git", "add", "hidden.txt")
            if collect_actual_changes() != {"hidden.txt"}:
                fail("Staged tampering was not detected")
            passes.append("staged-tampering-detected")
            print("SELFTEST PASS staged-tampering-detected")
            (index_repo / ".gitignore").write_text("ignored.txt\n")
            (index_repo / "ignored.txt").write_text("unexpected")
            if "ignored.txt" not in collect_actual_changes():
                fail("Ignored new file was not detected")
            passes.append("ignored-file-detected")
            print("SELFTEST PASS ignored-file-detected")
        finally:
            os.chdir(original_cwd)
        remote = run("git", "ls-remote", str(origin), "refs/heads/develop").stdout.split()[0]
        if remote != base:
            fail("Self-test changed its remote develop")
        print(f"SELFTEST PASS {len(passes)}/{len(passes)}; disposable repositories only; no ticket pushed")
        summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary:
            with open(summary, "a") as out:
                out.write("## Installer isolation self-test: PASS\n\n")
                for label in passes:
                    out.write(f"- PASS: {label}\n")
                out.write("\nOnly temporary repositories used. Real develop unchanged. TOOLS-001 and FS-007 not run.\n")


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
    elif sys.argv[1:]:
        fail("Unknown command-line option")
    else:
        main()