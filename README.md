# Farm-Spiel 0.3.0-dev – Core-Rebuild auf modularer Grafikbasis

Farm-Spiel befindet sich auf `develop` im kontrollierten 0.3-Core-Rebuild. Die bestehende modulare Grafikbasis und Welt bleiben erhalten, während Wirtschaft, Inventar und die folgenden Gameplay-Systeme schrittweise aus dem monolithischen Core herausgelöst werden.

Der stabile öffentliche Stand bleibt von der laufenden 0.3-Entwicklung getrennt.

## Aktueller Entwicklungsstand

Abgeschlossen und geprüft:
- Foundation / Entwicklungsprozess
- State Audit
- Event-ID Audit
- Economy Core
- Inventory Core

Nächster geplanter Schritt:
- `FS-007` – Field System Core

Die verbindliche Reihenfolge steht in `docs/ROADMAP_0.3.md` und `docs/TASKS.md`.

## Start

`index.html` über GitHub Pages oder einen lokalen Webserver öffnen. Mit einem Finger verschieben, mit zwei Fingern zoomen. Die untere Navigation führt zu Hof, Dorf, Hafen und Gesamtkarte. `asset-katalog.html` zeigt die vorhandenen Grafikbausteine mit Suche und Kategorien.

## Wichtige Dateien

- `src/Game.js`: aktuelle Orchestrierung; soll schrittweise kleiner werden.
- `src/systems/economy.js`: zentraler Economy Core.
- `src/systems/inventory.js`: zentraler Inventory Core.
- `src/world/renderer.js`: aktueller Renderer; baut noch auf `legacyRenderer.js` auf.
- `assets/world/`: separate Weltgrafiken.
- `assets/catalog/manifest.json`: Asset-Metadaten und Produktionsstand.
- `src/data/modularWorld.js`: Positionen der Landschaft und Einzelobjekte.
- `docs/Farm-Spiel_Asset-Katalog_v1.*`: ursprünglicher Markdown- und JSON-Katalog.
- `docs/AI_DEVELOPER_RULES.md`: verbindlicher Entwicklungsprozess.

## Grafikbasis

Die Welt besteht aus einzeln benannten WebP-Grafiken nach dem Asset-Katalog und einer aus Einzelobjekten zusammengesetzten Karte mit großer freier Hoffläche. Ein Teil der Grafiken wurde aus kleineren generierten Motiven auf die Katalogmaße hochskaliert. Exportmaße sind deshalb nicht mit nativer Detailauflösung gleichzusetzen; `source_width_px`, `source_height_px` und `upscaled` dokumentieren das je Datei.

Die Grafikbasis ist nicht mit einer finalen vollständig animierten Produktion gleichzusetzen. Vollständige Richtungs- und Animationsserien sind noch nicht für alle Objekte vorhanden.

## Entwicklung

Gameplay-Tickets werden auf `develop` umgesetzt. `main` bleibt stabil und enthält die freigegebene Installer-Infrastruktur. `baseline/0.2.0` bleibt als unveränderliche Rückfallebene erhalten.

Neue Fachlogik soll in das zuständige Domain-System statt ungeplant weiter in `Game.js` eingebaut werden. Missionen erklären Gameplay, sollen die Kernmechaniken aber nicht besitzen.
