# Studio Workbench Governance Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the local `yiyue` workspace to one canonical map set, archive legacy planning noise, and make future handoff deterministic.

**Architecture:** This workstream is documentation-only. It must not touch business code. It archives legacy planning documents, normalizes the 8 canonical documents, and creates one archive index so later agents stop writing to duplicated files.

**Tech Stack:** Markdown, PowerShell, Git, ripgrep.

---

### Task 1: Archive Legacy Plan Files

**Files:**
- Create: `docs\yiyue\archive\legacy-plans\20260619\INDEX.md`
- Move: all legacy planning docs under `docs\yiyue\` except the canonical 8 docs and live maps

- [ ] **Step 1: List candidate legacy plan files**

Run:

```powershell
Get-ChildItem "docs\yiyue" -File |
  Where-Object {
    $_.Name -match "朋友项目|handover|takeover|optimization-plan|master-plan|总规划|总计划|总控|执行地图|接手"
  } |
  Select-Object Name,LastWriteTime |
  Sort-Object Name
```

Expected:
- A stable list of old planning files appears.

- [ ] **Step 2: Create the archive folder**

Run:

```powershell
New-Item -ItemType Directory -Force "docs\yiyue\archive\legacy-plans\20260619" | Out-Null
```

Expected:
- The directory exists.

- [ ] **Step 3: Move only legacy planning docs, not canonical maps**

Use this PowerShell allowlist/denylist pattern:

```powershell
$keep = @(
  "code_map.md",
  "function_map.md",
  "optimization_map.md",
  "api_map.md",
  "callback_map.md",
  "jianyue_benchmark_map.md",
  "studio-workbench-master-plan-20260619.md",
  "hk2-runbook-20260619.md"
)

Get-ChildItem "docs\yiyue" -File |
  Where-Object {
    $_.Name -notin $keep -and
    $_.Name -match "朋友项目|handover|takeover|optimization-plan|master-plan|总规划|总计划|总控|执行地图|接手"
  } |
  Move-Item -Destination "docs\yiyue\archive\legacy-plans\20260619"
```

- [ ] **Step 4: Write the archive index**

Create `INDEX.md` with:

```md
# Legacy Plan Archive 2026-06-19

This folder contains superseded planning and takeover documents archived on 2026-06-19.

Canonical live docs moved forward:
- `..\..\code_map.md`
- `..\..\function_map.md`
- `..\..\optimization_map.md`
- `..\..\api_map.md`
- `..\..\callback_map.md`
- `..\..\jianyue_benchmark_map.md`
- `..\..\studio-workbench-master-plan-20260619.md`
- `..\..\hk2-runbook-20260619.md`
```

- [ ] **Step 5: Verify only canonical planning docs remain at root**

Run:

```powershell
Get-ChildItem "docs\yiyue" -File | Select-Object Name | Sort-Object Name
```

Expected:
- Legacy planning clutter is gone from the root.

### Task 2: Normalize Canonical Map Headers

**Files:**
- Modify: `docs\yiyue\code_map.md`
- Modify: `docs\yiyue\function_map.md`
- Modify: `docs\yiyue\optimization_map.md`
- Modify: `docs\yiyue\api_map.md`
- Modify: `docs\yiyue\callback_map.md`
- Modify: `docs\yiyue\jianyue_benchmark_map.md`

- [ ] **Step 1: Update stale header timestamps**

Each file should have a top header matching its latest real content date. Example header form:

```md
# 影约云代码地图 code_map

更新时间：2026-06-19
```

- [ ] **Step 2: Add canonical-status metadata block**

Insert this exact block after each title/header section:

```md
## Canonical Status

- canonical: yes
- owner: studio-workbench-main-controller
- update-rule: update this file in every related batch before claiming DONE
```

- [ ] **Step 3: Add cross-links to the master plan pack**

Add this block near the top of each canonical file:

```md
## Related Canonical Docs

- `studio-workbench-master-plan-20260619.md`
- `hk2-runbook-20260619.md`
```

- [ ] **Step 4: Verify all canonical files now expose the same metadata**

Run:

```powershell
rg -n "Canonical Status|owner: studio-workbench-main-controller|Related Canonical Docs" `
  "docs\yiyue\code_map.md" `
  "docs\yiyue\function_map.md" `
  "docs\yiyue\optimization_map.md" `
  "docs\yiyue\api_map.md" `
  "docs\yiyue\callback_map.md" `
  "docs\yiyue\jianyue_benchmark_map.md"
```

Expected:
- All 6 files contain the same canonical metadata.

### Task 3: Write a Canonical Root Entry

**Files:**
- Modify: `docs\yiyue\00-权威入口-朋友项目接手与优化规划.md`

- [ ] **Step 1: Replace the old root-entry body with a short canonical doc index**

Use this body shape:

```md
# 权威入口

请优先阅读：

1. `studio-workbench-master-plan-20260619.md`
2. `hk2-runbook-20260619.md`
3. `code_map.md`
4. `function_map.md`
5. `optimization_map.md`
6. `api_map.md`
7. `callback_map.md`
8. `jianyue_benchmark_map.md`

历史规划文档已归档到：

`archive/legacy-plans/20260619/INDEX.md`
```

- [ ] **Step 2: Verify the root entry is now short and authoritative**

Run:

```powershell
Get-Content -First 40 "docs\yiyue\00-权威入口-朋友项目接手与优化规划.md"
```

Expected:
- The file is now a short index, not a second planning document.

- [ ] **Step 3: Commit the governance reset only**

```bash
git add "docs/yiyue"
git commit -m "docs: archive legacy yiyue plans and normalize canonical maps"
```
