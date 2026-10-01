# FS-012 – Selling Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`ffbbbeb78d38308914112b10ac93bd36d588c617`

## Version
`0.3.0-dev`

## Ziel
Den Verkauf von Hofware aus dem Tutorial lösen und als wiederholbaren normalen Gameplay-Ablauf über den Hof-/Truck-Verkaufspunkt nutzbar machen. Der Verkauf muss Inventar und Farmercoins atomar verändern und darf keine Mission voraussetzen.

## Was ändert sich im Spiel?
Am Verkaufstruck können 5 Weizen wiederholt für 35 F verkauft werden – unabhängig vom Tutorial. Der erste Verkaufsauftrag führt nur noch zum Truck und erklärt die Funktion.

## Geänderte Source-Dateien
- `src/Game.js`
- `src/config.js`
- `src/systems/selling.js` – neu

## Neue Tests
- `tests/selling.test.js`

## SellingSystem API
- `has(saleId)`
- `getOffer(saleId)`
- `canSell(saleId)`
- `sell(saleId)`

## Technische Anforderungen
- SellingSystem kennt keine Mission-IDs.
- Verkauf funktioniert außerhalb des Tutorials.
- Standardangebot bleibt wirtschaftlich kompatibel zum bisherigen ersten Auftrag: 5 Weizen → 35 F.
- `InventorySystem` ist die einzige Quelle für Warenprüfung und Warenentnahme.
- `EconomySystem` ist die einzige Quelle für Farmercoin-Gutschriften.
- Verkauf ist atomar: Waren werden nur entfernt, wenn die Farmercoin-Gutschrift erfolgreich ist; bei Fehlschlag erfolgt Rollback.
- Unbekannte Verkaufs-IDs haben keinen stillen Fallback.
- Der Hof-/Truck-Verkaufspunkt (`loading`) zeigt Bestand, Menge und Erlös.
- Während eine sichtbare Verkaufsfahrt läuft, kann kein zweiter Verkauf parallel gestartet werden.
- Eine erfolgreiche Verkaufsaktion löst eine sichtbare Lieferwagen-Reaktion aus.
- Das Tutorial `first_order` führt den Spieler zum Verkaufstruck, erzeugt die Verkaufsfunktion aber nicht mehr.
- Der Tutorialfortschritt reagiert optional auf einen erfolgreichen ersten Weizenverkauf.
- `firstOrderReward` wird in `wheatSaleReward` umbenannt; 35 F bleiben unverändert.
- Der alte Fahrzeug-Eventpfad `first_order` wird nicht mehr für die Verkaufslogik verwendet; normaler Verkauf nutzt `sell_wheat`.
- Nach FS-012 ist der grundlegende Loop Saat kaufen → säen → wachsen → ernten → einlagern → verkaufen → Farmercoins erhalten wiederholbar.

## Bewusst nicht umgesetzt
- keine dynamischen Marktpreise
- keine weiteren Verkaufswaren
- keine Verkaufswarteschlange
- keine Teilmengen-Auswahl
- kein Dünger-Gameplay
- keine neuen Felder
- keine Save-Schema-Änderung
- keine Renderer-/Kamera-/Weltänderung
- keine Änderung am 90er-Truck-Asset selbst

## Tests
Vor dem Payload lokal reproduziert:
- JavaScript-Syntax `src/config.js`: `PASS`
- JavaScript-Syntax `src/Game.js`: `PASS`
- JavaScript-Syntax `src/systems/selling.js`: `PASS`
- SellingSystem: 10/10 `PASS`
- vorhandene + neue Node-Test-Suite: 68/68 `PASS`

Installer muss zusätzlich den vollständigen Repository-Stand erneut prüfen und testen.

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Commit-Nachricht
`FS-012: Add repeatable truck selling core`

## STOP
Nach erfolgreichem Installer-Commit:
`READY_FOR_REVIEW`

Das nächste Gameplay-Ticket darf erst nach separatem ChatGPT-Review von FS-012 gestartet werden.
