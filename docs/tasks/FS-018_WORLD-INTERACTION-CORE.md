# FS-018 – World Interaction Core

## Status
`APPROVED`

## Ausgangs-SHA
`f1ebabee0955141362993dae4fa7dcae6a7300d5`

## Implementierungs-Commit
`b79c6256672b416092e9bd1bf709fb40a9e7f5c5`

## Version
`0.3.0-dev`

## Ziel
Die Tap-/Hitbox-Logik an dieselbe modulare Weltquelle koppeln, aus der die sichtbaren Gebäude und Felder gerendert werden.

## Was ändert sich im Spiel?
Gebäude und interaktive Weltobjekte reagieren dort auf einen Tap, wo sie sichtbar stehen. Die alten, teilweise abweichenden `WORLD_OBJECTS`-Hitboxen werden für `Renderer.objectAt()` nicht mehr verwendet.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-017-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt sieben vorgesehene Dateien wurden geändert bzw. neu angelegt.
- `WorldInteractionCore` ist als eigenes World-Interaction-Modell vorhanden.
- Interaktive Gebäude stammen aus den tatsächlich gerenderten modularen Objekten.
- `field1` verwendet die separat gerenderte Feldposition.
- `loading` und `harbor` sind kontrollierte Sonderinteraktionen.
- Dekoration, Vegetation und Zäune werden nicht automatisch interaktiv.
- Bounds verwenden dieselbe Anchor-Konvention wie die sichtbaren Sprites.
- Overlap-Auflösung berücksichtigt Layer und Y-Position.
- `Renderer.objectAt()` delegiert ausschließlich an `WorldInteractionCore`.
- `renderer.js` verwendet `WORLD_OBJECTS` nicht mehr zur Hit Detection.
- Construction-, Auswahl- und DEV-Debug-Bounds nutzen den Interaction-Core.
- Keine Gameplay-, Save-, Kamera-, Economy- oder Weltpositionsänderung wurde vorgezogen.

## Tests
World-Interaction-Fokustests:
`PASS` – 15/15 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 130/130 Subtests

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
- Event-Icons aus dem geerbten LegacyRenderer besitzen noch ältere Positionsquellen.
- `harbor` ist eine Bereichsinteraktion, kein einzelnes Sprite.
- Ein vollständiges gemeinsames World-Object-Modell für Placement, Visual und Interaction folgt schrittweise.

## Abschluss
FS-018 ist abgeschlossen und `APPROVED`.

Nächster Roadmap-Schritt:
`FS-019` – World UI Position Alignment.
