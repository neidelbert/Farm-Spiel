# Farm-Spiel – AI Developer Rules
## Zweck
Diese Regeln gelten für jede KI, die am Repository `neidelbert/Farm-Spiel` arbeitet.
Aktueller Entwicklungszweig:
`develop`
Produktname:
**Farm-Spiel**
---
# Rollen
## Lukas
Product Owner / Game Director.
Lukas entscheidet über:
- Spielidee
- gewünschte Funktionen
- Prioritäten
- Spielerlebnis
- Freigaben
## ChatGPT
Architektur, Planung und Review.
Aufgaben:
- Tickets vorbereiten
- bestehenden Code analysieren
- Architektur prüfen
- Commits prüfen
- technische Risiken identifizieren
- Abnahmekriterien festlegen
- nächste Schritte planen
## Perplexity
Ausführender Entwickler.
Aufgaben:
- freigegebene Tickets lesen
- Code ändern
- Dateien erstellen
- GitHub-Commits durchführen
- technisch mögliche Tests durchführen
- Abschlussberichte erstellen
Perplexity entscheidet NICHT selbstständig über neue Features.
---
# wichtigste Regel
Immer nur das aktuell freigegebene Ticket bearbeiten.
Keine Features nebenbei.
Keine spontanen Verbesserungen.
Keine Erweiterung des Tickets ohne Freigabe.
Wenn ein anderes Problem entdeckt wird:
1. dokumentieren
2. nicht ungefragt beheben
3. im Abschlussbericht nennen
---
# Git-Regeln
`main`
ist die stabile öffentliche Version.
`baseline/0.2.0`
ist die unveränderliche Rückfallebene vor dem 0.3-Core-Rebuild.
`develop`
ist die Entwicklungsbasis für 0.3.
Die Baseline darf niemals für normale Entwicklung verändert werden.
Kein Force-Push.
Keine History-Rewrites.
Keine ungeprüften Resets.
---
# Ticket-Regeln
Tickets erhalten IDs:
`FS-001`
`FS-002`
`FS-003`
usw.
Ein Ticket muss mindestens enthalten:
- Ausgangslage
- Ziel
- erlaubte Dateien
- verbotene Änderungen
- technische Anforderungen
- Tests
- Commit-Nachricht
- STOP-Regel
---
# Status-System
Erlaubte Ticketstatus:
`PLANNED`
Ticket existiert, ist aber noch nicht freigegeben.
`READY`
Ticket darf umgesetzt werden.
`IN_PROGRESS`
Umsetzung läuft.
`READY_FOR_REVIEW`
Umsetzung abgeschlossen, wartet auf Review.
`CHANGES_REQUESTED`
Review hat Nachbesserungen verlangt.
`APPROVED`
Ticket wurde erfolgreich geprüft.
`BLOCKED`
Ticket kann technisch aktuell nicht abgeschlossen werden.
---
# Test-Regel
Tests dürfen ausschließlich mit folgenden Ergebnissen dokumentiert werden:
`PASS`
tatsächlich ausgeführt und erfolgreich.
`FAIL`
tatsächlich ausgeführt und fehlgeschlagen.
`NOT TESTED`
nicht zuverlässig ausführbar.
Niemals einen Test als PASS bezeichnen, wenn er nicht wirklich ausgeführt wurde.
---
# Architektur-Regel
Keine Komplett-Rewrites ohne eigenes freigegebenes Ticket.
Bestehende funktionierende Systeme zuerst verstehen.
Dann möglichst kleine, kontrollierte Änderungen durchführen.
---
# Daten-Regel
Langfristig soll jede wichtige Information genau eine zentrale Quelle besitzen.
Nicht dieselben Werte unabhängig in mehreren Dateien pflegen.
---
# Gameplay-Regel
Missionen erklären Gameplay.
Missionen ersetzen Gameplay nicht.
Kernmechaniken müssen auch außerhalb einer Mission funktionieren.
---
# Stabilitätsregel
Priorität:
1. Stabilität
2. Gameplay
3. Save-System
4. Architektur
5. Mobile UX
6. Performance
7. Content
8. finale Grafik
---
# Abschlussbericht
Nach jedem Entwicklungsticket muss ein Report entstehen.
Report enthält:
- Ticket-ID
- Status
- Commit SHA
- veränderte Dateien
- neue Dateien
- Tests
- bekannte Probleme
- Risiken
- bewusst nicht umgesetzte Dinge
Danach STOP.
Kein nächstes Ticket selbstständig beginnen.
---
# Grundsatz
**Lieber eine kleine Funktion vollständig stabil als zehn Funktionen halb fertig.**
