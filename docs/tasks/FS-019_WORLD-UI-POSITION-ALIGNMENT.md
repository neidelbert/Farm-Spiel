# FS-019 – World UI Position Alignment

## Status
`APPROVED`

## Ausgangs-SHA
`bd4e140618d52b9c903e18e5556590de08760f7b`

## Implementierungs-Commit
`226d06d13716f4a608e6444e01f289cf96d6cd9a`

## Version
`0.3.0-dev`

## Ziel
Weltgebundene UI-Hinweise und Kamera-Fokusziele an dieselben aktuellen Weltpositionen koppeln, die bereits für Rendering und Interaktion verwendet werden.

## Was ändert sich im Spiel?
Hinweis-Symbole wie `!`, 🌾, 📦, 🥚, 🥛 oder Upgrade-Pfeile erscheinen über dem tatsächlich sichtbaren Gebäude/Feld. Die Schnell-Fokusbuttons für Hof, Dorf und Hafen springen zu den aktuellen `MODULAR_WORLD.destinations` statt zu alten Hardcodes.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-018-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt acht vorgesehene Dateien wurden geändert bzw. neu angelegt.
- Neues `worldUi`-Modul bündelt weltgebundene UI-Positionen.
- Bestehende Event-Icon-Regeln bleiben funktional erhalten.
- Event-Icon-Positionen werden aus `WorldInteractionCore.bounds` abgeleitet.
- Fehlende Interaction-Ziele erzeugen kein falsch positioniertes Fallback-Icon.
- Der aktuelle Renderer überschreibt die Legacy-Event-Icon-Positionierung.
- Aktuelle Event-Icons verwenden keine `WORLD_OBJECTS`.
- Hof-/Dorf-/Hafen-Fokus verwendet `MODULAR_WORLD.destinations`.
- Overview-Fokus wird aus Weltmaßen und aktuellem Viewport berechnet.
- Alte Fokus-Hardcodes wurden entfernt.
- Keine Gameplay-, Save-, Economy-, Kamera- oder Objektpositionsänderung wurde vorgezogen.

## Tests
World-UI-Fokustests:
`PASS` – 13/13 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 143/143 Subtests

Installer-Workflow:
`PASS`

Push:
`PASS`

Remote-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- `POINTS`, `MODULAR_WORLD`, `FarmPolish` und einzelne Renderer-Hardcodes existieren weiterhin parallel.
- LegacyRenderer enthält weiterhin ältere Welt-/UI-Hilfen, die im aktuellen Renderer teilweise überschrieben werden.
- Die vollständige World-Source-Konsolidierung ist noch offen.

## Abschluss
FS-019 ist abgeschlossen und `APPROVED`.

Nächster Roadmap-Schritt:
`FS-020` – World Source Consolidation.
