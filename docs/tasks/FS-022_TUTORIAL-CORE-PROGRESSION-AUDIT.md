# FS-022 – Tutorial/Core Progression Audit

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`fe12410377d65a312d120551cc5ba078b3415c6a`

## Ziel
Den vorhandenen Level-1-bis-10-Tutorialfluss als explizite, prüfbare Progression absichern und direkte Missionswechsel in `Game.js` auf den `MissionSystem` zurückführen.

## Im Spiel
Der Ablauf bleibt inhaltlich gleich, reagiert aber robuster auf falsche Level-/Missionskombinationen. Level 1 bis 10 werden weiterhin in derselben Reihenfolge gespielt.

## Änderungen
- Expliziter `TUTORIAL_FLOW` für alle Tutorial-Missionen.
- Level 6 enthält bewusst `storage_upgrade` und danach `miller_intro`.
- `MissionSystem` validiert Missions-IDs, Schritte und Level-Zuordnung.
- `Game.advanceTo()` verwendet den `MissionSystem`.
- Übergang zur Mühle und Abschluss auf Level 10 laufen ebenfalls über den `MissionSystem`.
- Keine Änderung an Wirtschaft, Erträgen, Feldzeiten, Kartenlayout oder Freischaltungen.

## Tests
Lokaler FS-022-Fokus: `PASS` – 6/6.
Vollständige Repository-Suite: `NOT TESTED` – wird vom Installer ausgeführt.
Browser / Gerät / Touch: `NOT TESTED`.

## Commit
`FS-022: Harden tutorial core progression`

## STOP
Nach erfolgreichem Commit: `READY_FOR_REVIEW`.
