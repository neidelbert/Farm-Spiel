# FS-011 – Harvest Core

## Status
`APPROVED`

## Ausgangs-SHA
`46fbd9c002e0073fd590375ff3fdd64178f1366f`

## Implementierungs-Commit
`aacdfa225c138ba06aa966d415accee52ac1f82e`

## Version
`0.3.0-dev`

## Ziel
Die Ernte aus der Tutorial-Mission lösen und als normalen, kapazitätssicheren Gameplay-Ablauf nutzbar machen. Erntebereitschaft, Mähdrescher-Verfügbarkeit, Ertrag, Lagerkapazität und Feld-Reset werden zentral über bestehende Domain-Systeme koordiniert.

## Was ändert sich im Spiel?
Reifer Weizen kann unabhängig vom Tutorial geerntet werden. Der Mähdrescher startet nur, wenn er verfügbar ist und die komplette Ernte ins Silo passt; nach erfolgreichem Einlagern wird das Feld wieder für die nächste Aussaat vorbereitet.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/config.js`
- `src/systems/harvest.js` – neu

## Neue Tests
- `tests/harvest.test.js`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-010-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die sieben vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- HarvestSystem enthält keine Mission-IDs.
- Ernte kann außerhalb des Tutorials gestartet werden.
- Mähdrescher-Verfügbarkeit wird vor dem Start geprüft.
- CropSystem liefert Ertrag, Ernte-Item und Ziel-Lager.
- InventorySystem prüft vollständige Lagerkapazität.
- FieldSystem übernimmt Ernte- und Reset-Übergänge.
- Kein Teil-Ertrag und kein stilles Verwerfen bei vollem Silo.
- Bereits geschnittene Ernte bleibt bei nachträglich fehlendem Lagerplatz erhalten.
- Nach erfolgreicher Einlagerung wird das Feld wieder `prepared`.
- Der generische Eventname `harvest_wheat` ersetzt den tutorialgebundenen `first_harvest`-Fahrzeugpfad.
- `CONFIG.economy.wheatYield` wurde entfernt; CropSystem ist die zentrale Ertragsquelle.
- Kein Selling-Core oder anderer Folgescope wurde vorgezogen.

## Tests
HarvestSystem:
`PASS` – 10/10 Subtests

Vorhandene + neue lokale Node-Test-Suite vor Installer:
`PASS` – 58/58 Subtests

Installer-Commit-Gate:
`PASS` – der erwartete Commit wurde auf `develop` erzeugt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bewusst nicht umgesetzt
- kein Selling-Core
- kein Dünger-Gameplay
- keine neuen Crop-Arten
- keine neuen Maschinen
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung
- keine Teilernte/Overflow-Box

## Abschluss
FS-011 ist abgeschlossen und `APPROVED`.

FS-012 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
