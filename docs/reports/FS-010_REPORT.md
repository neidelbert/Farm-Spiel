# FS-010 – Development Report

## Ticket
`FS-010` – Growth + Offline

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`4083558069a87209ba9114f446c2eaa7cedbf453`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

Der exakte Commit-SHA wird erst vom freigegebenen GitHub Ticket Installer erzeugt und im Review ergänzt. Es wird kein SHA vorgetäuscht.

## Ergebnis
Die bestehende Timerlogik wurde zu einem konsistenten Offline-/Zeitmodell gehärtet.

Neu:
- `tests/timeSystems.test.js`
- `docs/tasks/FS-010_GROWTH-OFFLINE.md`
- `docs/reports/FS-010_REPORT.md`

Aktualisiert:
- `src/config.js`
- `src/systems/timeSystems.js`
- `src/main.js`
- `docs/TASKS.md`

## Was ändert sich im Spiel?
Pflanzen, Mühle, Tiere und Bauzeiten laufen nach dem Schließen oder Hintergrundbetrieb weiter, aber höchstens 24 Stunden; Fahrzeuge bleiben offline an ihrer Position und setzen ihre Fahrt erst beim Zurückkehren fort.

## Wichtige Änderungen
- Offline-Cap zentral auf 24 Stunden gesetzt.
- Überschüssige Offline-Zeit wird aus aktiven Domain-Timern herausgerechnet.
- Noch nicht fertige Timer behalten nach sehr langer Abwesenheit korrekt ihre Restzeit.
- Feld-Reife nutzt `FieldSystem.markReady()`.
- Mühle, Hühner, Kühe und Bauprojekte werden innerhalb des erlaubten Offline-Fensters korrekt abgeschlossen.
- Fahrzeugpositionen und RouteIndex werden offline nicht verändert.
- Aktive Fahrzeug-Wartezeiten pausieren offline ebenfalls.
- Sichtbarkeitswechsel zurück in die App löst erneut `reconcileState()` aus.
- DEV `timeScale` beschleunigt jetzt auch die absoluten Gameplay-Timer und Fahrzeug-Wartezeiten.
- Der alte 4-Minuten-Configwert für Weizen wurde entfernt; FS-009 nutzt weiterhin die zentrale 5-Minuten-Crop-Definition.

## Tests vor Installer-Ausführung
JavaScript-Syntax `src/config.js`:
`PASS`

JavaScript-Syntax `src/systems/timeSystems.js`:
`PASS`

JavaScript-Syntax `src/main.js`:
`PASS`

TimeSystems:
`PASS` – 8/8 Subtests

Vorhandene + neue lokale Node-Test-Suite:
`PASS` – 48/48 Subtests

GitHub Ticket Installer:
`NOT TESTED` – wird erst beim Hochladen dieses Payloads ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- Offline-Fahrzeugbewegung wird bewusst nicht simuliert. Fahrzeuge und ihre Wartephasen pausieren vollständig offline.
- Produktionssysteme erzeugen offline weiterhin höchstens den aktuell laufenden einzelnen Zyklus; automatische Mehrfachzyklen sind nicht Teil von FS-010.
- `saveVersion: 1` bleibt bestehen. Eine echte Save-Schema-Migration ist für spätere Save-Tickets vorgesehen.
- Der komplette wiederholbare Farming-Loop bleibt bis FS-011/FS-012 noch offen.

## Bewusst nicht umgesetzt
- keine Harvest-Entkopplung
- kein Feld-Reset nach Ernte
- kein Selling-Core
- kein Dünger-Gameplay
- keine Save-v2-Migration
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-010 auf ChatGPT-Review.
FS-011 wurde nicht begonnen.
