# Farm-Spiel

**Aktuelle Version: 0.1.0**

Farm-Spiel ist ein Mobile-Farming-Spiel im Hochformat mit frei beweglicher 3D-/2.5D-Vogelperspektive. Die erste spielbare Version umfasst die komplette versteckte Einführung von **Level 1 bis Level 10**.

## Spielen

Das Projekt ist eine statische Web-App ohne Build-Schritt.

- `index.html` ist der Einstieg.
- Auf GitHub Pages kann das Projekt direkt veröffentlicht werden.
- Lokal muss es wegen ES-Modulen über einen kleinen Webserver geöffnet werden.

## Steuerung

- **1 Finger:** Karte frei verschieben
- **2 Finger:** stufenlos zoomen
- **Antippen:** Gebäude, Felder und Ereignisse öffnen

## Level 1–10

1. Schrott per LKW verkaufen → 100 $
2. Alter Traktor + Sämaschine werden geliefert
3. Weizensaatgut im Katalog bestellen → Postauto → Aussaat
4. Weizen wächst → Mähdrescher erntet → Silo
5. Erster Lieferauftrag
6. Silo-Ausbau + sichtbare Baustelle → Müller und Mühle
7. Werkstatt-Ausbau → Maschinen restauriert → Hühnerlieferung
8. Hühner füttern → Eier → Bäckerauftrag
9. Kühe per Tiertransporter → Milch → Bäckerauftrag
10. Einführung abgeschlossen, freies Spiel

## Bereits enthaltene Systeme

- freie Kamera und Pinch-Zoom
- große Talwelt im Hochformat
- Hof, Wald, Mühle, Sägewerk, Bergwerk, Dorf, Hafen, Fischerei und Leuchtturm
- Fahrzeuge mit echten Routen und Außenwelt-Spawn
- Traktor und Mähdrescher sichtbar, Anbaugeräte in der Werkstatt
- Feldzustände, Wachstum, Ernte und Offline-Timer
- Silo und Scheune
- Gebäudeverbesserungen mit Handwerkerauto und Baustelle
- Mühle/Mehl
- Hühner/Eier
- Kühe/Milch
- Bäckeraufträge
- Level/XP/Geld
- Autosave + Backup-Save
- Tag/Nacht-Grundsystem
- Sonne, Regen und Nebel
- dezente Wolken und kleine Vögel
- keine sichtbaren Menschen/NPCs
- DEV-Modus mit Zeit, Wetter, Geld, Timer und Debug-Layern
- Performance-Grundlagen: Canvas, sichtbarer Weltbereich, einfache Layer und begrenzte Effekte

## Wichtig zur Grafik

Die 0.1.0 verwendet absichtlich **prozedural gezeichnete Spielgrafik** als technische Basis. Sie ist keine riesige Hintergrundgrafik. Dadurch bleiben Kamera, Schärfe, Layer, Fahrzeuge und spätere Asset-Ersetzungen sauber voneinander getrennt.

Der bestätigte visuelle Zielstil bleibt: hochwertiges, scharfes Mobile-Farming-Spiel in 3D-/2.5D-Vogelperspektive. Die prozeduralen Platzhalter können später Zone für Zone durch finale Assets ersetzt werden, ohne das Gameplay neu zu programmieren.

## Struktur

```text
Farm-Spiel/
├── index.html
├── styles/
│   └── main.css
├── src/
│   ├── main.js
│   ├── Game.js
│   ├── config.js
│   ├── core/
│   │   ├── eventBus.js
│   │   └── save.js
│   ├── data/
│   │   ├── missions.js
│   │   └── worldData.js
│   ├── systems/
│   │   ├── missions.js
│   │   ├── timeSystems.js
│   │   └── vehicles.js
│   ├── ui/
│   │   └── ui.js
│   └── world/
│       ├── camera.js
│       ├── input.js
│       └── renderer.js
├── VERSION
├── CHANGELOG.md
└── .nojekyll
```

## Entwicklungsregel

Neue Features werden nicht in eine riesige Datei geworfen. Daten, Welt, Kamera, Fahrzeuge, Speichern und UI bleiben getrennt. Erst wenn ein Schritt stabil läuft, kommt der nächste.
