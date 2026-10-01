# FS-014 – Save Migration Hardening

## Status
`APPROVED`

## Ausgangs-SHA
`97521efe5c0bbbcf5e4dd347f9bde4ab1759f6c9`

## Implementierungs-Commit
`b9479f9fb275f2b33dda952c349dc99a3a91f4c5`

## Version
`0.3.0-dev`

## Ziel
Den in FS-013 eingeführten Save-v2-Migrationskern gegen beschädigte, unplausible und veraltete Daten härten, ohne legitimen Spielerfortschritt oder die noch bis FS-015 benötigte Visual-Migrationsmarkierung zu verlieren.

## Was ändert sich im Spiel?
Beschädigte oder falsche Speicherwerte werden beim Laden und Speichern kontrolliert bereinigt. Dadurch gelangen weniger kaputte Daten in Gameplay-Systeme und alte Spielstände bleiben stabiler.

## Review
Durchgeführt durch:
ChatGPT

Ergebnis:
`APPROVED`

Geprüft:
- Implementierungs-Commit ist direkter Nachfolger des FS-013-Abschluss-SHA.
- Commit-Nachricht entspricht dem Ticket.
- Exakt die fünf vorgesehenen Dateien wurden verändert bzw. neu angelegt.
- Unbekannte Root-/Nested-Felder werden entfernt.
- `world.visualVersion` bleibt bis FS-015 erhalten.
- Kernwerte werden auf Typ und gültige Bereiche geprüft.
- Negative Geld-/Inventar-/Lagerwerte werden nicht übernommen.
- Feldstatus, Wetter, TimeScale und Harvest-Fortschritt werden validiert.
- Construction/sideOrder akzeptieren nur Objekt oder null.
- Kaputte Fahrzeuge und Routen werden verworfen.
- Unbekannte Vehicle-Felder werden entfernt.
- `SaveManager.save()` sanitisiert und synchronisiert den Live-State.
- Backup- und Save-v2-Migrationslogik aus FS-013 bleibt erhalten.
- Kein Gameplay-, Welt-, Renderer- oder Kamera-Scope wurde vorgezogen.

## Tests
Save-Hardening:
`PASS` – 15/15 Subtests

Komplette Node-Test-Suite im Installer:
`PASS` – 83/83 Subtests

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
- Construction und sideOrder werden nur strukturell, nicht tief semantisch validiert.
- `world.visualVersion` bleibt ein Übergangssonderfall bis FS-015.
- LocalStorage-Key bleibt aus Kompatibilitätsgründen unverändert.

## Abschluss
FS-014 ist abgeschlossen und `APPROVED`.

FS-015 wurde nicht automatisch gestartet und benötigt eine separate Freigabe von Lukas.
