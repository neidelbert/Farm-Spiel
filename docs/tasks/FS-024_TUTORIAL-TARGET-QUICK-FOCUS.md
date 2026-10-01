# FS-024 – Tutorial Target Quick Focus

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`db3b652095ee49df019a4a153b3dc9985b3357bf`

## Ziel
Dem Spieler eine bewusste Schnellnavigation zum aktuellen Tutorialziel geben, ohne die freie Kamerasteuerung zu ersetzen.

## Im Spiel
Während des Tutorials erscheint unten ein `★ Ziel`-Button. Ein Tipp darauf bewegt die Kamera weich zum aktuell markierten Ziel wie Feld, Silo, Mühle oder Bäcker. Die Kamera springt nicht automatisch. Sobald der Spieler selbst verschiebt oder zoomt, wird die Kamerafahrt sofort abgebrochen.

## Technik
- `Camera.focusSmooth()` ergänzt die bestehende Kamera ohne `focus()` zu verändern.
- Zielkoordinaten werden an gültige Weltgrenzen geklemmt.
- Pan, Zoom oder `stop()` brechen eine laufende Ziel-Fahrt ab.
- `main.js` nutzt die vorhandene `TutorialGuidance` und die echten World-Interactions.
- Der Ziel-Button ist nur während des Tutorials sichtbar.
- Keine Änderung an Save, Wirtschaft, Missionen, Timern oder Weltpositionen.

## Tests
Lokale Kamera-Suite: `PASS` – 12/12.
JavaScript-Syntax von Kamera und `main.js`: `PASS`.
Vollständige Repository-Suite: `NOT TESTED` – wird vom Installer ausgeführt.
Browser / Gerät / Touch: `NOT TESTED`.

## Commit
`FS-024: Add tutorial target quick focus`

## STOP
Nach erfolgreichem Commit: `READY_FOR_REVIEW`.
