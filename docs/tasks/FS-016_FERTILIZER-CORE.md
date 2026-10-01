# FS-016 – Fertilizer Core

## Status
`APPROVED`

## Ausgangs-SHA
`52492a49b70ae062b63e8b68450b869dc7949913`

## Implementierungs-Commit
`2a2fb3f2379e0e26c1beae39f5de4041c6619927`

## Version
`0.3.0-dev`

## Ziel
Dünger als echten, missionsunabhängigen Bestandteil des Farming-Loops einführen.

## Was ändert sich im Spiel?
Ab Level 4 kann der Spieler im Hofkatalog 2 Säcke Dünger für 15 F kaufen. Ein wachsendes Weizenfeld kann einmal mit 1 Sack gedüngt werden. Dadurch sinkt die verbleibende Wachstumszeit auf 2:00 Minuten. Bei 2:20 Restzeit oder weniger ist Düngen gesperrt.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-015-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt 14 erwartete Dateien wurden geändert bzw. neu angelegt.
- Neues `FertilizerSystem` enthält keine Mission-IDs.
- Dünger wird ab Level 4 freigeschaltet.
- Packgröße bleibt 2 Säcke für 15 F.
- Pro Feldanwendung wird 1 Sack verbraucht.
- Weizen-Basiswachstum bleibt 5:00 Minuten.
- Gedüngtes Wachstum wird auf 2:00 Minuten Restzeit gesetzt.
- Bei exakt 2:20 Restzeit oder weniger wird Düngen blockiert.
- Feld kann pro Wachstumszyklus nur einmal gedüngt werden.
- Feld-Reset entfernt den Düngezustand für die nächste Aussaat.
- Katalog und Feldpanel zeigen den neuen Düngerzustand.
- Save-v3 speichert Düngerbestand und Düngezustand rückwärtskompatibel.
- Bestehende Crop-, Field- und Harvest-Tests wurden nur an die bewusst erweiterten Datenstrukturen angepasst.
- Kein Multi-Field-, Maschinen-, Welt-, Renderer- oder Kamera-Scope wurde vorgezogen.

## Installer-Verlauf
Erster Versuch:
`FAIL` – 97/100 Tests; drei bestehende Tests erwarteten noch die alten Datenstrukturen. Kein Commit wurde gepusht.

Korrigierter Versuch:
`PASS`

## Tests
FertilizerSystem:
`PASS` – 13/13 Subtests

Komplette Node-Test-Suite im korrigierten Installer:
`PASS` – 100/100 Subtests

Installer-Workflow:
`PASS`

Push:
`PASS`

Remote-Verifikation:
`PASS`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Abschluss
FS-016 ist abgeschlossen und `APPROVED`.

Nächster Roadmap-Schritt:
`FS-017` – Camera Stabilization.
