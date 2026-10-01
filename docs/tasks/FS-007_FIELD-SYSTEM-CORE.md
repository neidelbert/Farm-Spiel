# FS-007 – Field System Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`b1dc4fda48642452defa8cfa6a9b1b4a3b98b9bd`

## Version
`0.3.0-dev`

## Ziel
Einen kleinen, testbaren `FieldSystem`-Kern für den bestehenden einzelnen Feldzustand einführen, ohne den aktuellen Tutorial-, Vehicle-, Save-, Growth-, Harvest- oder Renderer-Ablauf bereits umzubauen.

FS-007 schafft damit die zentrale Domain-API, auf die die Folgetickets Crop System, Planting Flow, Growth + Offline und Harvest Core aufbauen können.

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
Bestehende Runtime-Bezeichnungen bleiben erhalten:

- `prepared`
- `sowing`
- `growing`
- `ready`
- `harvest_starting`
- `harvesting`
- `harvested`

## Persistenter Zustand
FS-007 verändert das Save-Schema bewusst noch nicht.

Der bestehende Zustand bleibt:

```js
state.field = {
  status,
  crop,
  plantedAt,
  readyAt,
  harvestProgress
}
```

Damit bleiben vorhandene Spielstände und der aktuelle Runtime-Code kompatibel.

## Übergangsregeln
Der neue Core erlaubt nur die fachlich definierte Reihenfolge:

`prepared`
→ `sowing`
→ `growing`
→ `ready`
→ `harvest_starting`
→ `harvesting`
→ `harvested`
→ `prepared`

Ungültige Übergänge verändern den Feldzustand nicht und liefern `false`.

## Zeitregel
`startGrowing()` akzeptiert nur:
- einen nichtleeren Crop-Key
- endliche Zeitstempel
- `readyAt > plantedAt`

Die eigentliche Berechnung der Wachstumsdauer und Offline-Fortschritt bleiben ausdrücklich FS-010 vorbehalten.

## Bewusst noch nicht integriert
FS-007 verändert den aktuellen sichtbaren Spielablauf noch nicht.

Insbesondere nicht verändert:
- `src/Game.js`
- `src/core/save.js`
- `src/systems/timeSystems.js`
- Saatgutkauf oder Saatgutverbrauch
- Crop-Daten und Crop-Balancing
- Weizen-Wachstumszeit
- Offline-Wachstum
- Dünger
- Fahrzeugrouten
- Ernteertrag
- Silo-Verhalten
- Missionen
- Renderer / UI
- Kamera / Welt / Assets
- Farmercoins / Economy
- Inventory

Die Integration in echte Gameplay-Flows erfolgt schrittweise in:
- `FS-008` – Crop System
- `FS-009` – Planting Flow
- `FS-010` – Growth + Offline
- `FS-011` – Harvest Core

## Tests
Vor dem Installer-Push vorgesehen:
- neuer FieldSystem-Unit-Test: 10 Subtests
- vorhandene Economy-/Inventory-Tests erneut
- JavaScript-Syntax aller Module
- JSON-Validierung
- Installer Scope-/Hash-/Base-SHA-Prüfung

Browser: `NOT TESTED`
Gameplay: `NOT TESTED`
Mobile: `NOT TESTED`

## STOP
Nach dem Implementierungs-Commit:
`READY_FOR_REVIEW`

FS-008 darf nicht automatisch begonnen werden.
