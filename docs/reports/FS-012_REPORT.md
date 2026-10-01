# FS-012 – Development Report

## Ticket
`FS-012` – Selling Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`ffbbbeb78d38308914112b10ac93bd36d588c617`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

Der exakte Commit-SHA wird erst vom freigegebenen GitHub Ticket Installer erzeugt und im Review ergänzt.

## Ergebnis
Der Weizenverkauf wurde aus dem Tutorial entkoppelt und als wiederholbarer Verkauf über den bestehenden Hof-/Truck-Verkaufspunkt umgesetzt.

Neu:
- `src/systems/selling.js`
- `tests/selling.test.js`
- `docs/tasks/FS-012_SELLING-CORE.md`
- `docs/reports/FS-012_REPORT.md`

Aktualisiert:
- `src/Game.js`
- `src/config.js`
- `docs/TASKS.md`

## Was ändert sich im Spiel?
Am Verkaufstruck können jederzeit 5 Weizen für 35 F verkauft werden, sobald genug Weizen im Silo liegt. Der erste Verkaufsauftrag erklärt nur noch diese normale Spielfunktion.

## Wichtige Änderungen
- Neues SellingSystem bündelt Angebot, Verfügbarkeit und atomaren Verkauf.
- SellingSystem enthält keine Mission-IDs.
- 5 Weizen → 35 F bleibt als bisherige Wirtschaft erhalten.
- Warenentnahme läuft über InventorySystem.
- Farmercoin-Gutschrift läuft über EconomySystem.
- Fehlgeschlagene Gutschriften rollen die Warenentnahme zurück.
- Verkaufstruck zeigt Live-Bestand und Verkaufserlös.
- Erfolgreicher Verkauf erzeugt eine sichtbare Lieferwagen-Fahrt.
- Das Tutorial `first_order` verweist auf den Truck statt den Verkauf selbst zu erzeugen.
- Die Tutorialmission wird direkt nach einem erfolgreichen Verkauf fortgesetzt.
- `firstOrderReward` wurde durch `wheatSaleReward` ersetzt.
- Der normale Verkaufs-Event heißt `sell_wheat`.

## Tests vor Installer-Ausführung
JavaScript-Syntax `src/config.js`:
`PASS`

JavaScript-Syntax `src/Game.js`:
`PASS`

JavaScript-Syntax `src/systems/selling.js`:
`PASS`

SellingSystem:
`PASS` – 10/10 Subtests

Vorhandene + neue lokale Node-Test-Suite:
`PASS` – 68/68 Subtests

GitHub Ticket Installer:
`NOT TESTED` – wird erst beim Hochladen dieses Payloads ausgeführt.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Probleme / Risiken
- Es existiert weiterhin nur ein vollwertiges Gameplay-Feld.
- Aktuell gibt es nur das Weizen-Verkaufsangebot.
- Marktpreise sind statisch.
- Die sichtbare Lieferwagenfahrt ist Reaktion auf den bereits atomar abgeschlossenen Verkauf; sie ist nicht die wirtschaftliche Transaktion selbst.

## Bewusst nicht umgesetzt
- keine dynamischen Marktpreise
- keine weiteren Produkte
- keine Save-v2-Migration
- kein Dünger-Gameplay
- keine Multi-Field-Erweiterung
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-012 auf ChatGPT-Review.
Das Folgeticket wurde nicht begonnen.
