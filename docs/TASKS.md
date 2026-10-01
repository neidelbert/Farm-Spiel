# Farm-Spiel – Task Control

## Aktiver Entwicklungsbranch
`develop`

## Aktuelle Version
`0.3.0-dev`

---

# Aktuelles Ticket
`FS-008` – Crop System

Status:
`READY_FOR_REVIEW`

Hinweis:
Die Erstimplementierung wurde technisch erfolgreich installiert.
Im Review wurde die zentrale Crop-Definition entsprechend dem bestehenden State-Audit ergänzt.
FS-008 wartet nach dem Korrektur-Commit erneut auf ChatGPT-Review.

FS-009 ist vorbereitet, aber noch nicht freigegeben.

---

# Abgeschlossene Tickets

## `FS-001` – Stable Baseline
Status:
`APPROVED`

## `FS-002` – AI Development System
Status:
`APPROVED`

## `FS-003` – State Audit
Status:
`APPROVED`

## `FS-004` – Event ID Audit
Status:
`APPROVED`

## `FS-005` – Economy Core
Status:
`APPROVED`

## `FS-006` – Inventory Core
Status:
`APPROVED`

## `FS-007` – Field System Core
Status:
`APPROVED`

Implementierungs-Commit:
`90c88257f77ba6b97c98ef58cac2bcfa6da21880`

---

# Geplante Reihenfolge
- `FS-009` – Planting Flow
- `FS-010` – Growth + Offline
- `FS-011` – Harvest Core
- `FS-012` – Selling Core

---

# Regel
Es darf immer nur ein Ticket den Status:
`READY`
oder
`IN_PROGRESS`
haben.

Ein Ticket mit:
`READY_FOR_REVIEW`
darf nicht selbstständig als `APPROVED` betrachtet werden.

Kein KI-Werkzeug und kein Automationsweg darf ein `PLANNED`-Ticket selbstständig starten.

Nach Umsetzung:
`READY_FOR_REVIEW`

Nach ChatGPT-Review:
`APPROVED`
oder:
`CHANGES_REQUESTED`
