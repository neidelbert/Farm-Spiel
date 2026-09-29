# Farm-Spiel 0.3 – Event ID Audit
## Ticket
`FS-004 – Event ID Audit`
## Status
`READY_FOR_REVIEW`
## Basis
Branch: `develop`
Ausgangs-SHA: `9d339896f4bc1f0d7faa140b55b79f21ced53c80`
Version: `0.3.0-dev`
Geprüfte Quellen laut freigegebenem Ticket:
- `src/Game.js`
- `src/systems/vehicles.js`
- `src/systems/timeSystems.js`
- `src/main.js`
- `src/world/renderer.js`
Dieses Dokument inventarisiert die übergebenen, bereits von ChatGPT geprüften Befunde; es repariert keine IDs.
---
# 1. Basis
CURRENT: Die ID-Strings sind über mehrere Dateien verteilt.
TARGET: Unterschiedliche ID-Domänen eindeutig benennen und später zentral definieren.
SCOPE: Audit und Dokumentation, kein Sourcecode und keine Gameplay-Änderung.
---
# 2. Begriffe und ID-Domänen
| Domäne | Bedeutung | Beispiel |
|---|---|---|
| EventBus Event | Technische Nachricht zwischen Systemen | `vehicle:complete` |
| Vehicle `eventId` | Zweck eines konkreten Fahrzeugs | `sow_wheat` |
| Route Tag | Wegpunkt oder Aktion innerhalb einer Route | `sow` |
| Mission ID | Tutorial- und Progressionszustand, kein technisches Event | `first_seed` |
Ähnlich lautende Strings sind nicht automatisch dieselbe Art von ID.
`seed_delivery` kann beispielsweise Vehicle-`eventId` und Route Tag sein.
Mission IDs bleiben eine eigene Domäne und dürfen nicht mit technischen Events gleichgesetzt werden.
---
# 3. EventBus-Inventar
Aktuell nachgewiesene technische Events:
- `vehicle:spawn`
- `vehicle:arriveWaypoint`
- `vehicle:leaveWaypoint`
- `vehicle:complete`
- `field:ready`
- `mill:ready`
- `chickens:ready`
- `cows:ready`
- `construction:complete`
`src/systems/vehicles.js` erzeugt die vier `vehicle:*`-Events.
`src/systems/timeSystems.js` erzeugt die fünf Ready-/Complete-Events.
---
# 4. Vehicle-eventId-Inventar
Aktuell nachgewiesene Zwecke konkreter Fahrzeuge:
- `seed_delivery`
- `scrap_sale`
- `friend_gift`
- `sow_wheat`
- `first_harvest`
- `first_order`
- `miller_intro`
- `cow_delivery`
- `chicken_delivery`
- `baker_eggs`
- `baker_milk`
- dynamisch `build_${building}`
Bei aktuell verwendeten Gebäuden ergibt das insbesondere `build_silo` und `build_garage`.
`VehicleSystem.hasEvent(eventId)` prüft aktive Fahrzeuge auf dieser `eventId`-Ebene.
Eine Vehicle-`eventId` ist nicht selbst ein EventBus-Event.
---
# 5. Route-Tag-Inventar
Aktuell nachgewiesene Wegpunkt-/Aktions-Tags:
- `seed_delivery`
- `scrap_pickup`
- `gift_unload`
- `sow`
- `harvest`
- `unload_wheat`
- `order_pickup`
- `miller_arrive`
- `cows_unload`
- `chickens_unload`
- `baker_egg_delivery`
- `baker_milk_delivery`
- dynamisch `build_${building}`
Bei aktuell verwendeten Gebäuden ergibt das `build_silo` und `build_garage`.
Route Tags lösen hauptsächlich Aktionen beim Eintreffen oder Verlassen eines Waypoints aus.
Sie benennen nicht den übergeordneten Fahrzeugzweck.
---
# 6. Producer/Consumer Map
| EventBus Event | Producer | Nachgewiesener Consumer |
|---|---|---|
| `vehicle:spawn` | `systems/vehicles.js` | im übergebenen Inventar nicht benannt (`UNKNOWN`) |
| `vehicle:arriveWaypoint` | `systems/vehicles.js` | `Game.js` |
| `vehicle:leaveWaypoint` | `systems/vehicles.js` | `Game.js` |
| `vehicle:complete` | `systems/vehicles.js` | `Game.js`, zusätzlich `main.js` |
| `field:ready` | `systems/timeSystems.js` | `Game.js` |
| `mill:ready` | `systems/timeSystems.js` | `Game.js` |
| `chickens:ready` | `systems/timeSystems.js` | `Game.js` |
| `cows:ready` | `systems/timeSystems.js` | `Game.js` |
| `construction:complete` | `systems/timeSystems.js` | `Game.js` |
`vehicle:arriveWaypoint` und `vehicle:leaveWaypoint` transportieren die Route-Tag-Aktionen zur Gameplay-Logik.
Die übergeordnete Vehicle-`eventId` wird für fahrzeugbezogene Fallunterscheidungen verwendet.
---
# 7. Bestätigter Drift: Aussaat
CURRENT in `src/Game.js`: `eventId: "sow_wheat"`.
CURRENT in `src/world/renderer.js`: `v.eventId === "first_sow"`.
`"sow_wheat"` ist nicht identisch mit `"first_sow"`.
Mögliche Auswirkung: Die angehängte Sämaschinen-Grafik kann während der Aussaat über diese Renderer-Bedingung nicht aktiviert werden.
Status: `HIGH`.
Dies ist ein bestätigter ID-Drift; FS-004 ändert weder die IDs noch die Renderbedingung.
---
# 8. Verteilte `vehicle:complete`-Verantwortung
`Game.js` konsumiert `vehicle:complete` und behandelt `chicken_delivery` in `Game.onVehicleComplete()`.
`main.js` konsumiert `vehicle:complete` zusätzlich.
Bei `chicken_delivery` ruft `main.js` `game.finalizeChickenDelivery()` auf.
Der Missionszustand kann sich zuvor bereits geändert haben; eine doppelte Progression ist deshalb nicht zwingend nachgewiesen.
Die Verantwortung ist dennoch redundant und auf zwei Dateien verteilt.
Status: `MEDIUM / WATCH`.
FS-004 dokumentiert die Stelle, ohne sie zu reparieren.
---
# 9. Risiken
| Einstufung | CURRENT Risiko | Spätere Prüfung |
|---|---|---|
| `HIGH` | `sow_wheat` und `first_sow` weichen beim selben visuellen Vorgang ab | Event-/Renderer-Abgleich |
| `MEDIUM / WATCH` | `vehicle:complete` wird in `Game.js` und `main.js` konsumiert | Ownership und Chicken-Delivery-Ablauf |
| `MEDIUM` | IDs sind verteilt und teilweise ähnlich benannt | Zentrale Definition und eindeutige Domänentrennung |
Keine dieser Auffälligkeiten wird in FS-004 behoben.
---
# 10. Naming-Ziel
TARGET EventBus: `domain:action`, z. B. `vehicle:complete` oder `field:ready`.
TARGET Vehicle-`eventId`: `snake_case`, z. B. `sow_wheat` oder `first_harvest`.
TARGET Route Tag: `snake_case`, z. B. `unload_wheat` oder `chickens_unload`.
Mission IDs bleiben separat; `first_seed` ist kein EventBus-Event.
Diese Konventionen sind Empfehlungen für spätere Tickets, keine Umbenennungen dieses Audits.
---
# 11. Vorbereitung späterer Zentralisierung
TARGET, nur konzeptionell: getrennte Definitionen etwa `EVENTS`, `VEHICLE_EVENTS`, `ROUTE_TAGS`.
Vor einer Umsetzung Consumer und Producer derselben ID gemeinsam prüfen.
Dynamische `build_${building}`-IDs einschließlich `build_silo` und `build_garage` berücksichtigen.
Die Zuordnung von Vehicle-`eventId` zu Route Tags und Mission IDs ausdrücklich dokumentieren.
Die zwei `vehicle:complete`-Consumer auf eine eindeutige Zuständigkeit prüfen.
In FS-004 wird keine neue Source-Datei erstellt.
---
# 12. Fazit
Die vier ID-Domänen erfüllen verschiedene Aufgaben, obwohl manche Strings ähnlich aussehen.
Der bestätigte Drift `sow_wheat` / `first_sow` ist das wichtigste `HIGH`-Finding.
Der doppelte Consumer für Chicken-Delivery ist ein `MEDIUM / WATCH`-Finding.
Das Dokument ist die Grundlage für eine spätere kontrollierte Zentralisierung, keine Reparatur.
FS-005 wird nicht automatisch begonnen.
---
# 13. Teststatus
Remote-HEAD und erlaubte Dateipfade: vor dem Schreiben geprüft; nach dem Commit erneut zu verifizieren.
Sourcecode-Änderung: `NONE` im geplanten FS-004-Commit; nach dem Commit per Remote-Diff prüfen.
JavaScript-Syntax: `NOT TESTED` (kein vollständiger Syntaxlauf).
Browser: `NOT TESTED`.
Gameplay: `NOT TESTED`.
FPS/Memory: `NOT TESTED`.
Es werden keine nicht ausgeführten Runtime-Tests als bestanden behauptet.
