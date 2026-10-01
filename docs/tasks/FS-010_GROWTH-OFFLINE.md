# FS-010 – Growth + Offline

## Status
`APPROVED`

## Ausgangs-SHA
`4083558069a87209ba9114f446c2eaa7cedbf453`

## Implementierungs-Commit
`835f16b645f24c7f3f88e7f4ec1d94f2cf03edc7`

## Version
`0.3.0-dev`

## Ziel
Die vorhandenen absoluten Gameplay-Timer stabilisieren, Offline-Fortschritt auf maximal 24 Stunden begrenzen und den DEV-Zeitfaktor konsistent auf zeitbasierte Systeme anwenden, ohne Harvest-, Selling- oder Save-v2-Logik vorwegzunehmen.

## Was ändert sich im Spiel?
Pflanzen, Mühle, Tiere und Bauzeiten laufen nach dem Schließen oder Hintergrundbetrieb weiter, aber höchstens 24 Stunden; Fahrzeuge bleiben offline an ihrer Position und setzen ihre Fahrt erst beim Zurückkehren fort.

## Geänderte Source-Dateien
- `src/config.js`
- `src/systems/timeSystems.js`
- `src/main.js`

## Neue Tests
- `tests/timeSystems.test.js`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-009-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die sieben vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- Offline-Cap ist zentral auf 24 Stunden gesetzt.
- Feld-Reife läuft über `FieldSystem`.
- Mühle, Hühner, Kühe und Construction werden innerhalb des Offline-Fensters korrekt abgeschlossen.
- Restzeit bleibt erhalten, wenn eine Aktivität nach 24 Stunden noch nicht fertig wäre.
- Fahrzeuge bewegen sich offline nicht.
- Fahrzeug-Wartezeiten pausieren offline.
- Rückkehr aus dem Hintergrund löst `reconcileState()` erneut aus.
- DEV `timeScale` beschleunigt absolute Gameplay-Timer konsistent.
- Der alte `CONFIG.timings.wheatGrowthMs` wurde entfernt.
- Weizen nutzt weiterhin die zentrale 5-Minuten-Crop-Definition.
- Kein Harvest-, Selling- oder Save-v2-Scope wurde vorgezogen.

## Tests
JavaScript-Syntax:
`PASS`

TimeSystems:
`PASS` – 8/8 Subtests

Vorhandene + neue lokale Node-Test-Suite:
`PASS` – 48/48 Subtests

Installer-Commit-Gate:
`PASS` – der erwartete Commit wurde auf `develop` erzeugt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bewusst nicht umgesetzt
- keine wiederholten Offline-Produktionszyklen
- keine Offline-Fahrzeugsimulation
- keine neue Harvest-Logik
- kein Feld-Reset nach Ernte
- kein Verkaufssystem
- kein sichtbares Dünger-Gameplay
- keine Save-Schema-v2-Migration
- keine Renderer-/Kamera-/Weltänderung

## Abschluss
FS-010 ist abgeschlossen und `APPROVED`.

FS-011 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
