# FS-014 – Save Migration Hardening

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`97521efe5c0bbbcf5e4dd347f9bde4ab1759f6c9`

## Version
`0.3.0-dev`

## Ziel
Den in FS-013 eingeführten Save-v2-Migrationskern gegen beschädigte, unplausible und veraltete Daten härten, ohne legitimen Spielerfortschritt oder die noch bis FS-015 benötigte Visual-Migrationsmarkierung zu verlieren.

## Was ändert sich im Spiel?
Beschädigte oder falsche Speicherwerte werden beim Laden und Speichern kontrolliert bereinigt. Dadurch gelangen weniger kaputte Daten in Gameplay-Systeme und alte Spielstände bleiben stabiler.

## Geänderte Source-Dateien
- `src/core/save.js`

## Geänderte Tests
- `tests/save.test.js`

## Technische Anforderungen
- Root- und verschachtelte unbekannte Felder werden anhand des aktuellen State-Templates entfernt.
- `world.visualVersion` bleibt als ausdrücklich erlaubter Übergangswert erhalten, bis FS-015 die Visual-Migration zentralisiert.
- Boolesche Felder akzeptieren nur echte Booleans.
- Numerische Kernwerte müssen endlich und in gültigen Bereichen liegen.
- Negative Farmercoins, Inventarmengen, Lagerbestände und Tier-/Produktionsmengen werden nicht übernommen.
- Level/Kapazitäten müssen gültige positive Ganzzahlen sein.
- Feldstatus wird auf bekannte Zustände begrenzt.
- Feld-Timestamps akzeptieren nur null oder nichtnegative endliche Zahlen.
- Harvest-Fortschritt wird auf 0..1 begrenzt.
- Wetter wird auf die aktuell bekannten Werte begrenzt.
- TimeScale muss positiv sein.
- Construction und sideOrder akzeptieren nur Objekt oder null.
- Vehicles werden strukturell geprüft.
- Ein Fahrzeug mit kaputter Route, ungültiger Geschwindigkeit oder fehlenden Kern-IDs wird verworfen.
- Vehicle-Routenpunkte benötigen gültige x/y-Koordinaten.
- Unbekannte Vehicle-Felder werden entfernt.
- `SaveManager.save()` sanitisiert ebenfalls vor dem Schreiben und synchronisiert den bereinigten Stand zurück in den Live-State.
- Backup- und v1→v2-Migrationslogik aus FS-013 bleibt erhalten.
- LocalStorage-Key bleibt unverändert.
- Visual-Migration in `main.js` bleibt bis FS-015 unverändert.

## Bewusst nicht umgesetzt
- keine Verschiebung der Visual-Migration
- keine LocalStorage-Key-Umbenennung
- keine Gameplay-Änderung
- keine Welt-/Renderer-/Kameraänderung
- keine inhaltliche Mission-Reparatur
- keine semantische Rekonstruktion stark beschädigter Spielstände

## Tests
Vor Payload:
- JavaScript-Syntax `src/core/save.js`: `PASS`
- JavaScript-Syntax `tests/save.test.js`: `PASS`
- Save-Hardening-Tests: `PASS`

Die vollständige Repository-Test-Suite muss der Installer erneut ausführen.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-014: Harden save migration sanitization`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

FS-015 darf erst nach separatem ChatGPT-Review von FS-014 gestartet werden.
