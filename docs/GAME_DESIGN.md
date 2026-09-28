# Farm-Spiel – Game Design 0.1

## Ziel
Hochformatiges Mobile-Farming-Spiel in scharfer 3D-/2.5D-Vogelperspektive. Die Welt ist ein großes Tal und soll wie ein echtes Spiel wirken, nicht wie eine statische Hintergrundgrafik.

## Welt
Von Norden nach Süden:

- Berg + Bergwerk
- Wald + Sägewerk
- Mühle am Waldrand / Wasser
- große Hofwiese mit Bauernhof, Feldern, Silo, Scheune, Werkstatt und Tieren
- Dorf mit Kirche, Dorfmarkt, Bäcker und später weiteren Händlern
- Fischerei + Hafen
- Leuchtturm an der Küste

Alle wichtigen Orte besitzen Zufahrten. Externe Fahrzeuge spawnen außerhalb des sichtbaren Kartenbereichs und fahren echte Routen.

## Kamera
- Hochformat
- 1 Finger: frei links/rechts/oben/unten
- 2 Finger: stufenloser Zoom
- keine Kameradrehung
- leichte Trägheit
- keine harten Sprünge
- natürliche Kartenränder

## UI
Dauerhaft nur:
- Level / XP
- Geld
- Menü

Andere Aktionen erscheinen direkt als Icons über dem Ereignis oder Objekt.

## Level 1–10
### Level 1
Schrott vom geerbten Hof verkaufen. Schrott-LKW fährt an. Belohnung 100 $.

### Level 2
Ein Freund schenkt alten rostigen Traktor und Sämaschine. Lieferung per Tieflader.

### Level 3
Weizensaatgut im Hofkatalog kaufen. Postauto liefert. Das erste Feld ist vorbereitet. Traktor holt Sämaschine aus der Werkstatt und sät.

### Level 4
Weizen wächst ca. 3–5 Minuten. Alter Mähdrescher erntet ca. 20 Sekunden, fährt zum Silo, entlädt sichtbar und kehrt zur Werkstatt zurück.

### Level 5
Erste Lieferaufträge.

### Level 6
Silo und Scheune werden ausbaubar. Handwerkerauto + sichtbare Baustelle.

### Level 6 – Folge
Müller aktiviert die Mühle. Weizen wird zu Mehl.

### Level 7
Werkstatt wird ausgebaut. Traktor und Mähdrescher werden optisch restauriert. Hühner kommen per Tiertransporter.

### Level 8
Hühner brauchen Weizen, produzieren Eier. Bäcker wird aktiv und erteilt Aufträge.

### Level 9
Kühe kommen per Tiertransporter. Sie brauchen Futter und produzieren Milch. Bäcker benötigt Milch.

### Level 10
Versteckte Einführung abgeschlossen. Hof steht und freies Spiel beginnt.

## Lager
- Silo: Ernte / Feldfrüchte
- Scheune: Produkte, Tierprodukte, Materialien und sonstige Waren

Keine Ware wird bei vollem Lager vernichtet.

## Produktion
Ein universelles System:
Rohstoff → Produktionszeit → Produkt.

Beispiele:
- Weizen → Mühle → Mehl
- Mehl/Eier/Milch → Bäcker
- Holz → Sägewerk → Bretter
- später Erz, Fischerei und Export

## Tiere
Keine sichtbaren Menschen/NPCs.
Tiere sind sichtbare Weltobjekte in Gehegen.

- Hühner → Eier
- Kühe → Milch
- später Schafe → Wolle
- Pferde und Hasen später mit eigenen Rollen

Bei fehlendem Futter pausiert die Produktion; Tiere sterben nicht.

## Weltreaktionen
Nahezu jede wichtige Aktion erzeugt eine kleine Reaktion:
- Saatgut → Postauto
- Tierkauf → Tiertransporter
- Gebäudeupgrade → Handwerker + Baustelle
- Maschinenkauf → Tieflader
- Verkauf → Lieferfahrzeug
- Ernte → Mähdrescher + Entladung
- Produktion → sichtbare Gebäudebewegung
- Export später → Schiff

## Fahrzeuge
Draußen dauerhaft sichtbar:
- Traktor
- Mähdrescher

Sämaschine, Anhänger und weitere Geräte werden in der Werkstatt gelagert und kommen nur für Aktionen heraus.

## Atmosphäre
- beschleunigte Tageszeit
- Sonne, Wolken, Regen, Nebel
- gelegentliche kleine Vögel
- leichte halbtransparente Wolken
- keine sichtbaren Menschen
- Leuchtturmlicht nachts

## Audio-Ziel
Später getrennte Ebenen für:
- Musik
- Umgebung
- Fahrzeuge
- Maschinen
- Tiere
- UI
- große Ereignisse

## Performance
- keine riesige Hintergrundgrafik
- Welt aus einzelnen Elementen
- Layer-System
- Culling / LOD
- entfernte Animationen reduzieren
- Objektgrenzen und Routen validieren
- 60 FPS als Ziel
- iPhone + iPad separat testen

## DEV-Modus
- Geld / XP
- Zeit 1x / 20x
- Feld sofort fertig
- Timer sofort fertig
- Wetter
- Debug-Grenzen
- FPS
- später weitere Test-Szenarien
