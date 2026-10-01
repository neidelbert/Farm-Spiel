# FS-020 – World Source Consolidation

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`d58b8e954b3c127be391d3f636c25156d56c13a8`

## Version
`0.3.0-dev`

## Ziel
Die noch verbliebenen aktuellen Laufzeit-Zugriffe auf `POINTS`, `ROAD_PATHS` und einzelne Renderer-Koordinaten auf eine gemeinsame Runtime-Weltquelle konsolidieren.

## Was ändert sich im Spiel?
Fahrzeuge, Maschinen, Feldziele, Lagerziele und sichtbare Hofdetails verwenden dieselben aktuellen Weltpositionen. Dadurch sollen Traktor, Mähdrescher, Lieferfahrzeuge und Verkaufspunkt nicht mehr auf ältere Positionsdaten zurückfallen.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/systems/vehicles.js`
- `src/world/renderer.js`
- `src/data/worldRuntime.js` – neu

## Neue Tests
- `tests/world-runtime.test.js`
- `tests/world-runtime-source.test.js`

## Technische Anforderungen
- Neues `worldRuntime`-Modul ist die zentrale Laufzeitquelle für Gameplay-/Vehicle-/Renderer-Weltanker.
- Sichtbare Gebäudeziele werden aus `MODULAR_WORLD.objects` abgeleitet:
  - Garage
  - Silo
  - Hühnerstall
  - Kuhbereich
  - Bäckerei
  - Mühle
- Feld 1 wird aus `MODULAR_WORLD.fields` abgeleitet.
- Haupt-Straßenanker werden aus `MODULAR_WORLD.roads` abgeleitet.
- `WORLD_ROADS` ist eine unveränderliche Kopie der modularen Straßen.
- Runtime-Sonderpunkte werden genau einmal zentral definiert:
  - Off-map Vehicle-Spawn
  - Verkaufstruck/Loading
  - Field-/Silo-/Garage-Approach
  - Mähdrescher-Parkplatz
  - sichtbare Schrottdetails
- `Game.js` importiert keine `POINTS` mehr aus `worldData.js`.
- `VehicleSystem` importiert keine `POINTS` mehr aus `worldData.js`.
- Der aktuelle `renderer.js` importiert weder `POINTS` noch `ROAD_PATHS` aus `worldData.js`.
- Renderer-Straßen verwenden `MODULAR_WORLD.roads` über `WORLD_ROADS`.
- Idle-Traktor verwendet die aktuelle modulare Garage.
- Idle-Mähdrescher verwendet den zentralen Runtime-Parkplatz.
- Verkaufstruck und dessen Interaction verwenden denselben zentralen Loading-Punkt.
- Sichtbare Schrottobjekte verwenden zentrale Runtime-Punkte.
- Fahrzeugrouten zu Silo, Garage, Hühnerstall, Kuhbereich, Bäckerei und Mühle verwenden die aktuellen modularen Zielpositionen.
- Bestehende Vehicle-Route-Struktur und Event-Tags bleiben erhalten.
- Kein Map-Layout, Asset, Gameplay-State, Economy-, Save-, Kamera- oder Interaktionsverhalten wird neu gestaltet.

## Bewusst nicht umgesetzt
- `worldData.js` wird nicht gelöscht; LegacyRenderer kann es weiterhin als Legacy-Quelle verwenden.
- keine vollständige LegacyRenderer-Ablösung
- keine neue Weltgeometrie
- keine Straßenverschiebung
- keine neuen Gebäude oder Felder
- keine Multi-Field-Gameplay-Erweiterung
- keine Placement-/Collision-Logik
- keine Vehicle-AI-Neuentwicklung
- keine Save-Migration

## Tests vor Payload
JavaScript-Syntax:
`PASS`
- `src/Game.js`
- `src/systems/vehicles.js`
- `src/data/worldRuntime.js`
- `src/world/renderer.js`
- `tests/world-runtime.test.js`
- `tests/world-runtime-source.test.js`

World-Runtime-Fokustests:
`PASS` – 13/13 Subtests

Quellabgleich:
`PASS` – `vehicles.js` entspricht bis auf den beabsichtigten Weltimport exakt dem aktuellen Repository-Stand.

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom GitHub Ticket Installer ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-020: Consolidate runtime world sources`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das Folgeticket wird erst nach separatem ChatGPT-Review aus dem dann aktuellen Repository-Stand festgelegt.
