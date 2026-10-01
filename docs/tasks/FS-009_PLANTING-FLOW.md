# FS-009 – Planting Flow

## Status
`APPROVED`

## Ausgangs-SHA
`aca0c62905c69a58f9b9fcc29c0a10cb0682cb3e`

## Implementierungs-Commit
`fce6174e8082422e5145036d6d024b02f1e0c76d`

## Version
`0.3.0-dev`

## Ziel
Saatgutkauf und Aussaat aus der Tutorial-Mission lösen und als normalen Gameplay-Ablauf nutzbar machen, ohne FS-010 bis FS-012 funktional vorwegzunehmen.

## Was ändert sich im Spiel?
Der Hofkatalog und die Weizen-Aussaat funktionieren nicht mehr nur während der ersten Saat-Mission; ein vorbereitetes Feld mit Saatgut kann unabhängig vom aktuellen Missionszustand bepflanzt werden.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/systems/planting.js` – neu

## Neue Tests
- `tests/planting.test.js`

## PlantingSystem API
- `getSeedPrice(cropId)`
- `canBuySeed(cropId)`
- `buySeed(cropId)`
- `receiveSeed(cropId, amount)`
- `canStartSowing(cropId)`
- `startSowing(cropId)`
- `completeSowing(cropId, plantedAt)`

## Technische Anforderungen
- PlantingSystem kennt keine Mission-IDs.
- Saatgutpreis kommt aus `EconomySystem`.
- Saatgut-Item und Wachstumsdauer kommen aus `CropSystem`.
- Feldübergänge laufen über `FieldSystem`.
- Saatgutlieferungen addieren jeden gekauften Sack und überschreiben keinen vorhandenen Bestand.
- Tutorial-Fortschritt bleibt als optionale Reaktion in `Game.js` erhalten.
- Der Hofkatalog bleibt während und nach der Einführung erreichbar.
- Die Aussaat startet bei vorbereitetem Feld + vorhandenem Saatgut unabhängig von `missionId`.
- Beim Abschluss der Aussaat wird genau ein Saatgutsack verbraucht.
- Die Weizen-Wachstumsdauer wird beim Pflanzen aus der zentralen Crop-Definition genommen: 5:00.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des erwarteten FS-008-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Genau die sechs vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- PlantingSystem enthält keine Mission-IDs.
- Saatpreis, Saatgut-Item und Wachstumsdauer kommen aus den bestehenden Domain-Systemen.
- Feldstatus wird über FieldSystem verändert.
- Saatgutlieferungen stapeln vorhandenen Bestand.
- Aussaat ist nicht mehr an `first_seed` gebunden.
- Tutorial-Fortschritt bleibt erhalten.
- Der alte 4-Minuten-Wert wird im neuen Planting Flow nicht mehr verwendet.
- Weizen erhält beim Pflanzen 5:00 aus der zentralen Crop-Definition.
- Kein FS-010-, FS-011- oder FS-012-Scope wurde funktional vorgezogen.

## Tests
Lokale Node-Test-Suite vor Installer:
`PASS` – 40/40 Subtests

PlantingSystem:
`PASS` – 8/8 Subtests

Installer-Commit-Gate:
`PASS` – der freigegebene Installer hat den erwarteten Commit auf `develop` erzeugt.

GitHub-Actions-Run-Metadaten:
`NOT TESTED` – der konkrete Workflow-Run konnte über den aktuellen Read-Zugriff nicht separat abgefragt werden.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bewusst nicht umgesetzt
- kein Feld-Reset nach Ernte; das gehört zu FS-011
- keine neue Growth-/Offline-Logik; das gehört zu FS-010
- kein Dünger-Gameplay
- keine Harvest-Änderung
- keine Selling-Änderung
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung
- keine neue Crop-Art

## Abschluss
FS-009 ist abgeschlossen und `APPROVED`.

FS-010 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
