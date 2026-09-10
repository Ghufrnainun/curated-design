# Triage labels

Default label vocabulary defined by the `triage` skill. Labels are created in
GitHub Issues if they do not exist yet.

| Label | Purpose |
|---|---|
| `needs-triage` | New issue not yet assessed |
| `needs-info` | Waiting on more information from reporter |
| `ready-for-agent` | Fully described, actionable by an agent |
| `ready-for-human` | Needs a human decision or manual step |
| `wontfix` | Deliberately not acting on this |

Apply labels with `gh issue edit <number> --add-label <label>`.
