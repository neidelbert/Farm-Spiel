# FS-008 – Crop System

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

## Version
`0.3.0-dev`

## Ziel
Die Identität und grundlegenden Metadaten der aktuellen Pflanzenart aus verstreuten Hardcodes in einen kleinen zentralen Crop-Kern überführen, ohne den sichtbaren Gameplay-Ablauf bereits umzubauen.

## Neue Source-Dateien
- `src/data/crops.js`
- `src/systems/crops.js`

## Neue Tests
- `tests/crops.test.js`

## Aktueller Crop-Katalog
FS-008 enthält bewusst nur die bereits vorhandene Pflanze:

### `wheat`
- Anzeigename: `Weizen`
- Saatgut-Item: `wheatSeed`
- Ernte-Item: `wheat`
- Ziellager: `silo`
- Freischaltung: Level 1

Weitere Pflanzen werden nicht vorgezogen.

## CropSystem API
- `has(cropId)`
- `get(cropId)`
- `list()`
- `isUnlocked(cropId, level)`
- `listUnlocked(level)`
- `getSeedItem(cropId)`
- `getHarvestItem(cropId)`
- `getStorage(cropId)`

Unbekannte Crop-IDs erhalten keinen stillen Fallback.

## Bewusst nicht im Crop-Katalog
Noch nicht zentralisiert werden:
- Wachstumsdauer
- Düngerregeln
- Ertrag
- Verkaufspreise
- Saatgutpreise

Begründung:
Diese Werte gehören zu den Folgetickets für Growth, Harvest und Economy-Integration. FS-008 soll keine späteren Gameplay-Tickets vorziehen und insbesondere die bekannte aktuelle Weizen-Zeit nicht nebenbei verändern.

## Bewusst nicht verändert
- `src/Game.js`
- `src/config.js`
- `src/core/save.js`
- `src/systems/fields.js`
- `src/systems/timeSystems.js`
- Inventory
- Economy
- Missionen
- Vehicles
- Renderer / UI
- Welt / Kamera / Assets
- sichtbarer Spielablauf

## Tests
- CropSystem: 8 Unit-Subtests
- vorhandene Economy-, Field- und Inventory-Tests werden vom Installer erneut ausgeführt
- JavaScript-Syntax
- JSON-Validierung
- Scope-/Hash-/Base-SHA-Prüfung

Browser: `NOT TESTED`
Gameplay: `NOT TESTED`
Mobile: `NOT TESTED`

## STOP
Nach dem Implementierungs-Commit:
`READY_FOR_REVIEW`

FS-009 darf nicht automatisch gestartet werden.
