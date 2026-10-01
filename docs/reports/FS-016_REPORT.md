# FS-016 – Development Report

## Ticket
`FS-016` – Fertilizer Core

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`52492a49b70ae062b63e8b68450b869dc7949913`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

## Ergebnis
Der Dünger wurde als eigener Domain-Core in den bestehenden Farming-Loop integriert.

## Was ändert sich im Spiel?
Ab Level 4 können 2 Dünger-Säcke für 15 F gekauft werden. Ein Sack verkürzt die Restzeit eines wachsenden Weizenfeldes auf 2:00 Minuten. Ab 2:20 Restzeit ist die Anwendung gesperrt.

## Wichtige Änderungen
- Neues `FertilizerSystem`.
- Düngerregeln liegen zentral in der Weizen-Crop-Definition.
- Wirtschaft: `fertilizerPackPrice = 15`.
- Packgröße: 2.
- Inventory-Item: `fertilizer`.
- Feld speichert `fertilized` und `fertilizedAt`.
- FieldSystem kontrolliert einmalige Anwendung und Reset.
- Hofkatalog enthält ab Level 4 Dünger.
- Feldpanel bietet Anwendung bzw. Kaufhinweis.
- Dünger funktioniert unabhängig von Missionen.
- Save-v3 ergänzt neue Felder rückwärtskompatibel über Defaults.
- Keine neue Save-Migration nötig.

## Tests vor Installer-Ausführung
Lokaler Regressionstest für Dünger, Save, Crop, Field und Harvest:
`PASS` – 64/64 Subtests

JavaScript-Syntax aller geänderten JS-Dateien:
`PASS`

Erster Installer-Versuch:
`FAIL` – 97/100 Tests bestanden; drei bestehende Tests erwarteten noch die alten Crop-/Field-Strukturen. Der Installer hat korrekt vor dem Push gestoppt.

Korrigierter Payload:
`tests/crops.test.js`, `tests/fields.test.js` und `tests/harvest.test.js` wurden auf die neuen Dünger-Felder angepasst.

Vollständige Repository-Test-Suite nach Korrektur:
`NOT TESTED` – wird im Installer erneut ausgeführt.

GitHub Ticket Installer:
`NOT TESTED`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- Dünger wird aktuell direkt aus dem Hofkatalog gekauft; keine sichtbare Lieferfahrt.
- Es gibt noch keinen Düngerstreuer oder Traktor-Anbaugeräte-Ablauf.
- Das Spiel besitzt weiterhin nur ein vollwertiges Gameplay-Feld.

## Bewusst nicht umgesetzt
- keine Multi-Field-Erweiterung
- keine neuen Pflanzen
- kein Düngerstreuer
- keine Welt-/Renderer-/Kameraänderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-016 auf ChatGPT-Review.
Das Folgeticket wurde nicht begonnen.
