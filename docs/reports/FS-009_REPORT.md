# FS-009 – Development Report

## Ticket
`FS-009` – Planting Flow

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`aca0c62905c69a58f9b9fcc29c0a10cb0682cb3e`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

Der exakte Commit-SHA wird erst vom freigegebenen GitHub Ticket Installer erzeugt und im Review ergänzt. Es wird kein SHA vorgetäuscht.

## Ergebnis
Saatgutkauf und Aussaat wurden technisch vom Missionszustand entkoppelt.

Neu:
- `src/systems/planting.js`
- `tests/planting.test.js`
- `docs/tasks/FS-009_PLANTING-FLOW.md`
- `docs/reports/FS-009_REPORT.md`

Aktualisiert:
- `src/Game.js`
- `docs/TASKS.md`

## Wichtige Änderungen
- PlantingSystem bündelt Saatkauf, Saatgutannahme sowie Start und Abschluss der Aussaat.
- Hofkatalog ist nicht mehr ausschließlich an `first_seed` gebunden.
- Aussaat ist nicht mehr ausschließlich an `first_seed` gebunden.
- Saatgutlieferungen stapeln vorhandene Saat korrekt.
- `Game.js` nutzt für die Aussaat `FieldSystem` und `CropSystem` über PlantingSystem.
- Die neue zentrale Weizen-Wachstumsdauer von 5:00 wird beim Abschluss der Aussaat verwendet.
- Tutorial-Fortschritt bleibt erhalten, erzeugt aber die Funktion nicht mehr.

## Tests vor Installer-Ausführung
JavaScript-Syntax `src/Game.js`:
`PASS`

JavaScript-Syntax `src/systems/planting.js`:
`PASS`

PlantingSystem:
`PASS` – 8/8 Subtests

Vorhandene + neue lokale Node-Test-Suite:
`PASS` – 40/40 Subtests

GitHub Ticket Installer:
`NOT TESTED` – wird erst beim Hochladen dieses Payloads ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- `CONFIG.timings.wheatGrowthMs` enthält weiterhin den alten 4-Minuten-Wert. Der neue Planting Flow verwendet ihn nicht mehr; Bereinigung und zentrale Zeitlogik bleiben FS-010.
- Ein nach der Ernte auf `harvested` stehendes Feld wird in FS-009 bewusst noch nicht automatisch wieder vorbereitet. Der vollständige Ernte-/Reset-Lifecycle bleibt FS-011.
- Dadurch ist der Planting Flow missionsunabhängig, der komplette wiederholbare Farming-Loop aber noch nicht abgeschlossen.

## Bewusst nicht umgesetzt
- kein Offline-Cap / keine neue Offline-Simulation
- kein Düngersystem im sichtbaren Gameplay
- keine neue Erntelogik
- kein Verkaufssystem
- keine Save-Migration
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-009 auf ChatGPT-Review.
FS-010 wurde nicht begonnen.
