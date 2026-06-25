# Studio Workbench HK2 Douyin Truth Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn HK2 into a repeatable, evidence-backed truth source for `DOUYIN_LIFE`, and update the canonical API/callback/runbook docs with a clear verified-vs-blocked matrix.

**Architecture:** This workstream uses only HK2-facing helpers, read-only discovery, and narrowly scoped write-safe checks. Its outputs are evidence files plus updates to `api_map.md`, `callback_map.md`, and `hk2-runbook-20260619.md`. It does not refactor the application unless a helper script misclassifies a write operation.

**Tech Stack:** PowerShell, HK2 helper scripts, Markdown, Spring Boot HTTP endpoints, ripgrep.

---

### Task 1: Build the HK2 Truth Table

**Files:**
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\douyin-life-hk2-truth-table-20260619.md`
- Modify: `docs\yiyue\api_map.md`
- Modify: `docs\yiyue\hk2-runbook-20260619.md`

- [ ] **Step 1: Run environment and release checks on HK2**

Run:

```powershell
.\tools\invoke-hk2.ps1 -Command "hostname; systemctl is-active yingyue-admin.service; cat /var/www/studio.evanshine.me/release.txt"
```

Expected:
- Host identity prints.
- `yingyue-admin.service` is `active`.
- A release marker prints.

- [ ] **Step 2: Run the read-only discovery flow**

Run:

```powershell
.\tools\yingyue-douyin-real-account-discovery.ps1
```

Expected:
- Discovery completes without writing local tables.
- Latest evidence file path is printed.

- [ ] **Step 3: Probe the live current-order helper**

Run:

```powershell
.\tools\run-douyin-life-current-order.ps1
```

Expected:
- `client_token` succeeds.
- Order query returns either real data or a platform-side business restriction, not local script failure.

- [ ] **Step 4: Write the truth table evidence**

Create `docs/evidence/douyin-life-hk2-truth-table-20260619.md` with this exact table shape:

```md
| Capability | Entry | Operation Class | Result | Evidence / logid | Notes |
| --- | --- | --- | --- | --- | --- |
| client_token | ... | READ_ONLY | VERIFIED | ... | ... |
| order query | ... | READ_ONLY | VERIFIED/BLOCKED | ... | ... |
| poi query | ... | READ_ONLY | VERIFIED | ... | ... |
| time_stock/get | ... | READ_ONLY | VERIFIED/PARTIAL | ... | ... |
| orders/sync | ... | WRITE_LOCAL_DB | ... | ... | ... |
| orders/backfill | ... | WRITE_LOCAL_DB | ... | ... | ... |
```

- [ ] **Step 5: Update `api_map.md` with a verified-vs-blocked matrix**

Add a new section near the top:

```md
## 2026-06-19 香港2真实能力真相表

以香港2 `103.24.216.8` 为唯一标准出口，能力分为：

- VERIFIED
- PARTIAL
- BLOCKED
- CODE_ONLY
```

Populate it using the evidence from steps 1-4.

### Task 2: Classify HK2 Operations by Risk

**Files:**
- Modify: `docs\yiyue\hk2-runbook-20260619.md`
- Modify: `docs\yiyue\callback_map.md`

- [ ] **Step 1: Add operation-class labels to the HK2 runbook**

Insert this exact legend:

```md
## Operation Classes

- `READ_ONLY`
- `WRITE_LOCAL_DB`
- `WRITE_PLATFORM`
- `DEPLOY`
```

- [ ] **Step 2: Label the known HK2 commands**

Use this table shape in the runbook:

```md
| Command / Entry | Operation Class | Safe Default | Notes |
| --- | --- | --- | --- |
| `invoke-hk2.ps1 -Command "cat release.txt"` | READ_ONLY | yes | ... |
| `yingyue-douyin-real-account-discovery.ps1` | READ_ONLY | yes | ... |
| `POST /yy/channel/DOUYIN_LIFE/orders/sync` | WRITE_LOCAL_DB | no | ... |
| `POST /yy/channel/DOUYIN_LIFE/orders/backfill` | WRITE_LOCAL_DB | no | ... |
| `POST /yy/channel/DOUYIN_LIFE/reservation/time-stock/save` | WRITE_PLATFORM | no | ... |
```

- [ ] **Step 3: Mirror the same caution in `callback_map.md`**

Add:

```md
## HK2 Execution Boundary

所有“是否真实可用”的判断优先以香港2为准。任何会修改平台库存、订单状态、退款、核销结果的命令都不能按只读执行。
```

- [ ] **Step 4: Verify the runbook now exposes operation classes**

Run:

```powershell
rg -n "Operation Classes|WRITE_PLATFORM|WRITE_LOCAL_DB|READ_ONLY" `
  "docs\yiyue\hk2-runbook-20260619.md" `
  "docs\yiyue\callback_map.md"
```

Expected:
- The classification language exists in both files.

### Task 3: Record HK2 Health and Webhook Proof

**Files:**
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\douyin-life-hk2-health-20260619.md`
- Modify: `docs\yiyue\api_map.md`

- [ ] **Step 1: Read sync health and inbox status**

Run:

```powershell
.\tools\invoke-hk2.ps1 -Command "curl -sS https://api.evanshine.me/yy/channel/DOUYIN_LIFE/sync-health || true"
.\tools\invoke-hk2.ps1 -Command "curl -sS https://api.evanshine.me/yy/channel/DOUYIN_LIFE/event-inbox/status || true"
```

Expected:
- Responses are captured or auth limitations are explicitly documented.

- [ ] **Step 2: Probe webhook challenge behavior**

Run:

```powershell
.\tools\invoke-hk2.ps1 -Command "curl -sS -X POST https://api.evanshine.me/api/douyin/life/webhook -H 'Content-Type: application/json' -d '{\"challenge\":\"codex-hk2-check-20260619\"}'"
```

Expected:
- Raw JSON challenge echo returns.

- [ ] **Step 3: Write the health evidence**

Create:

```md
# Douyin Life HK2 Health 2026-06-19

- release:
- sync-health:
- inbox-status:
- webhook-challenge:
- notes:
```

- [ ] **Step 4: Commit only HK2 evidence and doc updates**

```bash
git add docs/evidence/douyin-life-hk2-*.md
git commit -m "docs: record hk2 douyin truth table and health"
```
