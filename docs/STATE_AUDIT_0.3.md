# Farm-Spiel 0.3 – State Audit
## Ticket
`FS-003 – State Audit`
## Status
`READY_FOR_REVIEW`
## Basis
Branch:
`develop`
Ausgangs-SHA:
`be8b3af156f5dcb4143c170f01e1fc82b43aff0f`
Version:
`0.3.0-dev`
---
# 1. Zusammenfassung
Der aktuelle Stand ist kein leerer Prototyp.
Bereits vorhanden sind unter anderem:
- persistenter Game-State
- LocalStorage-Save mit Backup
- Missionen Level 1–10
- Fahrzeuge und Routen
- absolute Produktionstimer
- Touch-/Pointer-Steuerung
- Kamera mit Pan, Pinch-Zoom und Trägheit
- Canvas-Renderer
- Chunk-Culling
- Asset-Lader mit Speicherlimit
- 200 Assets im Katalog
- modulare Welt mit rund 995 Weltobjekten
- DEV-Modus
- Silo, Scheune, Werkstatt
- Mühle
- Hühner
- Kühe
- sichtbare Liefer- und Arbeitsfahrzeuge
Der größte technische Unterschied zum Zielsystem ist:
Der aktuelle Code ist stark missionsgesteuert.
Das Tutorial löst viele Kernmechaniken direkt aus, anstatt nur ein unabhängiges Gameplay-System zu erklären.
Der wichtigste 0.3-Core-Loop ist deshalb aktuell noch nicht frei wiederholbar.
---
# 2. Source-Modulkarte
| Datei | CURRENT Verantwortung | State Write | Events | Risiko |
|---|---|---:|---|---|
| `src/main.js` | Bootstrapping, Systemerzeugung, DOM-Bindings, Save-Hooks, alte Fahrzeug-Koordinatenmigration | teilweise | konsumiert `vehicle:complete` | `MEDIUM` |
| `src/config.js` | Version, Welt, Kamera, Timer, zentrale Economy-Werte | nein | nein | `LOW` |
| `src/Game.js` | zentrale Gameplay-Orchestrierung und großer Teil der Spiellogik | sehr stark | konsumiert/reaktiert | `HIGH` |
| `src/core/eventBus.js` | einfacher synchroner EventBus | nein | Kern | `LOW` |
| `src/core/save.js` | Initial-State, Load, Save, Backup, Deep Merge | ja | nein | `HIGH` für künftige Schemaänderungen |
| `src/systems/missions.js` | Zugriff auf Missionstexte und einfache Mission-Helfer | ja | nein | `MEDIUM` |
| `src/systems/timeSystems.js` | Wachstum, Produktion, Tiere, Bauzeiten, Tageszeit | ja | erzeugt Ready-/Complete-Events | `HIGH` |
| `src/systems/vehicles.js` | Fahrzeuge, Bewegung, Routen, Waypoints | ja | erzeugt Vehicle-Events | `HIGH` |
| `src/data/missions.js` | Missionstexte Level 1–10 | nein | nein | `LOW` |
| `src/data/worldData.js` | POINTS, WORLD_OBJECTS, ROAD_PATHS | nein | nein | `HIGH` wegen mehrerer Weltquellen |
| `src/data/modularWorld.js` | große modulare Weltbeschreibung | nein | nein | `MEDIUM` |
| `src/data/assetCatalog.js` | 200 Assetdefinitionen | nein | nein | `MEDIUM` |
| `src/world/camera.js` | Pan, Zoom, Clamp, Inertia, Koordinatenumrechnung | Kamera-State | nein | `LOW/MEDIUM` |
| `src/world/input.js` | Pointer-/Touch-Eingabe | Kamera indirekt | nein | `LOW` |
| `src/world/legacyRenderer.js` | ältere Renderbasis + weiterhin geerbte Renderer-Helfer | nein | nein | `MEDIUM` |
| `src/world/renderer.js` | aktueller modularer Canvas-Renderer | nein | nein | `HIGH` wegen Datenkopplung |
| `src/world/assetLoader.js` | Asset-Loading, Größenstufen, Cache | interner Cache | nein | `LOW/MEDIUM` |
| `src/world/farmPolish.js` | zusätzliche Hofdetails, Zäune, Bodenpass | nein | nein | `MEDIUM` |
| `src/ui/ui.js` | HUD, Panels, Toasts, DEV-Anzeige | nein | nein | `LOW` |
---
# 3. Aktueller Root-State
Quelle:
`src/core/save.js`
Der State besitzt aktuell mindestens:
- `saveVersion`
- `gameVersion`
- `lastSavedAt`
- `level`
- `xp`
- `xpNeeded`
- `money`
- `missionId`
- `missionStep`
- `tutorialComplete`
- `achievements`
- `inventory`
- `silo`
- `barn`
- `garage`
- `machines`
- `field`
- `mill`
- `bakery`
- `chickens`
- `cows`
- `construction`
- `sideOrder`
- `vehicles`
- `world`
- `settings`
Alle wesentlichen Gameplay-Bereiche liegen gemeinsam in einem großen persistenten Objekt.
---
# 4. State Ownership
| State | CURRENT Writer | Persistiert | TARGET |
|---|---|---|---|
| Geld | `Game.js`, DEV | ja | EconomySystem |
| Saatgut | `Game.js` | ja | InventorySystem |
| Silo | `Game.js`, Time/Events | ja | InventorySystem |
| Scheune | `Game.js` | ja | InventorySystem |
| Feld | `Game.js`, TimeSystems | ja | FieldSystem |
| Maschinen | `Game.js` | ja | MachineSystem |
| Gebäude | `Game.js` | ja | BuildingSystem |
| Mühle | `Game.js`, TimeSystems | ja | ProductionSystem |
| Tiere | `Game.js`, TimeSystems | ja | AnimalSystem |
| Mission | `Game.js`, MissionSystem | ja | MissionSystem |
| Fahrzeuge | VehicleSystem + `Game.js` Reaktionen | ja | VehicleSystem |
| Welt | Game/Time/DEV | ja | WorldSystem |
| Save | SaveManager | LocalStorage | SaveSystem |
`MISMATCH`:
Mehrere Systeme schreiben direkt in denselben Root-State.
Klare Ownership-Grenzen existieren noch nicht.
---
# 5. Game.js
`src/Game.js` ist mit rund 28 KB der zentrale Gameplay-Knoten.
Es besitzt gleichzeitig Verantwortungen für:
- Game Loop
- Autosave
- Missionen
- Economy
- Saatkauf
- Inventar
- Aussaat
- Ernte
- Lager
- Maschinen
- Gebäudeupgrades
- Mühle
- Hühner
- Kühe
- Bäcker
- Fahrzeugevents
- UI-Panels
- Fortschritt
- DEV-Funktionen
## Methodenzuordnung
| Methode/Gruppe | CURRENT | TARGET |
|---|---|---|
| `start`, `stop`, `update` | Hauptloop | Game |
| `reconcileState` | Offline + Vehicle-Sanitizing | Save/Time |
| `installEventHandlers` | zentrale Event-Reaktionen | mehrere Systeme |
| `handleTap`, `openObject` | Interaktion | InteractionSystem |
| `openFarmhouse`, `progressText` | Mission + UI | MissionSystem/UI |
| `openCatalog`, `buyWheatSeed` | Kauf + Lieferung | Economy/Inventory |
| `startScrapSale` | Verkauf + Mission | Selling/Economy |
| `startFriendGift` | Maschinenfreischaltung | Machine/Mission |
| `openField`, `startSowing` | Feld/Saat | Field/Crop |
| `startHarvest` | Ernte/Maschine | Field/Machine |
| `startFirstOrder` | Verkauf | SellingSystem |
| `openSilo`, `openBarn` | Lager | InventorySystem |
| `openGarage`, `startConstruction` | Gebäude/Maschinen | Building/Machine |
| Mühlenmethoden | Produktion | ProductionSystem |
| Hühner-/Kuhmethoden | Tiere/Produktion | AnimalSystem |
| Bäckermethoden | Auftrag/Produktion | Selling/Production |
| Vehicle callbacks | Mutationen fast aller Systeme | Event-/Systemgrenzen |
| `advanceTo` | Fortschritt | MissionSystem |
| DEV-Methoden | Debug | DevSystem |
`HIGH`:
Game.js ist aktuell ein God-Object-ähnlicher Orchestrator.
Es soll nicht komplett neu geschrieben werden, sondern schrittweise Verantwortung abgeben.
---
# 6. Economy
Zentrale Werte in `CONFIG.economy`:
| Wert | CURRENT |
|---|---:|
| Schrottverkauf | 100 |
| Weizensaat | 10 |
| Weizenertrag | 10 |
| erster Auftrag | 35 |
| Silo-Upgrade | 60 |
| Müller-Belohnung | 100 |
| Werkstatt-Upgrade | 100 |
| Bäcker Eier | 80 |
| Bäcker Milch | 120 |
Weitere wirtschaftliche Regeln sind weiterhin direkt in Gameplay-Code eingebaut.
Beispiele:
- Mühle: 5 Weizen → 2 Mehl
- Hühner: 2 Weizen Futter
- Eierproduktion: 4 Eier
- Kühe: 2 Weizen Futter
- Milchproduktion: 2 Milch
- Bäcker: 1 Mehl + 2 Eier
- Bäcker: 1 Mehl + 1 Milch
- Starterfutter nach Werkstatt: +4 Weizen
- Silo Level 2: Kapazität 60
Es existiert aktuell keine zentrale Economy-API.
`state.money` wird direkt verändert.
---
# 7. Währung
`index.html` zeigt im normalen HUD bereits:
`F`
für Farmercoins.
Gleichzeitig enthalten `Game.js` und das DEV-Menü weiterhin zahlreiche `$`-Strings.
Beispiele:
- `+100 $`
- `35 $`
- Saatpreis mit `$`
- Upgradepreise mit `$`
- `+1.000 $`
Status:
`MISMATCH`
TARGET:
Farmercoins `F` konsistent im gesamten Spiel.
Geplantes Ticket:
`FS-005`
---
# 8. Inventar und Lager
CURRENT Datenmodell:
## Allgemeines Inventory
- Schrott
- Weizensaat
## Silo
- Weizen
- Kapazität 40 zum Start
## Scheune
- Mehl
- Eier
- Milch
- Kapazität 30 im aktuellen Code
Es existiert keine zentrale Inventory-API.
Hinzufügen und Entfernen erfolgt direkt:
`state.silo.items.wheat += ...`
oder vergleichbar.
`totalItems()` wird hauptsächlich für die Anzeige verwendet.
`HIGH`:
Kapazität wird beim tatsächlichen Hinzufügen von Waren aktuell nicht zentral erzwungen.
Waren können damit technisch über die dargestellte Lagerkapazität hinaus hinzugefügt werden.
TARGET:
Kein stilles Verschwinden und zentrale Kapazitätsprüfung.
---
# 9. Feldsystem
Der persistente Gameplay-State besitzt aktuell genau:
`state.field`
Damit existiert technisch nur **ein vollwertiges Gameplay-Feld**.
Feldzustände:
- `prepared`
- `sowing`
- `growing`
- `ready`
- `harvest_starting`
- `harvesting`
- `harvested`
Daten:
- `crop`
- `plantedAt`
- `readyAt`
- `harvestProgress`
Saatverbrauch:
1 Weizensaat.
Ertrag:
10 Weizen.
CURRENT Wachstumszeit:
4 Minuten.
TARGET Master:
5 Minuten Basiswachstum.
Status:
`MISMATCH`
---
# 10. Visuelle Felder
`MODULAR_WORLD.fields` enthält:
- field1
- field2
- field3
Feld 1 wird im Renderer anhand des echten Gameplay-State dargestellt.
Feld 2 und Feld 3 werden derzeit als feste visuelle Felder gerendert.
Sie besitzen keinen gleichwertigen persistenten Field-State wie Feld 1.
Status:
`MISMATCH`
TARGET:
datengetriebene mehrere Felder.
---
# 11. Wiederholbarer Farming-Loop
Dies ist der wichtigste Befund des Audits.
Nach einer Ernte setzt der Code:
`field.status = "harvested"`
Es existiert im normalen Gameplay derzeit kein vollständiger Ablauf, der das Feld danach wieder auf:
`prepared`
zurückführt.
Zusätzlich sind:
- Saatkauf
- normale Aussaat
- mehrere Verkäufe
stark an die Tutorial-Mission gekoppelt.
Damit ist der gewünschte Loop:
Farmercoins  
→ Saat  
→ Pflanzen  
→ Wachstum  
→ Ernte  
→ Lager  
→ Verkauf  
→ erneut Saat
aktuell **nicht frei wiederholbar**.
Status:
`BLOCKER`
Betroffen:
FS-005 bis FS-012.
---
# 12. Dünger
Ein echtes Düngersystem ist im aktuellen Game-State und Gameplay nicht vorhanden.
TARGET Master:
- ab Level 4
- 2 Säcke = 15 F
- ein Sack pro Feld
- Wachstum 5:00 → 2:00
- spätes Düngen begrenzen
Status:
`MISSING`
Später über Field/Crop/Economy-Systeme integrieren.
---
# 13. Missionen Level 1–10
Aktuelle Kette:
1. `scrap_sale`
2. `friend_gift`
3. `first_seed`
4. `first_harvest`
5. `first_order`
6. `storage_upgrade`
7. Übergang über `miller_intro`
8. `workshop_chickens`
9. `eggs_baker`
10. `cows_milk`
11. Abschlusszustand `tutorial_done`
Der sichtbare Level wird über die Kette auf 10 gebracht.
`src/data/missions.js` enthält hauptsächlich Texte.
`src/systems/missions.js` ist klein.
Viele tatsächliche Missionsbedingungen und Progressionsaktionen befinden sich weiterhin direkt in `Game.js`.
---
# 14. Mission Coupling
Folgende Kernfunktionen sind aktuell stark an Missionszustände gekoppelt:
- Saatkatalog wird über `first_seed` angeboten
- normales Aussäen wird über `first_seed` im Feldpanel angeboten
- Silo-Upgrade wird nur bei `storage_upgrade` angeboten
- Werkstattupgrade nur bei `workshop_chickens`
- Müllerfortschritt hängt von `miller_intro`
- Bäcker-Eierauftrag hängt von `eggs_baker`
- Kuhlieferung hängt vom Tutorialzustand
- Bäcker-Milchauftrag hängt von `cows_milk`
- Bakery-Unlock hängt an Eier-Mission
- Missionen vergeben direkt Geld und Level
Kennzeichnung:
`MISSION_COUPLING`
TARGET:
Missionen erklären Gameplay.
Missionen ersetzen Gameplay nicht.
Status:
`HIGH`
---
# 15. Event-System
Der EventBus ist ein kleines synchrones Publish/Subscribe-System.
## EventBus Events
Unter anderem:
- `vehicle:spawn`
- `vehicle:arriveWaypoint`
- `vehicle:leaveWaypoint`
- `vehicle:complete`
- `field:ready`
- `mill:ready`
- `chickens:ready`
- `cows:ready`
- `construction:complete`
## Vehicle eventId
Unter anderem:
- `scrap_sale`
- `friend_gift`
- `seed_delivery`
- `sow_wheat`
- `first_harvest`
- `first_order`
- `miller_intro`
- `build_silo`
- `build_garage`
- `chicken_delivery`
- `cow_delivery`
- `baker_eggs`
- `baker_milk`
## Route Tags
Unter anderem:
- `scrap_pickup`
- `gift_unload`
- `seed_delivery`
- `sow`
- `harvest`
- `unload_wheat`
- `order_pickup`
- `miller_arrive`
- `build_silo`
- `build_garage`
- `chickens_unload`
- `cows_unload`
- `baker_egg_delivery`
- `baker_milk_delivery`
Es existiert keine zentrale Definition dieser String-IDs.
---
# 16. Konkreter Event-ID Drift
Beim Aussäen erzeugt `Game.js` einen Traktor mit:
`eventId: "sow_wheat"`
Der aktuelle Renderer prüft für die angehängte Sämaschine jedoch:
`eventId === "first_sow"`
Damit existieren zwei unterschiedliche IDs für denselben Vorgang.
Status:
`HIGH`
Ticket:
`FS-004`
Noch nicht reparieren.
---
# 17. Fahrzeuge
VehicleSystem unterstützt:
- scrap truck
- flatbed
- post van
- delivery van
- builder van
- animal transport
- tractor
- combine
Fahrzeuge besitzen unter anderem:
- ID
- Typ
- eventId
- x/y
- Route
- routeIndex
- speed
- waitingUntil
- waitStartedAt
- waitDuration
- currentTag
- heading
Fahrzeuge werden im Save-State persistiert.
Nach Reload werden Fahrzeuge mit ungültiger oder fehlender Route entfernt.
Normale Fahrzeuge fahren nach Reload von ihrer gespeicherten Position weiter.
---
# 18. Fahrzeug-Offline-Verhalten
Fahrzeugbewegung basiert primär auf Runtime-`dt`.
Damit wird während längerer Offline-Zeit nicht die komplette Fahrstrecke simuliert.
Absolute `waitingUntil`-Zeiten können dagegen nach Reload bereits abgelaufen sein.
Ergebnis:
Movement und Waypoint-Wartezeit besitzen unterschiedliche Offline-Semantik.
Status:
`HIGH`
Später in Time-/Offline-Konzept berücksichtigen.
---
# 19. TimeSystems
Absolute Zeitstempel werden verwendet für:
- Feldwachstum
- Mühle
- Hühner
- Kühe
- Construction
`reconcileOffline()` ruft aktuell im Wesentlichen:
`update(0, now)`
auf.
Dadurch können bereits abgelaufene absolute Timer fertiggestellt werden.
Nicht implementiert:
- 24-Stunden-Cap
- vollständige Fahrzeugsimulation
- wiederholte Produktionszyklen über Offline-Zeit
- vollständiges Offline-Fortschrittsmodell
TARGET:
maximal 24 Stunden Offline-Fortschritt.
Status:
`HIGH / MISMATCH`
---
# 20. timeScale
`world.timeScale` beeinflusst:
- Tageszeit
- Fahrzeugbewegung über skaliertes `dt`
Die Produktions-`readyAt`-Zeitstempel basieren jedoch auf echter `Date.now()`-Zeit.
Auch Vehicle-Waitpoints verwenden absolute Uhrzeit.
Damit beschleunigt DEV `Zeit 20×` nicht sämtliche Timer konsistent.
Status:
`MEDIUM`
---
# 21. Save-System
Save-Key:
`farm-spiel-save-v1`
Backup-Key:
`farm-spiel-save-v1-backup`
Autosave:
15 Sekunden.
Zusätzliche Saves:
- visibility hidden
- beforeunload
- diverse Gameplay-Aktionen
Vor jedem normalen Save wird der vorherige Hauptspielstand als Backup gespeichert.
Bei defektem Hauptsave wird das Backup versucht.
Das ist eine gute bestehende Sicherheitsbasis.
---
# 22. Save Schema
Aktuell:
`saveVersion: 1`
`migrateAndSanitize()`:
- erzeugt aktuellen Default-State
- deep-mergt gespeicherte Daten
- setzt Game-Version
- setzt Save-Version wieder auf 1
- stellt Vehicle-Array sicher
Es existiert noch keine echte:
`switch(saveVersion)`
oder vergleichbare schrittweise Migration.
Unbekannte alte Felder können durch den Deep-Merge weiterhin erhalten bleiben.
Status:
`HIGH`
Spätere Tickets:
FS-013 bis FS-015.
---
# 23. Zusätzliche Visual-Migration
`src/main.js` besitzt außerhalb des Save-Managers eine einmalige Migration:
`world.visualVersion !== 2`
Dabei werden gespeicherte Fahrzeugkoordinaten und Routen auf die größere Welt skaliert.
Diese Migration liegt außerhalb eines zentralen Save-Schema-Migrationssystems.
Status:
`MEDIUM`
Später in Save-Migration integrieren.
---
# 24. Welt-Datenquellen
Mehrere Quellen definieren Weltinformationen parallel.
## `worldData.js`
enthält:
- `POINTS`
- `WORLD_OBJECTS`
- `ROAD_PATHS`
## `modularWorld.js`
enthält unter anderem:
- 3200 × 5400 Welt
- Chunkgröße 400
- Buildable Area
- Fluss
- Straßen
- rund 995 Weltobjekte
- 3 visuelle Felder
- eigene Destinations
## `farmPolish.js`
verändert oder ergänzt:
- Hofdetails
- Vegetation
- Zäune
- Tierflächen
- Bodenflächen
- einzelne Objektpositionen
## `renderer.js`
enthält zusätzlich einzelne direkt codierte Positionen.
## `main.js`
enthält wiederum eigene Camera-Destinations.
Status:
`HIGH`
Es existiert noch keine einzige Welt-Source-of-Truth.
---
# 25. Interaktion und Renderposition
Touch-Weg:
Pointer Event  
→ InputController  
→ Bildschirmkoordinate  
→ Camera.screenToWorld  
→ Renderer.objectAt  
→ Game.openObject
Problem:
`Renderer.objectAt()` verwendet weiterhin:
`WORLD_OBJECTS`
für Hit Detection.
Die sichtbare Welt stammt dagegen hauptsächlich aus:
`MODULAR_WORLD`
plus `FarmPolish`.
Damit können Renderposition und Interaktionsposition aus unterschiedlichen Datenquellen stammen.
Status:
`HIGH`
Ziel:
visualBounds und interactionBounds im gemeinsamen World Object Model.
---
# 26. Kamera
CURRENT:
- ein Finger Pan
- zwei Finger Pinch Zoom
- Zwei-Finger-Pan während Pinch
- Trägheit
- Tap-Erkennung
- keine Kamerarotation
- Clamp an Weltgröße
CONFIG:
- Welt: 3200 × 5400
- Start: 1710 / 2220
- Startzoom: 0.72
- MinZoom: 0.12
- MaxZoom: 2.2
- Inertia: 7.5
Das Grundsystem entspricht weitgehend dem Mobile-Ziel.
Separate:
`cameraBounds < visualWorldBounds`
existieren aktuell noch nicht als eigenes Modell.
Status:
`PARTIAL`
---
# 27. Mobile UI
`index.html` verwendet:
- `viewport-fit=cover`
- `user-scalable=no`
- Apple-Mobile-Web-App-Metadaten
CSS verwendet:
- Safe-Area-Insets
- `touch-action: none`
- kleine Bildschirmregeln
- große Touchbuttons
- responsive Bottom Sheets
Status:
`GOOD`
Ein echter Geräte-/Browser-Test wurde in diesem Audit nicht ausgeführt.
---
# 28. Renderer-Architektur
Der aktuelle `Renderer` erweitert:
`LegacyRenderer`
Der neue Renderer überschreibt das eigentliche Rendern weitgehend und verwendet:
- MODULAR_WORLD
- Asset Catalog
- AssetLoader
- FarmPolish
- Chunks
Er erbt aber weiterhin Hilfen aus dem LegacyRenderer, unter anderem für:
- Resize
- Event Icons
- Debug
- Weather Overlay
- FPS
Dadurch existiert derzeit eine Übergangsarchitektur aus neuem und altem Renderer.
Status:
`MEDIUM/HIGH`
---
# 29. Unnötige Legacy-Weltgrafik
Der LegacyRenderer-Konstruktor lädt weiterhin:
`CONFIG.world.image`
also:
`./assets/world/master_world.webp`
Der neue Renderer verwendet in seinem überschriebenen `render()` jedoch die modulare Welt und zeichnet diese Master-Grafik dort nicht als eigentlichen Hintergrund.
Damit kann die Legacy-Weltgrafik weiterhin geladen werden, obwohl die neue Renderpipeline sie nicht für das normale Rendering benötigt.
Status:
`WATCH`
Performance-/Speicherprüfung später erforderlich.
---
# 30. Renderer Gameplay-Kopplung
Der Renderer interpretiert direkt Gameplay-State.
Beispiele:
- Feldwachstumsphase
- Silo-Level → Asset
- Scheunen-Level → Asset
- Werkstatt-Level → Asset
- restaurierter Traktor
- restaurierter Mähdrescher
- Tier-Unlocks
- Construction
- Scrap visibility
- Vehicle eventId
Visualisierung von State ist korrekt.
Problematisch sind jedoch direkte Gameplay-/Event-Annahmen und hart codierte IDs/Positionen.
TARGET:
Gameplay entscheidet State.
Renderer visualisiert diesen State.
Status:
`PARTIAL`
---
# 31. Rendering Performance Struktur
Bereits vorhanden:
`GOOD`
- Chunking 400 World Units
- Viewport-Culling
- Zoomabhängiges Ausblenden kleiner Props
- Asset-Größenstufen
- begrenzter Asset-Cache
- Bildglättung
- Y-/Layer-Sortierung
- devicePixelRatio-Cap
AssetLoader:
- 192 px Tier
- 512 px Tier
- 1200 px Tier
- maximal 4 parallele Loads
- etwa 64 MiB berechnetes Cache-Limit
- Eviction älter genutzter Bilder
---
# 32. Performance Watchpoints
`WATCH`
Pro Frame werden sichtbare Objekte:
- gesammelt
- teilweise kopiert
- gefiltert
- erweitert
- sortiert
Die Welt besitzt rund 995 modulare Objekte.
Das Chunking reduziert die Menge deutlich.
Echte:
- FPS-Messreihen
- Memory-Profiling
- iPhone-Langzeittest
wurden nicht durchgeführt.
Status:
`NOT TESTED`
---
# 33. Asset-Katalog
Asset Catalog:
200 Assets.
Strukturell vorhanden:
- Kategorien
- Pfade
- Maße
- Anchor
- Footprints
- Produktionsinformationen
- Upscale-Informationen
- Hitbox-Anforderungen
- Animation-Anforderungen
Von 200 Assets sind laut Katalog:
117 als hochskaliert gekennzeichnet.
111 benötigen laut Katalog Hitboxen.
83 besitzen State-/Animationsanforderungen.
Die Katalognotiz sagt ausdrücklich, dass Exportgröße keine unbegrenzte Zoomschärfe garantiert.
Status:
`CURRENT`
---
# 34. UI
UI-System verwaltet:
- HUD
- XP
- Farmercoin-Anzeige
- Bottom Sheet
- Buttons
- Toasts
- Menü
- DEV-Panel
- Boot Screen
`Game.js` liefert weiterhin viele HTML-Strings und Gameplay-Texte direkt an die UI.
Status:
`MEDIUM`
Langfristig sollte UI weniger Gameplayregeln kennen.
---
# 35. DEV Mode
CURRENT implementiert:
- +1000 Geld
- +100 XP
- Feld fertig
- alle aktuellen Timer fertig
- Sonne
- Regen
- Nebel
- Zeitmaßstab 20×
- Zeitmaßstab 1×
- Debug-/Hitboxanzeige
- FPS
- aktueller Level
- Mission
- Vehicle Count
- Kamera
- Wetter
- TimeScale
TARGET noch nicht vollständig:
- exakter Level-Setter
- Lagerkapazität editieren
- individuelle Timer konfigurieren
- Farmercoin-Bezeichnung konsistent
- Unlock-Steuerung
- detaillierte Systemcheats
Status:
`PARTIAL`
---
# 36. Master-Regel Vergleich
| Regel | CURRENT | TARGET | Status |
|---|---|---|---|
| Name | Farm-Spiel | Farm-Spiel | `MATCH` |
| Smartphone-first | Touch/CSS vorhanden | Smartphone-first | `MATCH/PARTIAL TEST` |
| Hochformat | Responsive Mobile UI | Hochformat Fokus | `MATCH/PARTIAL TEST` |
| Farmercoins F | HUD F, viele `$`-Texte | überall F | `MISMATCH` |
| Schrottstart | 100 | 100 F | `MATCH` |
| Saatpreis | 10 | 10 F | `MATCH`, aber missiongebunden |
| wiederholbarer Core | nicht vollständig | zwingend | `BLOCKER` |
| Mission unabhängig | stark gekoppelt | Mission erklärt Gameplay | `MISMATCH` |
| mehrere Felder | 1 Gameplay-Feld | datengetrieben | `MISMATCH` |
| Weizenzeit | 4:00 | 5:00 | `MISMATCH` |
| Dünger | fehlt | ab Level 4 | `MISSING` |
| Silo Start | 40 | 40 | `MATCH` |
| Silo Capacity Enforcement | fehlt | erforderlich | `MISMATCH` |
| Scheune | 30 | noch offene Masterentscheidung | `OPEN_DECISION` |
| Offline 24h | kein Cap | max. 24h | `MISSING` |
| DEV Mode | vorhanden | umfangreicher | `PARTIAL` |
| Weltreaktionen | viele Fahrzeuge vorhanden | sichtbare Reaktion | `MATCH/PARTIAL` |
| keine Menschen-NPCs | keine Human-Kategorie in Weltstruktur | keine sichtbaren Menschen | `MATCH` |
| Maschinenlagerung | Anbaugeräte textlich Werkstatt | Geräte dürfen verschwinden | `MATCH/PARTIAL` |
| Performance | Culling/Chunks/Cache | Mobile flüssig | `PARTIAL, NOT BENCHMARKED` |
| World Object Model | mehrere getrennte Modelle | eine zentrale Struktur | `MISMATCH` |
---
# 37. Risikoregister
## BLOCKER
### B1 – Farming-Loop nicht wiederholbar
Betroffen:
- `Game.js`
- Field-State
- Economy
- Inventory
- Selling
Auswirkung:
Milestone 1 ist nicht erreichbar.
Tickets:
FS-005 bis FS-012.
---
## HIGH
### H1 – Mission Coupling
Gameplay ist zu stark an Missions-IDs gekoppelt.
Ticket:
FS-005 bis FS-012.
### H2 – Event/String Drift
Beispiel:
`sow_wheat` vs `first_sow`.
Ticket:
FS-004.
### H3 – Keine zentrale Inventory-/Capacity-Logik
Gefahr:
Überfüllung und verteilte direkte Mutationen.
Ticket:
FS-006.
### H4 – Mehrere World Sources of Truth
WORLD_OBJECTS, POINTS, MODULAR_WORLD, FarmPolish, Renderer-Hardcodes und Camera-Destinations.
Tickets:
später FS-018 bis FS-020.
### H5 – Interaktionsposition ≠ Renderposition möglich
Hit Detection und sichtbare Objekte nutzen unterschiedliche Datenquellen.
Ticket:
FS-018/FS-019.
### H6 – Save Schema ohne echte Migration
Künftige Core-Änderungen können alte Saves gefährden.
Tickets:
FS-013 bis FS-015.
### H7 – Offline-System unvollständig
24h-Cap und Vehicle-Fortschritt fehlen.
Ticket:
FS-010.
---
## MEDIUM
### M1 – Game.js hat zu viele Verantwortungen
Schrittweise entkoppeln.
### M2 – TimeScale inkonsistent
Runtime-dt und absolute Timer reagieren unterschiedlich.
### M3 – Legacy-/Modular-Renderer Übergang
Doppelte technische Pfade.
### M4 – hart codierte Economy-/Recipe-Werte
Nicht alles liegt in CONFIG.
### M5 – Visual Migration außerhalb Save-System
Später zentralisieren.
### M6 – UI enthält Gameplay-Texte und `$`
Später bereinigen.
---
## LOW
### L1 – HTML-Versionstext besitzt alten statischen Default
`index.html` enthält als initialen Placeholder `0.2.0`.
UI überschreibt ihn beim Start mit `CONFIG.version`.
Kein Core-Blocker.
---
# 38. Dependency Map
```text
main.js
├── CONFIG
├── SaveManager
│   └── Root State
├── EventBus
├── Camera
├── Renderer
│   ├── LegacyRenderer
│   ├── WORLD_OBJECTS / POINTS / ROAD_PATHS
│   ├── MODULAR_WORLD
│   ├── AssetCatalog
│   ├── AssetLoader
│   └── FarmPolish
├── UI
├── Game
│   ├── MissionSystem
│   ├── VehicleSystem
│   ├── TimeSystems
│   ├── CONFIG
│   └── POINTS
└── InputController
    └── Camera → Game.handleTap
```
---
# 39. Empfohlene Entkopplungsreihenfolge
1. Event-Strings erfassen und vereinheitlichen
2. Economy zentralisieren
3. Inventory zentralisieren
4. Field-State modularisieren
5. Crop-Definitionen trennen
6. Planting unabhängig vom Tutorial machen
7. Time/Offline stabilisieren
8. Harvest unabhängig und kapazitätssicher machen
9. Selling wiederholbar machen
10. danach Save-Schema v2
Diese Reihenfolge entspricht weitgehend der bestehenden 0.3-Roadmap.
---
# 40. Vorbereitung FS-004
`FS-004 – Event ID Audit`
Voraussichtlich betroffen:
- `Game.js`
- `systems/vehicles.js`
- `systems/timeSystems.js`
- `main.js`
- `renderer.js`
Ziel:
String-IDs inventarisieren und zentrale Benennung vorbereiten.
Wichtigster bekannte Drift:
`sow_wheat` / `first_sow`.
---
# 41. Vorbereitung FS-005
`FS-005 – Economy Core`
Voraussichtlich betroffen:
- `config.js`
- neues Economy-Modul
- `Game.js`
- UI-Nutzung
Ziel:
zentrale Geldänderungen und Preise.
Keine Mission soll selbst die einzige Quelle der Wirtschaft sein.
---
# 42. Vorbereitung FS-006
`FS-006 – Inventory Core`
Voraussichtlich betroffen:
- Save-State
- neues Inventory-Modul
- Silo
- Barn
- Seed Inventory
- `Game.js`
Ziel:
zentrale:
- add
- remove
- has
- capacity
- validation
---
# 43. Vorbereitung FS-007
`FS-007 – Field System Core`
Ziel:
`state.field`
durch datengetriebenes Feldmodell ersetzen bzw. kontrolliert migrieren.
Mehrere Felder vorbereiten.
Lebenszyklus:
empty/prepared  
→ sowing  
→ growing  
→ ready  
→ harvesting  
→ harvested  
→ prepared/empty
muss vollständig definiert werden.
---
# 44. Vorbereitung FS-008
`FS-008 – Crop System`
Zentrale Crop-Definition.
Mindestens:
- cropId
- seed item
- growth duration
- yield
- fertilizer behavior
- visual stages
Keine Crop-Werte mehr über mehrere Dateien verteilen.
---
# 45. Vorbereitung FS-009
`FS-009 – Planting Flow`
Saatkauf und Aussaat müssen unabhängig vom Tutorial funktionieren.
Mission darf den Spieler dorthin führen, aber nicht die Funktion erzeugen.
---
# 46. Vorbereitung FS-010
`FS-010 – Growth + Offline`
Zentraler Zeitansatz.
Berücksichtigen:
- absolute timestamps
- max. 24h
- Reload
- Produktion
- Feld
- Construction
- Fahrzeuge separat definieren
- DEV-TimeScale
---
# 47. Vorbereitung FS-011
`FS-011 – Harvest Core`
Ernte unabhängig von Mission.
Prüfen:
- readiness
- machine availability
- yield
- silo capacity
- overflow behavior
- field reset lifecycle
---
# 48. Vorbereitung FS-012
`FS-012 – Selling Core`
Aktuell existiert hauptsächlich der Tutorial-Auftrag.
TARGET:
wiederholbarer Verkauf über den Hof-/Truck-Verkaufspunkt.
Verkauf muss Farmercoins erzeugen, ohne Mission vorauszusetzen.
---
# 49. Positive bestehende Basis
Der Rebuild sollte nicht alles ersetzen.
Erhaltenswert sind insbesondere:
- Camera-Grundsystem
- Pointer-/Touch-Controller
- EventBus-Grundidee
- Vehicle-Routenprinzip
- Save-Backup
- Canvas-Renderer-Grundstruktur
- Chunk-Culling
- AssetLoader
- modulare Welt
- Asset-Katalog
- sichtbare Fahrzeugreaktionen
- Safe-Area-/Mobile-CSS
---
# 50. Fazit
Der aktuelle Stand besitzt bereits viele funktionierende Bausteine.
Ein Total-Rewrite ist nicht erforderlich.
Der zentrale Umbau muss darin bestehen, den vorhandenen Code von einem missionsgesteuerten Tutorial-Prototyp zu einem systemgesteuerten Farming-Core umzubauen.
Der erste technische Schritt danach ist:
`FS-004 – Event ID Audit`
Danach:
Economy  
→ Inventory  
→ Fields  
→ Crops  
→ Planting  
→ Offline/Growth  
→ Harvest  
→ Selling
Erst wenn dieser Core wiederholbar funktioniert, sollte die Welt funktional weiter ausgebaut werden.
---
# Teststatus dieses Audits
Repository-Stand:
`VERIFIED`
Sourcecode-Änderung:
`NONE`
Browser:
`NOT TESTED`
Gameplay:
`NOT TESTED`
FPS:
`NOT TESTED`
Memory-Profiling:
`NOT TESTED`
iPhone-Langzeittest:
`NOT TESTED`
Der Audit beschreibt statisch nachweisbaren Repository-State und behauptet keine nicht ausgeführten Runtime-Tests.
