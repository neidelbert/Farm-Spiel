# Farm-Spiel 0.2 – Stable Baseline
Diese Datei dokumentiert den eingefrorenen Ausgangszustand vor der kontrollierten Weiterentwicklung von Farm-Spiel 0.3.
## Repository
Repository:
`neidelbert/Farm-Spiel`
## Branch-Struktur
Stabile öffentliche Version:
`main`
Eingefrorene historische Baseline:
`baseline/0.2.0`
Aktuelle Entwicklung:
`develop`
## Baseline-Commit
`5e6dc7757ab95d5aa7344d1b61e30f16a65407ab`
## Baseline-Version
`0.2.0`
## Entwicklungsversion
`0.3.0-dev`
---
# Zweck der Baseline
Der Branch:
`baseline/0.2.0`
wird nicht aktiv weiterentwickelt.
Er dient ausschließlich dazu, jederzeit exakt zum Zustand vor dem Farm-Spiel-0.3-Core-Rebuild zurückkehren zu können.
Er darf nicht für normale Entwicklungsarbeiten verwendet werden.
---
# Vorhandene Hauptsysteme
## Game Loop
Zentraler Update- und Render-Loop ist vorhanden.
## Kamera
Vorhanden:
- freie Kartenbewegung
- Zoom
- Kameragrenzen
- Trägheit
## Mobile Input
Vorhanden:
- Pointer Events
- Ein-Finger-Pan
- Zwei-Finger-Pinch-Zoom
- Tap-Erkennung
## EventBus
Grundlage zur Ereigniskommunikation zwischen Spielsystemen.
## SaveManager
Vorhanden:
- LocalStorage
- Autosave
- Backup
- Grundstruktur für Migrationen
## MissionSystem
Grundlage für Missionen und den bisherigen Level-1-bis-10-Ablauf.
## VehicleSystem
Vorhanden:
- Fahrzeuge
- Routen
- Waypoints
- Wartezeiten
- Ereignisse
- Lieferfahrzeuge
- Maschinenbewegungen
## TimeSystems
Vorhanden:
- Feldwachstum
- Produktionszeiten
- Tierproduktion
- Bauzeiten
- Offline-Abgleich
## Renderer
Canvas-basierte Darstellung der Spielwelt.
## AssetLoader
Vorhanden:
- bedarfsgesteuertes Laden
- Asset-Cache
- verschiedene Ladegrößen
- Speicherbegrenzung
## Performance-Grundlage
Vorhanden:
- Viewport-Culling
- Chunk-Struktur
- reduzierte Darstellung entfernter Objekte
- Asset-Cache
## UI
Vorhanden:
- HUD
- Bottom-Sheets
- Menü
- DEV-Oberfläche
- Toast-Meldungen
## Welt
Vorhanden:
- modulare Weltstruktur
- Straßen
- Gebäude
- Felder
- Landschaft
- Fahrzeuge
- Hof
- Dorf
- Küstenbereich
## Assets
Es existiert bereits ein umfangreicher Asset-Katalog mit ungefähr 200 getrennten Grafikdateien.
---
# Bekannte technische Schulden
## Mehrere Welt-Datenquellen
Informationen über Welt und Objekte liegen aktuell teilweise verteilt in:
- `worldData.js`
- `modularWorld.js`
- `renderer.js`
- `farmPolish.js`
Langfristig soll daraus eine zentrale Quelle der Wahrheit entstehen.
In FS-001 NICHT ändern.
---
## Unterschiedliche Event-IDs
Gameplay, Fahrzeuge und Renderer benutzen teilweise historische oder voneinander abweichende Ereignisbezeichnungen.
Beispiel:
`sow_wheat`
und ältere Bezeichnungen für dieselbe oder ähnliche Aktionen.
Wird in einem eigenen Ticket geprüft.
In FS-001 NICHT ändern.
---
## Game.js ist zu groß
`Game.js` besitzt derzeit Verantwortung für viele verschiedene Systeme.
Darunter:
- Missionen
- Felder
- Gebäude
- Maschinen
- Tiere
- Produktion
- Wirtschaft
- Interaktionen
Die Datei wird später schrittweise modularisiert.
In FS-001 NICHT refactoren.
---
## Feldsystem
Das aktuelle Gameplay verwendet im Kern noch einen einzelnen Feldzustand.
Langfristig benötigen wir ein universelles Multi-Field-System.
---
## Save-Schema
Das aktuelle Save-System verwendet noch:
`saveVersion: 1`
Für 0.3 wird später ein sauber versioniertes Schema eingeführt.
---
## Asset-Qualität
Ein Teil der Grafikdateien wurde aus kleineren Ausgangsdateien hochskaliert.
Große Exportauflösung bedeutet daher nicht automatisch native Detailauflösung.
Langfristig werden Assets klassifiziert als:
- Placeholder
- Production
- Final
---
# Zentrale Entwicklungsprioritäten
1. Stabilität
2. wiederholbarer Gameplay-Core
3. sauberes Save-System
4. modulare Architektur
5. Smartphone-Bedienung
6. Performance
7. Content
8. finale Grafik
---
# Zentrale Gameplay-Regel
Missionen dürfen Kernmechaniken erklären und begleiten.
Sie dürfen aber langfristig NICHT die eigentliche Spiellogik ersetzen.
Der grundlegende Kreislauf muss unabhängig vom Tutorial funktionieren:
Saatgut kaufen
→ Feld bepflanzen
→ Wachstum
→ Ernte
→ Lager
→ Verkauf
→ Farmercoins
→ erneut anbauen
---
# Entwicklungsregel
Lieber eine kleine Funktion vollständig stabil als viele halb fertige Systeme.
