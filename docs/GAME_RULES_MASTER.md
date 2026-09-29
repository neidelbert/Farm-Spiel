# Farm-Spiel – Game Rules Master
## Status
Dies ist die aktuelle verbindliche Game-Design-Quelle für Farm-Spiel.
Bei Widersprüchen zu älteren Dokumenten besitzt diese Datei Vorrang.
---
# Produkt
Name:
**Farm-Spiel**
Plattform:
Smartphone-first Browsergame.
Hauptausrichtung:
Hochformat.
Später mögliche App-Version.
---
# Spielgefühl
Farm-Spiel soll:
- gemütlich
- bunt
- hochwertig
- verständlich
- lebendig
- langfristig motivierend
wirken.
Visuelle Inspiration darf von erfolgreichen Farming-Spielen kommen.
Farm-Spiel benötigt jedoch eine eigene Identität.
---
# Perspektive
2.5D / Vogelperspektive.
Keine freie Kameradrehung.
---
# Kamera
Ein Finger:
Karte verschieben.
Zwei Finger:
stufenlos zoomen.
Zusätzlich:
- leichte Trägheit
- keine harten Sprünge
- sinnvolle Weltgrenzen
- cameraBounds innerhalb der sichtbaren Welt
- Smartphone-Hochformat zuerst
---
# Menschen
Auf der Weltkarte gibt es keine sichtbaren menschlichen NPCs.
Charaktere wie:
- Müller
- Bäcker
- Handwerker
- Freunde
- Händler
erscheinen über:
- Nachrichten
- Aufträge
- Gebäude
- Fahrzeuge
- Lieferungen
---
# Tiere und Atmosphäre
Tiere dürfen sichtbar sein.
Erlaubte dezente Umgebungsanimationen:
- kleine Vögel
- halbtransparente Wolken
- leichter Rauch
- Wasserbewegung
- Wasserrad
- dezente Vegetationsbewegung
Keine aufwendige Echtzeit-Wassersimulation.
---
# Maschinen
Dauerhaft draußen sichtbar sollen hauptsächlich sein:
- Traktor
- Mähdrescher
Weitere Maschinen und Anbaugeräte dürfen in Werkstatt/Garage verschwinden.
Bei einer Aktion können sie herauskommen und anschließend wieder eingelagert werden.
---
# Weltreaktionen
Nahezu jede wichtige Spieleraktion soll eine sichtbare Reaktion erzeugen.
Beispiele:
Saatgutkauf:
Lieferfahrzeug.
Tierkauf:
Tiertransporter.
Gebäudeupgrade:
Baustellen-/Handwerkerreaktion.
Maschinenlieferung:
Tieflader.
Ernte:
Maschine, Pflanzenänderung und Lagerreaktion.
Verkauf:
Fahrzeug bzw. Hofverkaufspunkt.
Die Welt soll auf Entscheidungen des Spielers reagieren.
---
# Währung
Hauptwährung:
**Farmercoins**
Symbol:
`F`
Keine Dollar- oder Euro-Darstellung im finalen Gameplay.
---
# Gameplay Core
Der wichtigste wiederholbare Kreislauf lautet:
Farmercoins
→ Saatgut kaufen
→ Feld bepflanzen
→ Wachstum
→ Ernte
→ Lager
→ Verkauf
→ Farmercoins
→ erneut anbauen
Dieser Kreislauf muss unabhängig vom Tutorial funktionieren.
---
# Startphase
Start am Uferhof.
Spieler besitzt zu Beginn nur eine kleine nutzbare Landwirtschaftsfläche.
Schrott bzw. Altbestand dient als erster Einstieg in die Wirtschaft.
Aktuelle Zielvorgabe:
Schrottverkauf:
`100 F`
Weizensaat:
`10 F` pro benötigter Saatguteinheit.
Diese Werte werden später über ein zentrales Economy-System gesteuert.
---
# Felder
Langfristig mehrere Felder.
Ein Feld benötigt einen eigenen Zustand.
Mindestens:
- ID
- Position
- Größe
- Freischaltung
- Pflanze
- Wachstumsstatus
- Saatzeit
- Fertigzeit
- Düngerzustand
- Maschinenzustand
Das System muss datengetrieben sein.
---
# Dünger
Dünger soll später ab Level 4 eingeführt werden.
Zielregel aus bisherigem Game Design:
- 2 Säcke = 15 F
- ein Sack pro Feld
- Basiswachstum Weizen = 5:00 Minuten
- mit Dünger = 2:00 Minuten
- ab geringer Restzeit soll Düngen nicht mehr möglich sein
Diese Werte werden erst in einem eigenen Ticket verbindlich in Code übernommen.
---
# Lager
Zwei Hauptlager:
## Silo
Für Feldfrüchte.
Ziel-Startkapazität:
`40`
## Scheune
Für Produkte und Materialien.
Kapazitätswert wird vor endgültiger Umsetzung noch zentral festgelegt.
Wichtig:
Bei vollem Lager darf Ware nicht stillschweigend verschwinden.
---
# Tutorial
Level 1–10 dienen als Einführung.
Missionen dürfen nur vorhandene Systeme erklären.
Sie dürfen keine Einmalmechanik erzeugen, die danach nicht mehr nutzbar ist.
---
# Level 10+
Ab Level 10 öffnet sich das langfristigere Farming-System.
Geplant:
- mehr Maschinen
- weitere Pflanzen
- Hofausbau
- zusätzliche Regionen
- Produktionsketten
- Farmerpunkte
- spätere Automatisierung
Diese Systeme gehören nicht in den aktuellen 0.3-Core.
---
# Offline
Langfristiges Ziel:
maximal 24 Stunden Offline-Fortschritt.
Zeitberechnung soll über belastbare Zeitstempel erfolgen.
---
# Entwickler-Modus
Versteckt in Einstellungen.
Nicht Teil des normalen Spielerlebnisses.
Mögliche Funktionen:
- Farmercoins
- XP
- Level
- Timer
- Wachstum
- Produktionszeiten
- Wetter
- Lagerkapazität
- Instant Finish
- Debug Bounds
- FPS
- Cheats für Tests
---
# Welt
Langfristige Regionen:
- Uferhof
- Silberbach
- Alte Ufermühle
- Mühlendorf
- Dorfmarkt
- Dorfkirche
- Tannenforst
- Felsenmine
- Steinkamm
- Alte Ruinen
- Wachturm
- Silberfälle
- Uferküste
- Kleiner Hafen
- Leuchtturm
Für Farm-Spiel 0.3 wird zunächst hauptsächlich der Uferhof als aktiver Gameplay-Bereich stabilisiert.
Andere Bereiche dürfen sichtbar sein, müssen aber noch kein vollständiges Gameplay besitzen.
---
# Grafik
Keine riesige statische Weltgrafik als langfristige technische Lösung.
Welt soll aus getrennten Elementen bestehen.
Assets werden zukünftig klassifiziert:
`PLACEHOLDER`
`PRODUCTION`
`FINAL`
Hochskalierte Grafik gilt nicht automatisch als FINAL.
---
# Performance
Ziel:
flüssige Smartphone-Darstellung.
Verwenden:
- Viewport-Culling
- Chunks
- LOD
- begrenzten Asset-Cache
- reduzierte entfernte Animationen
- kontrollierte Partikeleffekte
Keine Ladebildschirme zwischen normalen Weltbereichen, solange technisch sinnvoll.
---
# Platzierung
Langfristiges Weltobjektmodell:
- id
- type
- worldPosition
- footprint
- visualBounds
- interactionBounds
- placementClearance
- layer
- depth
- state
- asset
- level
Platzierungsprüfung gegen:
- Gebäude
- Maschinen
- Straßen
- Wasser
- Felsen
- Kartengrenzen
- reservierte Flächen
Priorität bei Konflikten:
Gebäude
→ Maschinen
→ Straßen
→ Landschaft
→ Dekoration
---
# Aktuelles Hauptziel
Farm-Spiel 0.3 ist NICHT das komplette Spiel.
0.3 muss zuerst einen stabilen, wiederholbaren und speicherbaren Farming-Kern herstellen.
