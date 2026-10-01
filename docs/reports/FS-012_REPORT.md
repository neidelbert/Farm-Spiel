# FS-012 – Review Report

## Ticket
`FS-012` – Selling Core

## Status
`APPROVED`

## Ausgangs-SHA
`ffbbbeb78d38308914112b10ac93bd36d588c617`

## Implementierungs-Commit / Ergebnis-SHA
`cce69a1a16b0efec7e333a8c101945f3dbfdc543`

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

## Was ändert sich im Spiel?
Am Verkaufstruck können 5 Weizen wiederholt für 35 F verkauft werden. Damit funktioniert der Core-Loop Saat kaufen → säen → wachsen → ernten → einlagern → verkaufen → Farmercoins erhalten unabhängig vom Tutorial.

## Review-Ergebnis
Geprüft wurde:
- korrekter Parent-SHA
- korrekte Commit-Nachricht
- exakt sieben erwartete Ticket-Dateien
- SellingSystem ohne Mission-IDs
- wiederholbarer Verkauf außerhalb des Tutorials
- 5 Weizen → 35 F als bestehende Wirtschaft
- InventorySystem für Warenentnahme
- EconomySystem für Farmercoin-Gutschrift
- atomarer Rollback bei fehlgeschlagener Gutschrift
- kein Fallback für unbekannte Verkaufs-IDs
- normaler Verkaufspunkt über `loading`
- sichtbare Reaktion über `sell_wheat`
- Tutorial bleibt Erklärung statt Quelle der Mechanik
- keine Vorwegnahme der Save-Tickets

## Tests
SellingSystem:
`PASS` – 10/10 Subtests

Installer Node-Test-Suite:
`PASS` – 68/68 Subtests

Installer-Workflow:
`PASS`

Remote-Push-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- Aktuell gibt es nur das Weizen-Verkaufsangebot.
- Marktpreise sind statisch.
- Es existiert weiterhin nur ein vollwertiges Gameplay-Feld.
- Die Lieferwagenfahrt visualisiert einen bereits abgeschlossenen Verkauf.

## Abschluss
FS-012 ist abgeschlossen und `APPROVED`.

Als nächster technischer Block folgt die Save-Migration:
`FS-013` – Save Schema v2 / Migration Core.
