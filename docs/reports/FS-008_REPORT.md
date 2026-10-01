# FS-008 – Review Report

## Ticket
`FS-008` – Crop System

## Status
`APPROVED`

## Ausgangs-SHA
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

## Erstimplementierung
`974c7f296917b88ffa974be5ec22c4f9dc8f42ba`

## Korrektur-Commit / Ergebnis-SHA
`bdecda772a65448cb7f8109ab59dc85d1718d337`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

## Implementierung
FS-008 stellt die aktuelle Pflanzenart als kleine zentrale Crop-Domain bereit.

Neu:
- `src/data/crops.js`
- `src/systems/crops.js`
- `tests/crops.test.js`
- `docs/tasks/FS-008_CROP-SYSTEM.md`

Zentral definiert sind für `wheat`:
- Crop-ID und Anzeigename
- Saatgut- und Ernte-Item
- Ziellager
- Unlock-Level
- Basis-Wachstumsdauer 5:00
- Ertrag 10
- Düngerregeln ab Level 4
- Dünger-Restwachstum 2:00
- Dünge-Cutoff bei 2:20 Restzeit
- vier geordnete Visual-Stufen mit den Asset-Katalog-Einträgen 134–137

## Review-Ergebnis
Geprüft wurde:
- Korrektur-SHA ist direkter Nachfolger der FS-008-Erstimplementierung
- der Source-Scope bleibt auf Crop-Daten, Crop-System und Crop-Tests begrenzt
- Anforderungen aus `STATE_AUDIT_0.3.md` für FS-008 sind als zentrale Domain-Datenquelle abgedeckt
- keine unbekannte Crop-ID fällt still auf Weizen zurück
- Crop-Definitionen und verschachtelte Regeln sind eingefroren
- Asset-Katalog 134–137 entspricht den vier Weizen-Wachstumsstufen
- sichtbarer Gameplay-Ablauf, Save-Schema, FieldSystem, TimeSystems, Economy, Inventory, Renderer und UI wurden nicht funktional vorgezogen
- die beim Korrektur-Commit versehentlich entfernten historischen FS-001–FS-007-Nachweise in `docs/TASKS.md` werden mit dem Review-Abschluss wiederhergestellt

## Tests
CropSystem:
`PASS` – 12/12 Node-Subtests

Gesamte vorhandene Node-Test-Suite:
`PASS` – 32/32 Subtests

JavaScript-Ausführung der geprüften Testmodule:
`PASS`

GitHub-Actions-Run direkt für `bdecda772a65448cb7f8109ab59dc85d1718d337`:
`NOT TESTED` – über die verfügbare GitHub-Abfrage war kein zugeordneter Run nachweisbar

Browser:
`NOT TESTED`

Gameplay:
`NOT TESTED`

Mobile:
`NOT TESTED`

## Bekannte Probleme / Risiken
- Die neue Crop-Domain ist in FS-008 bewusst noch nicht in den sichtbaren Runtime-Flow integriert. Bestehende alte Laufzeitwerte wie `CONFIG.timings.wheatGrowthMs` werden erst in den vorgesehenen Folgetickets kontrolliert abgelöst bzw. angebunden.
- Dadurch existieren bis zur Integration vorübergehend alte Laufzeitwerte neben der neuen zentralen Zieldefinition. FS-008 ändert das sichtbare Gameplay ausdrücklich noch nicht.
- Ein GitHub-Actions-Lauf des Korrektur-SHA konnte im Review nicht als ausgeführt nachgewiesen werden.

## Bewusst nicht umgesetzt
- kein unabhängiger Planting Flow
- keine Growth-/Offline-Integration
- keine Harvest-Integration
- keine Dünger-Kauflogik
- keine Renderer-Umstellung
- keine Save-Schema-Änderung
- keine Economy-/Inventory-Erweiterung
- keine Welt-, Kamera- oder Asset-Erweiterung

## Abschluss
FS-008 ist abgeschlossen und `APPROVED`.

FS-009 wurde nicht automatisch begonnen und bleibt bis zur ausdrücklichen Freigabe von Lukas unangetastet.
