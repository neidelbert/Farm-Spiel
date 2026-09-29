# Farm-Spiel – Architecture
## Ziel
Farm-Spiel wird schrittweise modularisiert.
Kein kompletter Rewrite.
Bestehende funktionierende Systeme werden weiterverwendet.
---
# Aktueller technischer Stack
Browsergame.
JavaScript ES Modules.
Canvas Rendering.
LocalStorage Save-System.
Touch-/Pointer-Steuerung.
---
# Bestehende wichtige Systeme
Aktuell vorhanden:
- Game.js
- EventBus
- SaveManager
- MissionSystem
- VehicleSystem
- TimeSystems
- Camera
- InputController
- Renderer
- AssetLoader
- UI
- World Data
- Asset Catalog
---
# Zielarchitektur
Langfristige Systemgrenzen:
## Game
Orchestriert Systeme.
Soll langfristig nicht sämtliche Spiellogik selbst enthalten.
## EconomySystem
Verantwortlich für:
- Farmercoins
- Preise
- Belohnungen
- Kosten
## InventorySystem
Verantwortlich für:
- Items
- Hinzufügen
- Entfernen
- Mengen
- Kapazitätsprüfung
## FieldSystem
Verantwortlich für:
- Felder
- Saat
- Wachstum
- Ernte
- Dünger
- Feldzustände
## CropSystem
Daten und Regeln einzelner Pflanzen.
## BuildingSystem
Gebäudezustände, Level und Upgrades.
## ProductionSystem
Generisches Prinzip:
Input
→ Zeit
→ Output
## MachineSystem
Landwirtschaftliche Maschinen und Geräte.
## VehicleSystem
Weltfahrzeuge und Routen.
## AnimalSystem
Tierhaltung und Tierproduktion.
## MissionSystem
Tutorial und Aufgaben.
Missionen greifen auf Gameplay-Systeme zu.
## TimeSystem
Zeitstempel und Offline-Fortschritt.
## SaveSystem
Persistenz und Migrationen.
## InteractionSystem
Einheitliche Interaktion mit Weltobjekten.
## WorldSystem
Zentrale Weltobjekte und Weltzustände.
## Renderer
Darstellung.
Soll keine eigentliche Gameplay-Entscheidungslogik besitzen.
## UI
Darstellung von Spielerinformationen und Aktionen.
---
# Zentrale Architekturregel
Gameplay bestimmt den Zustand.
Renderer stellt den Zustand dar.
Missionen beobachten oder verwenden Gameplay.
Missionen definieren nicht die Kernmechaniken.
---
# Datenmodell
Langfristig:
zentrale Definitionen statt mehrfacher Hardcodes.
Beispiel Feld:
```js
{
  id: "field_001",
  position: { x: 0, y: 0 },
  unlocked: true,
  cropId: "wheat",
  state: "empty",
  plantedAt: null,
  readyAt: null,
  fertilized: false
}
```

Beispiel Weltobjekt:

```js

{
  id: "barn_001",
  type: "barn",
  worldPosition: { x: 0, y: 0 },
  footprint: {},
  visualBounds: {},
  interactionBounds: {},
  layer: "building",
  depth: 0,
  level: 1,
  state: "normal"
}
```

⸻

Event-System

Event-Bezeichnungen sollen langfristig zentral vereinheitlicht werden.

Ein Ereignis soll überall dieselbe ID verwenden.

Keine verschiedenen IDs für denselben Vorgang.

⸻

Save-Regel

Jeder persistente Zustand muss im Save-Schema bewusst definiert werden.

Keine versteckten Runtime-Zustände, die nach Reload Gameplay verändern.

Save-Schema benötigt Versionierung.

Migrationen müssen kontrolliert erfolgen.

⸻

Mobile Regel

Jede neue Gameplay-Funktion muss Smartphone-Steuerung berücksichtigen.

Desktop darf nicht die einzige funktionierende Eingabemethode sein.

⸻

Performance-Regel

Neue Weltobjekte und Systeme müssen Culling, Speicher und Renderkosten berücksichtigen.

Große Feature-Erweiterungen dürfen nicht ungeprüft dauerhaft pro Frame berechnet werden.

⸻

Aktueller Umbau

0.3 verfolgt:

1. Architektur dokumentieren
2. aktuellen State auditieren
3. Events vereinheitlichen
4. Economy zentralisieren
5. Inventar zentralisieren
6. Felder modularisieren
7. Crop-System aufbauen
8. wiederholbaren Farming-Loop herstellen
9. Save-System stabilisieren
10. Mobile/Renderer weiter entkoppeln
