# Studio Workbench Multi-Agent Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the confirmed 5-lane delivery program for `studio-workbench` using one controller and multiple isolated workstreams without losing the Hong Kong 2 truth boundary or the canonical local maps.

**Architecture:** The controller owns sequencing, spec compliance, map updates, and merge gates. Five isolated workstreams handle document governance, HK2/Douyin verification, schedule/fulfillment, peripheral module closure, and JianYue-style finish. All production-facing truth comes from HK2 `103.24.216.8`, and all user-facing workflow truth comes from `yy_order` and `yy_booking_slot_inventory`.

**Tech Stack:** Markdown docs, PowerShell, Git, Vue 3, TypeScript, Pinia, Vitest, Spring Boot/RuoYi-Vue-Plus, PostgreSQL, Redis, HK2 deployment.

---

### Task 1: Freeze Canonical Inputs

**Files:**
- Modify: `docs\yiyue\studio-workbench-master-plan-20260619.md`
- Modify: `docs\yiyue\hk2-runbook-20260619.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-governance-reset.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-hk2-douyin-truth-table.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-schedule-fulfillment.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-peripheral-closure.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-jianyue-ui-finish.md`

- [ ] **Step 1: Check repo and local-doc baseline**

Run:

```powershell
git -C "D:\OtherProject\CameraApp\yingyue-cloud-repo" status --short --branch
git -C "D:\OtherProject\CameraApp\yingyue-cloud-repo" log --oneline -3
Get-Item "docs\yiyue\studio-workbench-master-plan-20260619.md", "docs\yiyue\hk2-runbook-20260619.md" |
  Select-Object FullName,Length,LastWriteTime
```

Expected:
- Branch is `yingyue-closed-loop-optimization-20260603`.
- Spec commit `3223386` is visible or a newer local HEAD.
- Both local canonical docs exist.

- [ ] **Step 2: Record the canonical plan pack in the master spec**

Append this block to `docs\yiyue\studio-workbench-master-plan-20260619.md` under a new `## Canonical Plan Pack` section:

```md
## Canonical Plan Pack

- `docs/superpowers/plans/2026-06-19-studio-workbench-multiagent-orchestration.md`
- `docs/superpowers/plans/2026-06-19-studio-workbench-governance-reset.md`
- `docs/superpowers/plans/2026-06-19-studio-workbench-hk2-douyin-truth-table.md`
- `docs/superpowers/plans/2026-06-19-studio-workbench-schedule-fulfillment.md`
- `docs/superpowers/plans/2026-06-19-studio-workbench-peripheral-closure.md`
- `docs/superpowers/plans/2026-06-19-studio-workbench-jianyue-ui-finish.md`
```

- [ ] **Step 3: Verify the spec now points to this plan pack**

Run:

```powershell
rg -n "Canonical Plan Pack|multiagent-orchestration|schedule-fulfillment" "docs\yiyue\studio-workbench-master-plan-20260619.md"
```

Expected:
- The new section exists and references all 6 plan files.

- [ ] **Step 4: Commit only the plan pack metadata updates**

```bash
git add docs/superpowers/plans/2026-06-19-studio-workbench-*.md
git commit -m "docs: add studio workbench multiagent execution plans"
```

### Task 2: Dispatch Workstream Plans

**Files:**
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-governance-reset.md`
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-hk2-douyin-truth-table.md`
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-schedule-fulfillment.md`
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-peripheral-closure.md`
- Read: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\superpowers\plans\2026-06-19-studio-workbench-jianyue-ui-finish.md`

- [ ] **Step 1: Start Agent A first**

Dispatch the full text of:

```text
docs/superpowers/plans/2026-06-19-studio-workbench-governance-reset.md
```

Expected:
- Agent A archives legacy plans and normalizes canonical map headers before feature work merges.

- [ ] **Step 2: Start Agents B, C, D after Agent A has created canonical doc guardrails**

Dispatch these three plans in parallel:

```text
docs/superpowers/plans/2026-06-19-studio-workbench-hk2-douyin-truth-table.md
docs/superpowers/plans/2026-06-19-studio-workbench-schedule-fulfillment.md
docs/superpowers/plans/2026-06-19-studio-workbench-peripheral-closure.md
```

Expected:
- B stays on HK2 / Douyin verification and evidence.
- C stays on schedule / order / inventory contract.
- D stays on photo / micro page / merchant surface closure.

- [ ] **Step 3: Delay Agent E until both C and D pass spec review**

Gate rule:

```text
Agent E can start only after:
1. dashboard/today, order/appointment, and staff-booking core flows are green
2. photo/micro-page/micro-form core actions are green
3. canonical maps have been updated by Agent A
```

- [ ] **Step 4: Verify no agent edited the same hotspot without review**

Run:

```powershell
git -C "D:\OtherProject\CameraApp\yingyue-cloud-repo" diff --name-only HEAD~5..HEAD |
  Sort-Object |
  Group-Object |
  Where-Object { $_.Count -gt 1 }
```

Expected:
- Shared hotspots are explicitly reviewed before merge; no silent overlap.

### Task 3: Merge Gates and Release Gates

**Files:**
- Modify: `docs\yiyue\optimization_map.md`
- Modify: `docs\yiyue\function_map.md`
- Modify: `docs\yiyue\code_map.md`
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-multiagent-release-20260619.md`

- [ ] **Step 1: Enforce the three completion gates**

Only mark a phase `DONE` after this checklist is true:

```md
- code path complete
- targeted verification complete
- canonical maps updated
```

- [ ] **Step 2: Run the final integration verification**

Run:

```powershell
npm --prefix "D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench" run build
git -C "D:\OtherProject\CameraApp\yingyue-cloud-repo" status --short --branch
```

Expected:
- Build passes.
- Git status is clean except intentionally retained evidence or user-owned files.

- [ ] **Step 3: Record the release gate evidence**

Write `docs/evidence/studio-workbench-multiagent-release-20260619.md` with this structure:

```md
# Studio Workbench Multi-Agent Release Gate

- branch:
- head:
- deployed marker:
- workstreams merged:
- verification:
  - build:
  - targeted tests:
  - hk2 smoke:
- rollback point:
```

- [ ] **Step 4: Commit release-gate docs**

```bash
git add docs/evidence/studio-workbench-multiagent-release-20260619.md
git commit -m "docs: record multiagent release gate"
```
