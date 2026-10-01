# Farm-Spiel – Test Plan

## Ziel
Jede wichtige Änderung muss überprüfbar sein.
Keine angenommenen Tests.

---

# Testergebnisse
Erlaubt:
- `PASS`
- `FAIL`
- `NOT TESTED`

Ein Test darf nur als `PASS` dokumentiert werden, wenn er tatsächlich ausgeführt wurde.

---

# Automatische Installer-Prüfungen

Der sichere Ticket-Installer führt vor einem Push auf `develop` automatisch aus:

1. Payload-, Base-SHA-, Pfad- und Hash-Prüfung
2. exakter Changed-File-Scope
3. `git diff --check`
4. JavaScript-Syntaxprüfung für alle `.js`, `.mjs` und `.cjs`
5. JSON-Parsing für alle JSON-Dateien
6. vorhandene Node-Testdateien `*.test.js`, `*.test.mjs`, `*.test.cjs`

Wenn eine dieser Prüfungen fehlschlägt, darf kein Push auf `develop` erfolgen.

Die Tests laufen ohne im Checkout gespeicherte Git-Zugangsdaten.
Das Schreib-Token wird erst im getrennten Push-Schritt verwendet.

---

# Node Core Tests

Aktuell vorhanden:

- `tests/economy.test.js`
- `tests/inventory.test.js`

Lokal oder in einer geeigneten Node-Umgebung:

`npm test`

Neue Domain-Systeme sollen mit gezielten Unit-Tests ergänzt werden, sobald ihre Logik unabhängig testbar ist.

---

# Browser Smoke Test
Regelmäßig manuell oder über eine spätere Browser-Testumgebung:

1. Spiel öffnen
2. keine kritische Exception
3. Welt sichtbar
4. UI sichtbar
5. Interaktion möglich

---

# Mobile Test
Auf echter Touch-Umgebung:

1. Ein-Finger-Pan
2. Zwei-Finger-Zoom
3. Tap
4. UI-Touchflächen
5. Hochformat
6. Safe Areas
7. keine ungewollte Seitengeste

---

# Save Test

1. Zustand verändern
2. speichern
3. Anwendung schließen oder neu laden
4. Zustand erneut laden
5. Werte vergleichen

---

# Core Gameplay Test
Nach Milestone 1:

1. Saat kaufen
2. Feld auswählen
3. pflanzen
4. Wachstum abschließen
5. ernten
6. Silo prüfen
7. verkaufen
8. Farmercoins prüfen
9. erneut Saat kaufen
10. Kreislauf wiederholen

---

# Regression
Neue Tickets dürfen bereits funktionierende Systeme nicht ungeprüft beschädigen.

Mindestens:
- alle automatischen Core-Tests müssen weiter bestehen
- die vom Ticket berührten Systeme müssen gezielt geprüft werden
- nicht automatisierbare Browser-/Mobile-Punkte bleiben ehrlich `NOT TESTED`

---

# Performance
Später prüfen:
- lange Spielsitzung
- schnelles Panning
- starkes Zoomen
- mehrere Fahrzeuge
- viele Weltobjekte
- Asset-Speicher
- FPS
- Speicherwachstum
- Smartphone-Abstürze

---

# Review-Regel
Ein Ticket kann trotz `NOT TESTED` akzeptiert werden, wenn die nicht testbaren Punkte außerhalb der technischen Reichweite der ausführenden Umgebung liegen.

Offene Tests müssen dokumentiert bleiben.
