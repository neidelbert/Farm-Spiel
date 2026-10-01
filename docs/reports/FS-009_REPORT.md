# FS-009 – Review Report

## Ticket
`FS-009` – Planting Flow

## Status
`APPROVED`

## Ausgangs-SHA
`aca0c62905c69a58f9b9fcc29c0a10cb0682cb3e`

## Implementierungs-Commit / Ergebnis-SHA
`fce6174e8082422e5145036d6d024b02f1e0c76d`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

## Ergebnis
Saatgutkauf und Aussaat wurden erfolgreich aus der Tutorial-Mission gelöst.

Neu:
- `src/systems/planting.js`
- `tests/planting.test.js`
- `docs/tasks/FS-009_PLANTING-FLOW.md`
- `docs/reports/FS-009_REPORT.md`

Aktualisiert:
- `src/Game.js`
- `docs/TASKS.md`

## Was ändert sich im Spiel?
Der Hofkatalog und die Weizen-Aussaat funktionieren nicht mehr nur während der ersten Saat-Mission; ein vorbereitetes Feld mit Saatgut kann unabhängig vom aktuellen Missionszustand bepflanzt werden.

## Review-Ergebnis
Geprüft wurde:
- erwarteter Parent-SHA stimmt
- Commit-Nachricht stimmt
- Commit-Scope entspricht exakt FS-009
- PlantingSystem ist missionsunabhängig
- EconomySystem liefert den Saatgutpreis
- CropSystem liefert Saatgut-Item und 5-Minuten-Wachstumsdauer
- FieldSystem übernimmt die Feldstatus-Übergänge
- mehrfache Saatgutlieferungen stapeln korrekt
- genau ein Saatgutsack wird beim Abschluss der Aussaat verbraucht
- Tutorial-Reaktion bleibt optional in `Game.js`
- keine Growth-/Offline-, Harvest-, Selling-, Save-, Renderer-, Kamera- oder Welt-Erweiterung wurde vorgezogen

## Tests
PlantingSystem:
`PASS` – 8/8 Subtests

Vorhandene + neue lokale Node-Test-Suite vor Installer:
`PASS` – 40/40 Subtests

Installer-Commit-Gate:
`PASS` – Commit `fce6174e8082422e5145036d6d024b02f1e0c76d` wurde durch den freigegebenen Farm-Spiel Ticket Installer auf `develop` erzeugt.

GitHub-Actions-Run-Metadaten:
`NOT TESTED` – der konkrete Workflow-Run konnte mit dem aktuellen Read-Zugriff nicht separat abgefragt werden.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- `CONFIG.timings.wheatGrowthMs` enthält weiterhin den alten 4-Minuten-Wert. FS-009 verwendet ihn beim Pflanzen nicht mehr. Die zentrale Zeit-/Offline-Bereinigung gehört zu FS-010.
- Nach einer Ernte bleibt das Feld weiterhin im Zustand `harvested`, bis FS-011 den vollständigen Ernte-/Reset-Lifecycle umsetzt.
- Der Planting Flow ist damit missionsunabhängig, der komplette wiederholbare Farming-Loop aber noch nicht vollständig geschlossen.

## Bewusst nicht umgesetzt
- kein Offline-Cap / keine neue Offline-Simulation
- kein Düngersystem im sichtbaren Gameplay
- keine neue Erntelogik
- kein Verkaufssystem
- keine Save-Migration
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
FS-009 ist abgeschlossen und `APPROVED`.

FS-010 wurde nicht automatisch begonnen.
