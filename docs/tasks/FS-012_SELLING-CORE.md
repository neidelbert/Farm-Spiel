# FS-012 – Selling Core

## Status
`APPROVED`

## Ausgangs-SHA
`ffbbbeb78d38308914112b10ac93bd36d588c617`

## Implementierungs-Commit
`cce69a1a16b0efec7e333a8c101945f3dbfdc543`

## Version
`0.3.0-dev`

## Ziel
Den Verkauf von Hofware aus dem Tutorial lösen und als wiederholbaren normalen Gameplay-Ablauf über den Hof-/Truck-Verkaufspunkt nutzbar machen. Der Verkauf muss Inventar und Farmercoins atomar verändern und darf keine Mission voraussetzen.

## Was ändert sich im Spiel?
Am Verkaufstruck können 5 Weizen wiederholt für 35 F verkauft werden – unabhängig vom Tutorial. Der erste Verkaufsauftrag führt nur noch zum Truck und erklärt die Funktion.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-011-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die sieben vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- SellingSystem enthält keine Mission-IDs.
- Verkauf funktioniert außerhalb des Tutorials.
- Standardangebot bleibt 5 Weizen → 35 F.
- Warenprüfung und Entnahme laufen über InventorySystem.
- Farmercoin-Gutschrift läuft über EconomySystem.
- Fehlgeschlagene Gutschrift führt zum Waren-Rollback.
- Unbekannte Verkaufstypen haben keinen stillen Fallback.
- Verkaufstruck zeigt Live-Bestand, Menge und Erlös.
- Paralleler zweiter Weizenverkauf wird während einer sichtbaren Verkaufsfahrt verhindert.
- Sichtbare Fahrzeugreaktion nutzt `sell_wheat`.
- Tutorial `first_order` führt zum Verkaufstruck, erzeugt aber nicht mehr die Verkaufsfunktion.
- `firstOrderReward` wurde durch `wheatSaleReward` ersetzt.
- Der wiederholbare Grundloop ist nach FS-012 technisch geschlossen.
- Kein Save-, Dünger-, Multi-Field- oder Welt-Scope wurde vorgezogen.

## Tests
SellingSystem:
`PASS` – 10/10 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 68/68 Subtests

Installer-Commit-Gate:
`PASS`

Remote-Push-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bewusst nicht umgesetzt
- keine dynamischen Marktpreise
- keine weiteren Verkaufswaren
- keine Verkaufswarteschlange
- keine Teilmengen-Auswahl
- kein Dünger-Gameplay
- keine neuen Felder
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung

## Abschluss
FS-012 ist abgeschlossen und `APPROVED`.

FS-013 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
