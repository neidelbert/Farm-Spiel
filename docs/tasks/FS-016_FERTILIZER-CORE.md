# FS-016 – Fertilizer Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`52492a49b70ae062b63e8b68450b869dc7949913`

## Version
`0.3.0-dev`

## Ziel
Dünger als echten, missionsunabhängigen Bestandteil des Farming-Loops einführen.

## Was ändert sich im Spiel?
Ab Level 4 kann der Spieler im Hofkatalog 2 Säcke Dünger für 15 F kaufen. Ein wachsendes Weizenfeld kann einmal mit 1 Sack gedüngt werden. Dadurch sinkt die verbleibende Wachstumszeit auf 2:00 Minuten. Bei 2:20 Restzeit oder weniger ist Düngen gesperrt.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/config.js`
- `src/core/save.js`
- `src/data/crops.js`
- `src/systems/fields.js`
- `src/systems/fertilizer.js` – neu

## Tests
- `tests/fertilizer.test.js` – neu
- `tests/save.test.js` – erweitert

## Technische Anforderungen
- Neues `FertilizerSystem` bündelt Kauf, Unlock, Feldprüfung und Anwendung.
- FertilizerSystem enthält keine Mission-IDs.
- Dünger wird ab Level 4 freigeschaltet.
- Packgröße: 2 Säcke.
- Preis: 15 F.
- 1 Sack wird pro Feldanwendung verbraucht.
- Weizen-Basiswachstum bleibt 5:00 Minuten.
- Düngen setzt die verbleibende Zeit auf höchstens 2:00 Minuten ab Anwendung.
- Bei exakt 2:20 Restzeit oder weniger ist Düngen nicht mehr erlaubt.
- Ein Feld kann pro Wachstumszyklus nur einmal gedüngt werden.
- Kauf läuft atomar über EconomySystem + InventorySystem.
- Anwendung läuft über InventorySystem + FieldSystem und rollt den Sack bei einem Feldfehler zurück.
- `FieldSystem` verwaltet `fertilized` und `fertilizedAt`.
- Beim neuen Aussaatzyklus und nach Feld-Reset werden Düngewerte zurückgesetzt.
- Hofkatalog zeigt Saatgut und ab Level 4 Dünger.
- Feldpanel zeigt Düngerbestand bzw. `Gedüngt ✓`.
- Sichtbare Reaktion: Toast + sofort sichtbar reduzierte Restzeit.
- Persistenter State erhält `inventory.fertilizer`, `field.fertilized` und `field.fertilizedAt`.
- Save-Schema bleibt v3, da die neuen Felder additive Defaults sind und bestehende v3-Saves sicher ergänzt werden.
- Bestehende Save-v1/v2/v3-Migrationen bleiben unverändert.

## Bewusst nicht umgesetzt
- kein Düngerstreuer / Traktor-Anbaugerät
- keine Fahrzeugfahrt für Dünger
- keine weiteren Düngersorten
- keine weiteren Crop-Arten
- keine Multi-Field-Erweiterung
- keine neuen Missionen
- keine Welt-/Renderer-/Kameraänderung

## Tests vor Payload
JavaScript-Syntax:
`PASS`
- `src/Game.js`
- `src/config.js`
- `src/core/save.js`
- `src/data/crops.js`
- `src/systems/fields.js`
- `src/systems/fertilizer.js`
- `tests/fertilizer.test.js`
- `tests/save.test.js`

Lokaler Regressionstest für Dünger, Save, Crop, Field und Harvest:
`PASS` – 64/64 Subtests

Erster Installer-Versuch:
`FAIL` – 3 veraltete Test-Erwartungen in `crops.test.js`, `fields.test.js` und `harvest.test.js`; kein Commit wurde gepusht.

Korrigierter Payload:
Die drei bestehenden Tests wurden ausschließlich an die bewusst erweiterten Datenstrukturen angepasst.

Vollständige Repository-Test-Suite nach Korrektur:
`NOT TESTED` – wird vom GitHub Ticket Installer erneut ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-016: Add fertilizer core`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Ein Folgeticket darf erst nach separatem ChatGPT-Review von FS-016 gestartet werden.
