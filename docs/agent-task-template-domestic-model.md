# Domestic Model Task Template

Use this template when assigning scoped implementation work to another coding model.

## Task

```text
[One narrow outcome. Example: Align the schedule slot board click policy with the JianYue interaction flow.]
```

## Required Context

Read these before editing:

- `docs/jianyue-booking-document-index-20260617.md`
- `docs/jianyue-booking-data-ledger-map-20260617.md`
- `docs/jianyue-booking-status-machine-map-20260617.md`
- `docs/jianyue-booking-interaction-flow-map-20260617.md`
- `docs/jianyue-booking-acceptance-test-map-20260617.md`

Add task-specific docs:

- `[exact doc path]`

## Allowed Files

```text
[exact paths only]
```

## Forbidden Changes

- Do not create another order, appointment, payment, or schedule ledger.
- Do not fabricate slot fields for historical `DOUYIN_LIFE` orders.
- Do not commit secrets, tokens, account passwords, `.env.local`, `APPSecret.txt`, or server password files.
- Do not change production deployment scripts unless this task explicitly says so.
- Do not modify unrelated routes, feature registry, or global styling.

## Required Behavior

```text
[Observable behavior the implementation must produce.]
```

## Required Verification

Run:

```powershell
[exact command]
```

Expected:

```text
[exact expected result]
```

## Required Response

Return:

- files changed;
- implementation summary;
- verification commands and results;
- screenshots/evidence paths when UI changed;
- residual risks or unknowns.

## Review Gate

Codex or the project owner must review:

- Git diff scope;
- tests/build output;
- data-ledger boundary compliance;
- UI screenshots when applicable;
- absence of secrets.
