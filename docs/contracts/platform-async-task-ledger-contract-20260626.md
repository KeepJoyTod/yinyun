# Platform Async Task Ledger Contract - 2026-06-26

## Scope

- Inventory: `P-010` async task center, `R-014` report export task.
- First landing package: finance reconciliation export tasks only.
- This package persists task metadata and exposes it to task center. It does not implement real file storage, retry worker, cross-instance leasing, or cleanup.

## Data Contract

### Table

- `yy_async_task`
- Unique key: `(tenant_id, task_no)`
- Query indexes:
  - `(tenant_id, task_type, status, create_time)`
  - `(tenant_id, store_id, create_time)`

### Required Fields

| Field | Meaning |
| --- | --- |
| `task_no` | External task id, e.g. `FIN-REC-XXXXXXXX` |
| `task_type` | Business task type, e.g. `REPORT_FINANCE_RECONCILIATION_EXPORT` |
| `task_name` | Display name |
| `queue_name` | Queue owner, e.g. `platform-export` |
| `status` | Business status |
| `run_status` | Latest run status |
| `date_from` / `date_to` | Report range |
| `download_url` | Reserved download entry |
| `expire_time` | Reserved expiry time |
| `audit_note` | Readable boundary note |

## API Contract

### `POST /yy/reportFinanceReconciliation/export`

- Permission: `yy:report:export`
- Writes: `yy_async_task`
- Returns: `YyReportFinanceExportTaskVo`
- Boundary: generated task is completed synchronously for now; file content and object storage are reserved.

### `GET /yy/reportFinanceReconciliation/export/tasks`

- Permission: `yy:report:list`
- Reads: `yy_async_task`
- Fallback: in-memory task map only when no persisted rows exist.

### `GET /yy/platform-settings/async-tasks`

- Permission: `yy:platform:query`
- Reads: `yy_async_task`
- Behavior: groups rows by `taskType`, chooses latest row by `createTime`, and returns task-center DTO evidence sourced from `yy_async_task`.

## Acceptance

- Creating a finance reconciliation export task inserts one `yy_async_task` row.
- Finance reconciliation export task list can read persisted rows.
- Platform task center can show persisted task status and evidence.
- SQL scripts define the table for MySQL and PostgreSQL.
