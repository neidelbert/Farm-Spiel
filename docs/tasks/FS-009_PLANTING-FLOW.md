# FS-009 – Planting Flow

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`aca0c62905c69a58f9b9fcc29c0a10cb0682cb3e`

## Version
`0.3.0-dev`

## Ziel
Saatgutkauf und Aussaat aus der Tutorial-Mission lösen und als normalen Gameplay-Ablauf nutzbar machen, ohne FS-010 bis FS-012 funktional vorwegzunehmen.

## Was ändert sich im Spiel?
Der Hofkatalog und die Weizen-Aussaat funktionieren nicht mehr nur während der ersten Saat-Mission; ein vorbereitetes Feld mit Saatgut kann unabhängig vom aktuellen Missionszustand bepflanzt werden.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/systems/planting.js` – neu

## Neue Tests
- `tests/planting.test.js`

## PlantingSystem API
- `getSeedPrice(cropId)`
- `canBuySeed(cropId)`
- `buySeed(cropId)`
- `receiveSeed(cropId, amount)`
- `canStartSowing(cropId)`
- `startSowing(cropId)`
- `completeSowing(cropId, plantedAt)`

## Technische Anforderungen
- PlantingSystem kennt keine Mission-IDs.
- Saatgutpreis kommt aus `EconomySystem`.
- Saatgut-Item und Wachstumsdauer kommen aus `CropSystem`.
- Feldübergänge laufen über `FieldSystem`.
- Saatgutlieferungen addieren tatsächlich jeden gekauften Sack und überschreiben keinen vorhandenen Bestand.
- Tutorial-Fortschritt bleibt als optionale Reaktion in `Game.js` erhalten.
- Der Hofkatalog bleibt während und nach der Einführung erreichbar.
- Die Aussaat startet bei vorbereitetem Feld + vorhandenem Saatgut unabhängig von `missionId`.
- Beim Abschluss der Aussaat wird genau ein Saatgutsack verbraucht.
- Die Weizen-Wachstumsdauer wird beim Pflanzen aus der zentralen Crop-Definition genommen: 5:00.

## Bewusst nicht umgesetzt
- kein Feld-Reset nach Ernte; das gehört zu FS-011
- keine neue Growth-/Offline-Logik; das gehört zu FS-010
- kein Dünger-Gameplay
- keine Harvest-Änderung
- keine Selling-Änderung
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung
- keine neue Crop-Art

## Tests
Vor dem Payload lokal reproduziert:
- JavaScript-Syntax `src/Game.js`: `PASS`
- JavaScript-Syntax `src/systems/planting.js`: `PASS`
- PlantingSystem: 8/8 `PASS`
- vorhandene + neue Node-Test-Suite: 40/40 `PASS`

Installer muss zusätzlich den vollständigen Repository-Stand erneut prüfen und testen.

Browser: `NOT TESTED`
Gameplay auf Gerät: `NOT TESTED`
Mobile/Touch: `NOT TESTED`

## Commit-Nachricht
`FS-009: Decouple planting flow from tutorial`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

FS-010 darf erst nach separatem ChatGPT-Review von FS-009 gestartet werden.
