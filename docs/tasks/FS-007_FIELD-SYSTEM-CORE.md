# FS-007 – Field System Core

## Status
`APPROVED`

## Ausgangs-SHA
`b1dc4fda48642452defa8cfa6a9b1b4a3b98b9bd`

## Implementierungs-Commit
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

## Version
`0.3.0-dev`

## Ziel
Einen kleinen, testbaren `FieldSystem`-Kern für den bestehenden einzelnen Feldzustand einführen, ohne den aktuellen Tutorial-, Vehicle-, Save-, Growth-, Harvest- oder Renderer-Ablauf bereits umzubauen.

## Geänderte Source-Dateien
- `src/systems/fields.js` – neu

## Neue Tests
- `tests/fields.test.js` – neu

## FieldSystem API
- `getField()`
- `getStatus()`
- `getCrop()`
- `is(status)`
- `startSowing()`
- `startGrowing({ crop, plantedAt, readyAt })`
- `markReady()`
- `startHarvest()`
- `markHarvesting()`
- `setHarvestProgress(progress)`
- `markHarvested()`
- `resetPrepared()`

## Feldzustände
`prepared`
→ `sowing`
→ `growing`
→ `ready`
→ `harvest_starting`
→ `harvesting`
→ `harvested`
→ `prepared`

Ungültige Übergänge verändern den Feldzustand nicht.

## Save-Kompatibilität
Das bestehende `state.field`-Schema blieb unverändert.

## Bewusst nicht verändert
- `src/Game.js`
- `src/core/save.js`
- `src/systems/timeSystems.js`
- Saatgutkauf / Saatgutverbrauch
- Crop-Daten
- Wachstumszeit / Offline-Fortschritt
- Dünger
- Fahrzeugrouten
- Ernteertrag / Silo
- Missionen
- Renderer / UI
- Kamera / Welt / Assets
- Economy / Inventory

## Tests des echten Installer-Runs
- insgesamt 20 Node-Subtests: `PASS`
- davon FieldSystem: 10/10 `PASS`
- Economy: 4/4 `PASS`
- Inventory: 6/6 `PASS`
- Installer Scope-/Hash-/Base-SHA-Prüfung: `PASS`
- Remote-Push-Verifikation: `PASS`
- Browser: `NOT TESTED`
- Gameplay: `NOT TESTED`
- Mobile: `NOT TESTED`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

FS-008 wurde nach diesem Review freigegeben.
