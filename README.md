# Farm-Spiel 0.2.0 – modulare Grafikbasis

200 einzeln benannte WebP-Grafiken nach dem Asset-Katalog, eine aus Einzelobjekten zusammengesetzte Karte (3200 × 5400 Welteinheiten) mit großer freier Hoffläche und die bestehende Missionskette für Level 1–10.

## Start

`index.html` über GitHub Pages oder einen lokalen Webserver öffnen. Mit einem Finger verschieben, mit zwei Fingern zoomen. Die untere Navigation führt zu Hof, Dorf, Hafen und Gesamtkarte. `asset-katalog.html` zeigt alle 200 Dateien mit Suche, Kategorien und Download.

## Dateien

- `assets/world/`: 200 separate Kataloggrafiken; ursprüngliches Weltbild zur historischen Kompatibilität.
- `assets/catalog/manifest.json`: Dateipfade, Exportmaße, ursprüngliche Pixelmaße, Anker und Produktionsstatus.
- `src/data/modularWorld.js`: Positionen der Landschaft und Einzelobjekte.
- `docs/Farm-Spiel_Asset-Katalog_v1.*`: ursprünglicher Markdown- und JSON-Katalog.

## Qualität und Umfang

Dies ist eine **Grafikbasis**, keine vollständig fertig animierte Produktion. 117 Motive wurden aus kleineren erzeugten Motiven auf die Katalogmaße hochskaliert. Exportmaße sind deshalb nicht mit nativer Detailauflösung gleichzusetzen; `source_width_px`, `source_height_px` und `upscaled` dokumentieren das je Datei. Zoomen kann keine zusätzlichen Bilddetails erzeugen. Der Katalog nennt außerdem geplante Zustände und Animationen; vollständige Richtungs- und Animationsserien sind noch nicht enthalten. Die freie Hoffläche ist für späteres Bauen vorgesehen, ein neuer Gebäudeplatzierungsmodus ist nicht implementiert.

Die Laufzeit lädt sichtbare Grafiken bedarfsweise und begrenzt den dekodierten Bildspeicher auf etwa 64 MiB. Spielstände bleiben unter dem bestehenden Speicherschlüssel erhalten; Fahrzeugpositionen älterer Spielstände werden einmalig auf die größere Welt umgerechnet.
