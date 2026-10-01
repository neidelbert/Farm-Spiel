# FS-010 – Growth + Offline

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`4083558069a87209ba9114f446c2eaa7cedbf453`

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

## Technische Anforderungen
- Offline-Fortschritt ist zentral auf exakt 24 Stunden begrenzt.
- `lastSavedAt` bleibt die Basis für die Offline-Dauer.
- Feldwachstum verwendet weiterhin die in FS-008/FS-009 gesetzten absoluten `plantedAt`-/`readyAt`-Zeitpunkte.
- Feldstatus `growing -> ready` läuft über `FieldSystem`.
- Mühle, Hühner, Kühe und Construction werden beim Reload/Hintergrundbetrieb korrekt abgeschlossen, wenn ihre Timer innerhalb des erlaubten Offline-Fensters enden.
- Timer, die nach 24 Stunden noch nicht fertig wären, behalten ihre Restzeit; überschüssige Offline-Zeit darf sie nicht künstlich abschließen.
- Fahrzeuge bewegen sich offline nicht.
- Waypoint-Wartezeiten von Fahrzeugen pausieren offline ebenfalls, damit Fahrzeugbewegung und Wartezeit dieselbe Offline-Semantik besitzen.
- Beim Zurückkehren aus dem Browser-/App-Hintergrund wird der Offline-Abgleich erneut ausgeführt.
- DEV `timeScale` beschleunigt neben Tageszeit und Fahrzeugbewegung auch Feld-, Produktions-, Tier-, Bau- und aktive Fahrzeug-Warte-Timer.
- Der alte `CONFIG.timings.wheatGrowthMs` wird entfernt; die Weizen-Wachstumsdauer bleibt ausschließlich in der zentralen Crop-Definition.
- Bestehender Save-Key und `saveVersion: 1` bleiben unverändert.

## Bewusst nicht umgesetzt
- keine wiederholten Offline-Produktionszyklen
- keine Offline-Fahrzeugsimulation oder Teleportation
- keine neue Harvest-Logik
- kein Feld-Reset nach Ernte
- kein Verkaufssystem
- kein sichtbares Dünger-Gameplay
- keine Save-Schema-v2-Migration
- keine Renderer-/Kamera-/Weltänderung
- keine neuen Crop-Arten

## Tests
Vor dem Payload lokal reproduziert:
- JavaScript-Syntax `src/config.js`: `PASS`
- JavaScript-Syntax `src/systems/timeSystems.js`: `PASS`
- JavaScript-Syntax `src/main.js`: `PASS`
- TimeSystems: 8/8 `PASS`
- vorhandene + neue Node-Test-Suite: 48/48 `PASS`

Installer muss zusätzlich den vollständigen Repository-Stand erneut prüfen und testen.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-010: Stabilize growth and offline time`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

FS-011 darf erst nach separatem ChatGPT-Review von FS-010 gestartet werden.
