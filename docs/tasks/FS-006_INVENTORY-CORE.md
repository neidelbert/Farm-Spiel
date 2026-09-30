# FS-006 – Inventory Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`16b3966eb5404fae6224ed3d6b292c63b9e71d6f`

## Version
`0.3.0-dev`

## Ziel
Die bestehenden Item- und Lagerzugriffe des aktuellen Cores in ein zentrales `InventorySystem` überführen, ohne Save-Schema, Feldlogik, Crop-System, Missionstruktur oder Welt umzubauen.

## Geänderte Source-Dateien
- `src/systems/inventory.js` – neu
- `src/Game.js`

## InventorySystem API
- `getQuantity(container, item)`
- `getUsed(container)`
- `getCapacity(container)`
- `getFreeSpace(container)`
- `has(container, item, amount)`
- `hasAll(container, requirements)`
- `canAdd(container, amount)`
- `add(container, item, amount)`
- `remove(container, item, amount)`
- `removeMany(container, requirements)`

## Container
Bestehende persistente Strukturen bleiben unverändert:
- `state.inventory` – allgemeine, aktuell unbegrenzte Items
- `state.silo.items` + `state.silo.capacity`
- `state.barn.items` + `state.barn.capacity`

Es wurde kein neues Save-Schema eingeführt und keine Kapazität geändert.

## Integrierte Flows
- Schrott entfernen
- Weizensaat liefern und verbrauchen
- Weizen-Auftrag reservieren
- Silo-Anzeige und Kapazitätsprüfung
- Scheunen-Anzeige und Kapazitätsprüfung
- Mühle: Weizen entfernen / Mehl einlagern
- Hühner: Futter entfernen / Eier einlagern
- Kühe: Futter entfernen / Milch einlagern
- Bäckeraufträge atomar aus der Scheune entfernen
- Weizenernte in das Silo einlagern
- Starterfutter über das InventorySystem hinzufügen

## Kapazitätsregel
`InventorySystem.add()` schreibt nur, wenn der gesamte Betrag in den Zielcontainer passt.
Dadurch können Silo und Scheune nicht still über ihre Kapazität hinaus wachsen.

Fertige Mühlen-, Eier- und Milch-Ausgaben bleiben bei vollem Scheunenlager am Produktionsort erhalten.

## Bekannte Grenze
Der aktuelle einmalige Ernteablauf besitzt noch keine Fahrzeug-/Cargo-Zwischenlagerung.
Ist das Silo beim Entladen voll, verhindert FS-006 den Überlauf, kann die Ernte aber noch nicht als Fracht zurückhalten.
Dieses Harvest-Verhalten gehört in `FS-011` und wird hier bewusst nicht vorgezogen.

## Bewusst nicht verändert
- `src/core/save.js`
- Save-Version / Migration
- Silo-Startkapazität 40
- Scheunen-Startkapazität 30
- Feldsystem
- Crop-System
- Wachstum / Offline-Zeit
- Dünger
- wiederholbarer Farming-Loop
- Verkaufssystem
- Event-IDs
- Missionstruktur
- Renderer / Kamera / Welt / Assets

## Tests
- JavaScript-Syntax `src/Game.js`: PASS
- JavaScript-Syntax `src/systems/inventory.js`: PASS
- gezielte InventorySystem-Tests: PASS
- direkte Item-Zugriffe in `Game.js`: PASS – auf InventorySystem umgestellt
- Browser: NOT TESTED
- Gameplay: NOT TESTED
- vollständige Integration: NOT TESTED

## STOP
FS-007 darf nicht automatisch begonnen werden.
