# FS-013 – Save Schema v2 / Migration Core

## Status
`APPROVED`

## Ausgangs-SHA
`31b3166191ad6114804bb61392b17db84f2fd258`

## Implementierungs-Commit
`06468f02f16aa24133987c4e0c9424f919212830`

## Version
`0.3.0-dev`

## Ziel
Das bisherige implizite Save-Merging durch ein echtes versioniertes Save-Schema mit kontrollierter schrittweiser Migration ersetzen. Bestehende Spielstände aus Schema v1 müssen ohne Verlust des Spielerfortschritts auf Schema v2 geladen werden können.

## Was ändert sich im Spiel?
Für den Spieler ändert sich sichtbar fast nichts: vorhandene Spielstände werden beim Laden kontrolliert auf Save-Schema v2 angehoben, sodass spätere Updates sicherer auf bestehenden Spielständen aufbauen können.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-012-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die fünf vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- `CURRENT_SAVE_VERSION` ist 2.
- Neue Spielstände starten mit Save-v2.
- v1-Spielstände werden explizit über `v1 -> v2` migriert.
- Spielstände ohne Versionsnummer werden als Legacy-v1 behandelt.
- Migrationen müssen ihre Version erhöhen.
- Future-Saves werden nicht still heruntergestuft.
- Ungültige Save-Versionen werden abgelehnt.
- Spielerfortschritt bleibt bei v1→v2 erhalten.
- `SaveManager.save()` schreibt aktuelle Save- und Game-Version.
- Backup-Fallback bleibt erhalten.
- Der bestehende LocalStorage-Key bleibt bewusst unverändert.
- Visual-Migration bleibt bewusst außerhalb von FS-013.

## Tests
Save-Migration-Core:
`PASS` – 9/9 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 77/77 Subtests

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
- Unbekannte zusätzliche Save-Felder werden aktuell weiterhin vom Deep-Merge übernommen.
- Tiefe Typ-/Wertevalidierung folgt in FS-014.
- Die Visual-Migration bleibt bis FS-015 in `main.js`.
- Der LocalStorage-Key enthält aus Kompatibilitätsgründen weiterhin `v1`.

## Abschluss
FS-013 ist abgeschlossen und `APPROVED`.

FS-014 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
