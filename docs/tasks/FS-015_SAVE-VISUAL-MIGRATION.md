# FS-015 – Save/Visual Migration Cleanup

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`4ef2ef3a807e59f8114318a0658f6b395d708b69`

## Version
`0.3.0-dev`

## Ziel
Die alte einmalige Fahrzeug-/Kartenkoordinaten-Migration aus `main.js` entfernen und kontrolliert in die versionierte Save-Migrationskette integrieren.

## Was ändert sich im Spiel?
Bestehende ältere Spielstände werden beim Laden genau einmal auf die aktuelle Kartenkoordinaten-Struktur gebracht. Bereits migrierte Fahrzeuge werden nicht doppelt skaliert.

## Geänderte Source-Dateien
- `src/core/save.js`
- `src/main.js`

## Geänderte Tests
- `tests/save.test.js`

## Technische Anforderungen
- `CURRENT_SAVE_VERSION` steigt auf 3.
- Migrationskette: Legacy/v1 → v2 → v3.
- v2→v3 übernimmt die bisherige Skalierung aus `main.js`:
  - Fahrzeug x × 3.4
  - Fahrzeug y × 3.23
  - Fahrzeug speed × 3.2
  - Route x × 3.4
  - Route y × 3.23
- Ein v2-Spielstand mit `world.visualVersion === 2` gilt als bereits migriert und wird nicht erneut skaliert.
- Ein v2-Spielstand ohne diesen Marker wird einmalig skaliert.
- Nach v2→v3 wird `world.visualVersion` entfernt.
- Save-v3 besitzt keinen Visual-Migrationsmarker mehr.
- Wiederholtes Laden eines v3-Spielstands darf keine erneute Skalierung auslösen.
- `main.js` enthält keine Save-/Koordinatenmigration mehr.
- Save-Hardening und Backup-Fallback aus FS-013/014 bleiben erhalten.
- LocalStorage-Key bleibt zur Abwärtskompatibilität unverändert.
- Kein Gameplay oder Rendering-Verhalten außerhalb der Save-Migration wird verändert.

## Bewusst nicht umgesetzt
- keine Änderung des LocalStorage-Keys
- keine neue Weltgeometrie
- keine Kameraänderung
- keine Renderer-Änderung
- keine Gameplay-Änderung
- keine neue Vehicle-Route-Logik

## Tests
Vor Payload:
- JavaScript-Syntax `src/core/save.js`: `PASS`
- JavaScript-Syntax `src/main.js`: `PASS`
- JavaScript-Syntax `tests/save.test.js`: `PASS`
- Save/Visual-Migration-Tests: `PASS`

Die vollständige Repository-Test-Suite muss der Installer erneut ausführen.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-015: Centralize visual save migration`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das nächste Ticket wird nach dem FS-015-Review separat aus dem aktuellen Repository-Stand geplant.
