# FS-020 – World Source Consolidation

## Status
`APPROVED`

## Ausgangs-SHA
`d58b8e954b3c127be391d3f636c25156d56c13a8`

## Implementierungs-Commit
`deacfb96a1178ced263be7964df36f16f22877e2`

## Version
`0.3.0-dev`

## Ziel
Die noch verbliebenen aktuellen Laufzeit-Zugriffe auf `POINTS`, `ROAD_PATHS` und einzelne Renderer-Koordinaten auf eine gemeinsame Runtime-Weltquelle konsolidieren.

## Was ändert sich im Spiel?
Fahrzeuge, Maschinen, Feldziele, Lagerziele und sichtbare Hofdetails verwenden dieselben aktuellen Weltpositionen. Traktor, Mähdrescher, Lieferfahrzeuge und Verkaufspunkt greifen damit nicht mehr auf ältere Laufzeit-Positionsquellen zurück.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-019-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt neun vorgesehene Dateien wurden geändert bzw. neu angelegt.
- Neues `worldRuntime`-Modul ist vorhanden.
- Gebäudeziele werden aus `MODULAR_WORLD.objects` abgeleitet.
- Feld 1 wird aus `MODULAR_WORLD.fields` abgeleitet.
- Straßenanker und Renderer-Straßen werden aus `MODULAR_WORLD.roads` abgeleitet.
- Runtime-Sonderpunkte sind zentral gebündelt.
- `Game.js`, `VehicleSystem` und aktueller Renderer verwenden keine `worldData.js`-POINTS mehr.
- Renderer-Hardcodes für Mähdrescher-Parkplatz und Schrottdetails wurden zentralisiert.
- Fahrzeugrouten zu aktuellen sichtbaren Gebäuden enden an den modularen Zielpositionen.
- `worldData.js` und `LegacyRenderer` wurden bewusst nicht gelöscht.
- Keine Map-, Gameplay-, Economy-, Save-, Kamera- oder Interaction-Neugestaltung wurde vorgezogen.

## Tests
World-Runtime-Fokustests:
`PASS` – 13/13 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 156/156 Subtests

Automatisierte Testdateien:
`PASS` – 18 Dateien

Installer-Workflow:
`PASS`

Push:
`PASS`

Remote-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- `LegacyRenderer` und `worldData.js` bestehen weiterhin für ältere geerbte Pfade.
- Einige Route-Approach-Punkte bleiben bewusst zentral definierte Runtime-Sonderpunkte.
- Die Welt besitzt visuell drei Felder, der persistente Gameplay-State aber weiterhin nur ein vollwertiges Feld.

## Abschluss
FS-020 ist abgeschlossen und `APPROVED`.

Nächster Roadmap-Schritt:
`FS-021` – Multi-Field Core.
