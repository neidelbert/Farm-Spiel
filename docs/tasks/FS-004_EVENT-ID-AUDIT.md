# FS-004 – Event ID Audit
## Status
`READY_FOR_REVIEW`
## Ausgangs-SHA
`9d339896f4bc1f0d7faa140b55b79f21ced53c80`
## Version
`0.3.0-dev`
## Ziel
EventBus-Events, Vehicle-eventIds und Route-Tags des aktuellen Farm-Spiel-Cores inventarisieren und ihre unterschiedlichen Rollen dokumentieren.
## Scope
- Producer und Consumer der technischen Events abgrenzen.
- Vehicle-`eventId` und Route Tags von EventBus Events und Mission IDs unterscheiden.
- `sow_wheat` / `first_sow` als bestätigten Drift dokumentieren.
- Redundante `vehicle:complete`-Verantwortung dokumentieren.
- Naming-Ziele für spätere Tickets beschreiben.
## Sourcecode
Nicht verändert. Keine Event-ID repariert oder umbenannt.
## Haupt-Deliverable
`docs/EVENT_ID_AUDIT_0.3.md`
## Review
Audit wartet auf externes ChatGPT-Review.
`docs/reports/FS-004_REPORT.md` wird erst nach dem Review mit dem tatsächlichen Implementierungs-SHA erstellt.
## STOP
FS-005 darf nicht automatisch begonnen werden.
