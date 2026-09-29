# FS-004 – Event ID Audit
## Status
`APPROVED`
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
## Implementierungs-Commit
`53511b7efab5cdf67b78696cd1591a94a55e4798`
## Review
`APPROVED` by ChatGPT
## STOP
FS-005 darf nicht automatisch begonnen werden.
