# FS-008 – Crop System

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

## Erstimplementierung
`974c7f296917b88ffa974be5ec22c4f9dc8f42ba`

## Korrektur-Basis
`974c7f296917b88ffa974be5ec22c4f9dc8f42ba`

## Version
`0.3.0-dev`

## Ziel
Die zentrale Definition der aktuellen Pflanzenart vollständig als Domain-Datenquelle bereitstellen,
ohne den sichtbaren Gameplay-Ablauf bereits umzubauen.

## Source-Dateien
- `src/data/crops.js`
- `src/systems/crops.js`

## Tests
- `tests/crops.test.js`

## Zentral definierter Weizen
- Crop-ID: `wheat`
- Anzeigename: `Weizen`
- Saatgut-Item: `wheatSeed`
- Ernte-Item: `wheat`
- Ziellager: `silo`
- Freischaltung: Level 1
- Basis-Wachstum: 5:00
- Ertrag: 10 Weizen
- Dünger ab Level 4
- nach Dünger: 2:00 Restwachstum
- Düngen nur bei mehr als 2:20 Restzeit
- vier zentrale Growing-Visual-Stufen bei 20%, 45%, 70% und 100%

Die Definitionen werden in FS-009 bis FS-011 schrittweise tatsächlich in Gameplay, Wachstum,
Renderer und Ernte verwendet. FS-008 selbst verändert noch kein sichtbares Gameplay.

## CropSystem API
- `has(cropId)`
- `get(cropId)`
- `list()`
- `isUnlocked(cropId, level)`
- `listUnlocked(level)`
- `getSeedItem(cropId)`
- `getHarvestItem(cropId)`
- `getStorage(cropId)`
- `getGrowthDuration(cropId)`
- `getYieldAmount(cropId)`
- `getFertilizerRules(cropId)`
- `getVisualStages(cropId)`

## Bewusst nicht verändert
- `src/Game.js`
- `src/config.js`
- `src/core/save.js`
- `src/systems/fields.js`
- `src/systems/timeSystems.js`
- Economy / Inventory
- Missionen / Vehicles
- Renderer / UI
- Kamera / Welt / Assets
- sichtbarer Spielablauf

## Review-Hinweis
Die Erstimplementierung bestand alle technischen Tests, war gegenüber dem bestehenden
State-Audit aber zu schmal. Diese Korrektur ergänzt die dort geforderten zentralen
Crop-Werte, ohne Folgetickets funktional vorwegzunehmen.

## STOP
Nach dem Korrektur-Commit erneut:
`READY_FOR_REVIEW`

FS-009 darf erst nach erfolgreichem Review gestartet werden.
