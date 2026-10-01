# FS-021 – Multi-Field Core

## Status
`APPROVED`

## Ausgangs-SHA
`d92afe34be0a196c2495d6b8a4f1314f0973eddf`

## Ziel
Die drei sichtbaren Felder als getrennte persistente Field-States vorbereiten, ohne bestehende Spielstände oder die Wirtschaft zu verändern.

## Im Spiel
Feld 1 bleibt wie bisher spielbar. Feld 2 und Feld 3 erhalten eigene gespeicherte Zustände und echte Hitboxen, bleiben in FS-021 aber gesperrt. Dadurch entsteht noch kein 3×-Ertrag.

## Technik
- Save-Schema `v3 -> v4`.
- Das bisherige `field` wird nach `fields.field1` migriert.
- `field2` und `field3` werden getrennt angelegt und bleiben gesperrt.
- `FieldSystem` kann gezielt über `fieldId` arbeiten; alte Einzel-Feld-Testfixtures bleiben kompatibel.
- `TimeSystems` kann mehrere freigeschaltete Felder unabhängig fortschreiben.
- Fertilizer liest den adressierten Field-State.
- Renderer und World-UI lesen die neuen Field-States mit Feld-1-Legacy-Fallback.
- `WorldInteractionCore` unterstützt `field1`, `field2`, `field3`.
- Aussaat, Ernte und Maschinenrouten bleiben in FS-021 bewusst auf Feld 1.

## Tests
Lokaler FS-021-Fokus inkl. bestehender Field/Fertilizer/Save-Regressionen: `PASS` – 49/49.
Vollständige Repository-Suite: `NOT TESTED` – wird vom Installer ausgeführt.
Browser/Gerät/Touch: `NOT TESTED`.

## Installer
Payload-Schema 4 mit kompakten, hash-geprüften Datei-Edits.

## Commit
`FS-021: Introduce multi-field core`

## STOP
Nach erfolgreichem Commit: `READY_FOR_REVIEW`.

## Review
`APPROVED` by ChatGPT

Implementierungs-Commit:
`c0bb4ad35a2a912bfa2cc3eab2a34eaab638f607`

Vollständige Repository-Suite:
`PASS` – 163/163 Tests, 19 Testdateien.

Browser / Gerät / Touch:
`NOT TESTED`.
