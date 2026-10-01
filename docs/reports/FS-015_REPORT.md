# FS-015 – Development Report

## Ticket
`FS-015` – Save/Visual Migration Cleanup

## Status
`READY_FOR_REVIEW`

## Ausgangs-SHA
`4ef2ef3a807e59f8114318a0658f6b395d708b69`

## Ergebnis-SHA / Implementierungs-Commit
`PENDING_INSTALLER_RESULT`

## Ergebnis
Die bisherige Boot-Migration für Fahrzeugkoordinaten wurde in eine echte Save-v2→v3-Migration überführt.

## Was ändert sich im Spiel?
Ältere Fahrzeugpositionen werden beim Laden genau einmal angepasst; bereits migrierte Spielstände bleiben unverändert.

## Wichtige Änderungen
- Save-Schema ist jetzt v3.
- Neue Migration `v2 -> v3`.
- Alte Skalierungsfaktoren aus `main.js` wurden unverändert übernommen.
- `visualVersion: 2` verhindert Doppel-Skalierung bei bereits migrierten v2-Spielständen.
- Der Marker wird nach der Migration entfernt.
- v3-Saves sind idempotent und benötigen keinen Visual-Sondermarker.
- `main.js` enthält keine Koordinatenmigration mehr.
- Save-Hardening aus FS-014 bleibt aktiv.
- LocalStorage-Key bleibt absichtlich kompatibel.

## Tests vor Installer-Ausführung
Save/Visual-Migration-Testdatei:
`PASS`

Vollständige Repository-Test-Suite:
`NOT TESTED` – wird vom Installer ausgeführt.

GitHub Ticket Installer:
`NOT TESTED`

Browser:
`NOT TESTED`

Gameplay auf Gerät:
`NOT TESTED`

Mobile/Touch:
`NOT TESTED`

## Bekannte Grenzen
- Der LocalStorage-Key heißt weiterhin `farm-spiel-save-v1`; dies ist bewusst eine Speicher-Slot-Bezeichnung und wird für bestehende Geräte nicht umbenannt.
- Andere Welt-Source-of-Truth-Probleme sind nicht Teil dieses Tickets.
- Echte iPhone-Runtime-Migration bleibt bis zu einem Geräte-Test `NOT TESTED`.

## Bewusst nicht umgesetzt
- keine Key-Migration
- keine Welt-/Renderer-/Kameraänderung
- keine Gameplay-Änderung

## Abschluss
Nach erfolgreichem Installer-Run wartet FS-015 auf ChatGPT-Review.
Das Folgeticket wurde nicht begonnen.
