# FS-018 – World Interaction Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`f1ebabee0955141362993dae4fa7dcae6a7300d5`

## Version
`0.3.0-dev`

## Ziel
Die Tap-/Hitbox-Logik an dieselbe modulare Weltquelle koppeln, aus der die sichtbaren Gebäude und Felder gerendert werden.

## Was ändert sich im Spiel?
Gebäude und interaktive Weltobjekte reagieren dort auf einen Tap, wo sie sichtbar stehen. Die alten, teilweise abweichenden `WORLD_OBJECTS`-Hitboxen werden für `Renderer.objectAt()` nicht mehr verwendet.

## Geänderte Source-Dateien
- `src/world/renderer.js`
- `src/world/interactions.js` – neu

## Neue Tests
- `tests/interactions.test.js`
- `tests/renderer-interactions.test.js`

## Technische Anforderungen
- Neuer `WorldInteractionCore` verwaltet die interaktiven Weltobjekte.
- Interaktive Gebäude stammen aus den bereits von `FarmPolish` angepassten modularen Renderobjekten.
- `field1` übernimmt seine Position aus `MODULAR_WORLD.fields`, weil genau diese Position gerendert wird.
- `loading` bleibt ein expliziter Sonderfall an der sichtbaren Position des Verkaufstrucks.
- `harbor` bleibt als explizite, niedrig priorisierte Bereichsinteraktion erhalten.
- Dekoration, Vegetation, Zäune und sonstige Props sind nicht automatisch antippbar.
- Bounds berücksichtigen dieselbe Sprite-Anchor-Logik wie der Renderer.
- Bei überlappenden Interaktionen gewinnt zuerst die höhere Render-Layer.
- Bei gleicher Layer gewinnt das Objekt mit der späteren Y-Position.
- `Renderer.objectAt()` delegiert ausschließlich an den neuen Interaction-Core.
- `renderer.js` importiert `WORLD_OBJECTS` nicht mehr für Hit Detection.
- Construction-Markierung verwendet die neuen Interaction-Bounds.
- DEV-Debug zeichnet die tatsächlichen Interaction-Bounds.
- Auswahlmarkierung verwendet die neue Interaktionsfläche.
- Keine Gebäude- oder Feldposition wird durch FS-018 verändert.
- Keine Gameplay-, Economy-, Save-, Kamera- oder Renderer-Grafiklogik wird verändert.

## Interaktive IDs
- `farmhouse`
- `field1`
- `silo`
- `barn`
- `garage`
- `mill`
- `coop`
- `cowpen`
- `bakery`
- `mine`
- `sawmill`
- `church`
- `market`
- `fishery`
- `lighthouse`
- Sonderfall `loading`
- Bereich `harbor`

## Bewusst nicht umgesetzt
- keine Multi-Field-Gameplay-Erweiterung
- keine Objektverschiebung
- keine Placement-/Collision-Logik
- kein vollständiges World-Object-Schema mit Placement-Clearance
- keine Änderung an `FarmPolish`
- keine Änderung an Straßen/Wasser/Chunks
- keine neuen Gebäude oder Assets
- keine Renderer-Neuentwicklung
- keine Änderung der Event-Icon-Logik

## Tests vor Payload
JavaScript-Syntax:
`PASS`
- `src/world/interactions.js`
- `src/world/renderer.js`
- `tests/interactions.test.js`
- `tests/renderer-interactions.test.js`

World-Interaction-Fokustests:
`PASS` – 15/15 Subtests

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom GitHub Ticket Installer ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-018: Align world interaction hitboxes`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das Folgeticket darf erst nach separatem ChatGPT-Review gestartet werden.
