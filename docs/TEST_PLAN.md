# Farm-Spiel – Test Plan
## Ziel
Jede wichtige Änderung muss überprüfbar sein.
Keine angenommenen Tests.
---
# Testergebnisse
Erlaubt:
PASS
FAIL
NOT TESTED
---
# Statische Tests
Soweit technisch möglich:
- JavaScript-Syntax
- Importpfade
- fehlende Dateien
- ungültige Referenzen
- unerwartete Änderungen
---
# Browser Smoke Test
Später regelmäßig:
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
Mindestens die vom Ticket berührten Kernsysteme erneut prüfen.
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
Ein Ticket kann trotz NOT TESTED akzeptiert werden, wenn die nicht testbaren Punkte außerhalb der technischen Reichweite der ausführenden Umgebung liegen.
Diese offenen Tests müssen jedoch dokumentiert bleiben.
