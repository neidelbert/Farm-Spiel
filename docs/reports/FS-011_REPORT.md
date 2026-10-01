# FS-011 – Development Report

## Ticket
`FS-011` – Harvest Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`46fbd9c002e0073fd590375ff3fdd64178f1366f`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

Der exakte Commit-SHA wird erst vom freigegebenen GitHub Ticket Installer erzeugt und im Review ergänzt. Es wird kein SHA vorgetäuscht.

## Ergebnis
Die Ernte wurde technisch vom Tutorial entkoppelt und als kapazitätssicherer Gameplay-Ablauf zentralisiert.

Neu:
- `src/systems/harvest.js`
- `tests/harvest.test.js`
- `docs/tasks/FS-011_HARVEST-CORE.md`
- `docs/reports/FS-011_REPORT.md`

Aktualisiert:
- `src/Game.js`
- `src/config.js`
- `docs/TASKS.md`

## Was ändert sich im Spiel?
Reifer Weizen kann unabhängig vom Tutorial geerntet werden. Der Mähdrescher startet nur, wenn die Maschine verfügbar ist und die vollständigen 10 Weizen ins Silo passen. Nach dem Einlagern wird das Feld wieder vorbereitet.

## Wichtige Änderungen
- Neues HarvestSystem bündelt Ernteplan, Start, Feldübergänge, Lagerprüfung, Einlagerung und Feld-Reset.
- HarvestSystem enthält keine Mission-IDs.
- Der Ertrag kommt ausschließlich aus der Crop-Definition.
- `CONFIG.economy.wheatYield` wurde entfernt.
- Mähdrescher-Verfügbarkeit wird vor Erntestart geprüft.
- Silo-Kapazität wird vor Erntestart geprüft.
- Bei zu wenig Platz startet die Ernte nicht.
- Wird der Lagerplatz während der Ernte unerwartet knapp, bleibt die Ernte erhalten und kann später eingelagert werden.
- Nach erfolgreicher Einlagerung wird das Feld wieder `prepared`.
- Das Fahrzeug nutzt den generischen Eventnamen `harvest_wheat`.
- Tutorial `first_harvest` reagiert weiterhin auf eine erfolgreiche erste Einlagerung, erzeugt aber die Erntefunktion nicht mehr.

## Tests vor Installer-Ausführung
JavaScript-Syntax `src/config.js`:
`PASS`

JavaScript-Syntax `src/Game.js`:
`PASS`

JavaScript-Syntax `src/systems/harvest.js`:
`PASS`

HarvestSystem:
`PASS` – 10/10 Subtests

Vorhandene + neue lokale Node-Test-Suite:
`PASS` – 58/58 Subtests

GitHub Ticket Installer:
`NOT TESTED` – wird erst beim Hochladen dieses Payloads ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- Der Verkauf der eingelagerten Ernte bleibt bis FS-012 weiterhin tutorialgebunden bzw. unvollständig.
- Es gibt weiterhin nur ein vollwertiges Gameplay-Feld.
- Der manuelle Wiederholungsweg für eine wegen nachträglich belegtem Silo zurückgehaltene Ernte erfolgt über das Feldpanel.
- Visuelle Ernteanimationen und Fahrzeiten bleiben unverändert.

## Bewusst nicht umgesetzt
- kein Selling-Core
- kein Dünger-Gameplay
- keine Multi-Field-Erweiterung
- keine Save-v2-Migration
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-011 auf ChatGPT-Review.
FS-012 wurde nicht begonnen.
