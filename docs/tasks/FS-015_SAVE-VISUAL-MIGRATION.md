# FS-015 – Save/Visual Migration Cleanup

## Status
`APPROVED`

## Ausgangs-SHA
`4ef2ef3a807e59f8114318a0658f6b395d708b69`

## Implementierungs-Commit
`f8e7323547a5674a8592ac16925fcc0466c7b763`

## Version
`0.3.0-dev`

## Ziel
Die alte einmalige Fahrzeug-/Kartenkoordinaten-Migration aus `main.js` entfernen und kontrolliert in die versionierte Save-Migrationskette integrieren.

## Was ändert sich im Spiel?
Bestehende ältere Spielstände werden beim Laden genau einmal auf die aktuelle Kartenkoordinaten-Struktur gebracht. Bereits migrierte Fahrzeuge werden nicht doppelt skaliert.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-014-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die sechs vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- Save-Schema wurde auf v3 erhöht.
- Migrationskette v1 → v2 → v3 ist vorhanden.
- v2→v3 übernimmt die bisherigen Fahrzeug-/Routen-Skalierungsfaktoren.
- Bereits mit `visualVersion: 2` migrierte v2-Saves werden nicht erneut skaliert.
- Unmarkierte v2-Saves werden genau einmal skaliert.
- `visualVersion` wird nach der Migration entfernt.
- Wiederholtes Laden von v3-Saves ist idempotent.
- `main.js` enthält keine Koordinatenmigration mehr.
- Save-Hardening und Backup-Fallback bleiben erhalten.
- Kein Gameplay-, Welt-, Renderer- oder Kamera-Scope wurde vorgezogen.

## Tests
Save/Visual-Migration:
`PASS` – 17/17 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 85/85 Subtests

Installer-Workflow:
`PASS`

Remote-Push-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- Der LocalStorage-Key bleibt zur Kompatibilität `farm-spiel-save-v1`.
- Echte iPhone-Runtime-Migration ist weiterhin `NOT TESTED`.
- Andere Welt-/Interaktions-Source-of-Truth-Probleme sind nicht Bestandteil von FS-015.

## Abschluss
FS-015 ist abgeschlossen und `APPROVED`.

Als nächster Core-Schritt ist FS-016 – Fertilizer Core vorgesehen.
