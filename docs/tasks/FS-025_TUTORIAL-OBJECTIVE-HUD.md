# FS-025 – Tutorial Objective HUD

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`29c59184900bd96724e4ba606b210ef9baad79a3`

## Ziel
Den aktiven Tutorialauftrag dauerhaft kompakt sichtbar machen, ohne ein Aktionsfenster öffnen zu müssen.

## Im Spiel
Direkt unter dem oberen HUD erscheint während Level 1–9 eine kleine Auftragskarte:
- oben `Aktueller Auftrag`
- darunter der Missionstitel, zum Beispiel `Die erste Saat`
- darunter das konkrete Missionsziel, zum Beispiel `Bestelle Weizensaat und säe dein erstes Feld mit dem Traktor.`

Bei einem Missionswechsel ändert sich die Karte automatisch. Nach Abschluss des Tutorials verschwindet sie. Der vorhandene `★ Ziel`-Button bleibt bestehen und kann weiterhin die Kamera zum Ziel führen.

## Technik
- `getTutorialObjective()` liest Titel und Ziel aus den bestehenden Missionsdaten.
- UI aktualisiert die Auftragskarte über den bereits laufenden HUD-Update.
- Karte ist nicht anklickbar und blockiert keine Touch-Eingaben auf der Spielwelt.
- Zieltext wird auf maximal zwei kompakte Zeilen begrenzt.
- Keine Änderung an Missionen, Wirtschaft, Save, Timern oder Progression.

## Tests
Lokaler FS-025-Fokus: `PASS` – 5/5.
Vollständige Repository-Suite: `NOT TESTED` – wird vom Installer ausgeführt.
Browser / Gerät / Touch: `NOT TESTED`.

## Commit
`FS-025: Add tutorial objective HUD`

## STOP
Nach erfolgreichem Commit: `READY_FOR_REVIEW`.
