# FS-019 – World UI Position Alignment

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`bd4e140618d52b9c903e18e5556590de08760f7b`

## Version
`0.3.0-dev`

## Ziel
Weltgebundene UI-Hinweise und Kamera-Fokusziele an dieselben aktuellen Weltpositionen koppeln, die bereits für Rendering und Interaktion verwendet werden.

## Was ändert sich im Spiel?
Hinweis-Symbole wie `!`, 🌾, 📦, 🥚, 🥛 oder Upgrade-Pfeile erscheinen über dem tatsächlich sichtbaren Gebäude/Feld. Die Schnell-Fokusbuttons für Hof, Dorf und Hafen springen zu den aktuellen `MODULAR_WORLD.destinations` statt zu alten Hardcodes.

## Geänderte Source-Dateien
- `src/main.js`
- `src/world/renderer.js`
- `src/world/worldUi.js` – neu

## Neue Tests
- `tests/world-ui.test.js`
- `tests/world-ui-source.test.js`

## Technische Anforderungen
- Neues `worldUi`-Modul bündelt weltgebundene UI-Positionslogik.
- Bestehende Event-Icon-Regeln werden funktional beibehalten.
- Event-Icon-Positionen werden aus `WorldInteractionCore`-Bounds abgeleitet.
- Fehlende Interaktionsziele unterdrücken das Icon sicher statt auf alte Koordinaten zurückzufallen.
- Der aktuelle Renderer überschreibt die geerbte Legacy-`drawEventIcons()`-Positionierung.
- Event-Icons im aktuellen Renderer verwenden keine `WORLD_OBJECTS`.
- Hof-/Dorf-/Hafen-Fokus verwendet `MODULAR_WORLD.destinations`.
- Overview-Fokus verwendet Mittelpunkt und Maße der aktuellen Welt.
- Overview-Zoom bleibt responsive zum Viewport.
- Fokusziele werden bei Klick neu berechnet, damit Größen-/Orientierungsänderungen berücksichtigt werden.
- Keine Gameplay-Regel, Mission, Economy, Save-Daten oder Gebäude-/Objektposition wird geändert.
- LegacyRenderer bleibt unangetastet; der aktuelle Renderer übernimmt nur die weltgebundene UI-Positionierung.

## Bewusst nicht umgesetzt
- keine Weltobjektverschiebung
- keine neuen Icons
- keine UI-Neugestaltung
- keine neue Kamera-Steuerung
- keine Map-Erweiterung
- keine Placement-/Collision-Logik
- keine vollständige Entfernung des LegacyRenderer
- keine Änderung an Fahrzeugpositionen oder Routen

## Tests vor Payload
JavaScript-Syntax:
`PASS`
- `src/main.js`
- `src/world/renderer.js`
- `src/world/worldUi.js`
- `tests/world-ui.test.js`
- `tests/world-ui-source.test.js`

World-UI-Fokustests:
`PASS` – 13/13 Subtests

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom GitHub Ticket Installer ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-019: Align world UI positions`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das Folgeticket darf erst nach separatem ChatGPT-Review gestartet werden.
