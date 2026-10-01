# FS-018 – Development Report

## Ticket
`FS-018` – World Interaction Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`f1ebabee0955141362993dae4fa7dcae6a7300d5`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

## Ergebnis
Die sichtbare modulare Welt und die Tap-/Hitbox-Logik nutzen für interaktive Objekte jetzt dieselben Positionen.

## Was ändert sich im Spiel?
Ein Tap auf ein Gebäude trifft dessen tatsächliche sichtbare Position statt eine ältere, separat gepflegte Hitbox.

## Wichtige Änderungen
- Neuer `WorldInteractionCore`.
- Interaktive Gebäude werden aus den bereits angepassten modularen Renderobjekten abgeleitet.
- Feld 1 verwendet die gerenderte Feldposition.
- Verkaufstruck und Hafen besitzen explizite Sonderinteraktionen.
- Dekorationsobjekte bleiben nicht interaktiv.
- Bounds folgen Sprite-Breite, Höhe und Anchor.
- Overlap-Auflösung folgt Layer und Y-Sortierung.
- `Renderer.objectAt()` nutzt keine Legacy-`WORLD_OBJECTS` mehr.
- Construction- und DEV-Debug-Bounds folgen dem Interaction-Core.
- Auswahlmarkierung folgt den neuen Bounds.

## Tests vor Installer-Ausführung
World-Interaction-Fokustests:
`PASS` – 15/15 Subtests

JavaScript-Syntax:
`PASS`

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom Installer ausgeführt.

GitHub Ticket Installer:
`NOT TESTED`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- Die geerbte Event-Icon-Darstellung aus `LegacyRenderer` besitzt weiterhin ältere Positionsquellen und ist nicht Teil von FS-018.
- `harbor` ist bewusst eine Bereichsinteraktion, kein einzelnes Sprite.
- Es existiert noch kein vollständiges gemeinsames Placement-/Visual-/Interaction-Bounds-Schema für alle ~995 Weltobjekte.
- Echte Geräte-Taptests bleiben `NOT TESTED`.

## Bewusst nicht umgesetzt
- keine Weltverschiebungen
- keine Multi-Field-Gameplay-Erweiterung
- keine Placement-Validierung
- keine Renderer-Ablösung
- keine Asset-Änderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-018 auf ChatGPT-Review.
Das Folgeticket wurde nicht begonnen.
