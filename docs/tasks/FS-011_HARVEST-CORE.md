# FS-011 – Harvest Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`46fbd9c002e0073fd590375ff3fdd64178f1366f`

## Version
`0.3.0-dev`

## Ziel
Die Ernte aus der Tutorial-Mission lösen und als normalen, kapazitätssicheren Gameplay-Ablauf nutzbar machen. Erntebereitschaft, Mähdrescher-Verfügbarkeit, Ertrag, Lagerkapazität und Feld-Reset werden zentral über bestehende Domain-Systeme koordiniert.

## Was ändert sich im Spiel?
Reifer Weizen kann unabhängig vom Tutorial geerntet werden. Der Mähdrescher startet nur, wenn er verfügbar ist und die komplette Ernte ins Silo passt; nach erfolgreichem Einlagern wird das Feld wieder für die nächste Aussaat vorbereitet.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/config.js`
- `src/systems/harvest.js` – neu

## Neue Tests
- `tests/harvest.test.js`

## HarvestSystem API
- `getPlan()`
- `canStartHarvest()`
- `startHarvest()`
- `markHarvesting()`
- `finishCutting()`
- `canStoreHarvest()`
- `storeHarvest()`

## Technische Anforderungen
- HarvestSystem kennt keine Mission-IDs.
- Ernte kann bei Feldstatus `ready` unabhängig vom Tutorial gestartet werden.
- Mähdrescher muss im Maschinen-State verfügbar sein.
- Ertrag, Ernte-Item und Ziel-Lager kommen aus `CropSystem`.
- Feldübergänge laufen über `FieldSystem`.
- Lagerkapazität wird über `InventorySystem` geprüft.
- Die komplette Erntemenge muss vor Erntestart ins Ziel-Lager passen.
- Kein Teil-Ertrag und kein stilles Verwerfen bei zu wenig Lagerplatz.
- Falls der Lagerplatz zwischen Erntestart und Abladen unerwartet belegt wird, bleibt der Feldstatus `harvested` mit Crop-Daten erhalten und die Ernte kann nach Freimachen von Lagerplatz nachträglich eingelagert werden.
- Nach erfolgreichem Einlagern wird das Feld über `FieldSystem.resetPrepared()` auf `prepared` zurückgesetzt.
- Tutorial-Fortschritt bleibt eine optionale Reaktion in `Game.js`.
- Der Fahrzeug-Eventname wird von tutorialgebundenem `first_harvest` auf `harvest_wheat` umgestellt.
- Der doppelte `CONFIG.economy.wheatYield`-Wert wird entfernt; CropSystem ist alleinige Quelle für den Weizenertrag.

## Bewusst nicht umgesetzt
- kein Selling-Core; das gehört zu FS-012
- kein Dünger-Gameplay
- keine neuen Crop-Arten
- keine neuen Maschinen
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung
- keine Änderung der Erntefahrzeit oder Animationen
- keine Teilernte/Overflow-Box

## Tests
Vor dem Payload lokal reproduziert:
- JavaScript-Syntax `src/config.js`: `PASS`
- JavaScript-Syntax `src/Game.js`: `PASS`
- JavaScript-Syntax `src/systems/harvest.js`: `PASS`
- HarvestSystem: 10/10 `PASS`
- vorhandene + neue Node-Test-Suite: 58/58 `PASS`

Installer muss zusätzlich den vollständigen Repository-Stand erneut prüfen und testen.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-011: Decouple and secure harvest flow`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

FS-012 darf erst nach separatem ChatGPT-Review von FS-011 gestartet werden.
