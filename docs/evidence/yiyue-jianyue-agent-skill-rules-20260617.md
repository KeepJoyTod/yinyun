# 影约云简约工作台 Agent/Skill 规则落地 2026-06-17

## Result

- Added repo agent rules: `AGENTS.md`.
- Added local Codex skill: `C:\Users\Administrator\.codex\skills\yiyue-jianyue-workbench-runner`.
- Added local maps:
  - `C:\Users\Administrator\Desktop\yiyue\jianyue_benchmark_map.md`
  - `C:\Users\Administrator\Desktop\yiyue\function_map.md`
  - `C:\Users\Administrator\Desktop\yiyue\optimization_map.md`

## Skill

```text
name: yiyue-jianyue-workbench-runner
trigger: studio-workbench appointment orders, 今日预约, 排期, yy_order,
         yy_booking_slot_inventory, 客片交付, DOUYIN_LIFE, 简约网/JianYue 对标
```

The skill requires companion use of:

- `yingyue-douyin-life-runner`
- `website-ui-replica`
- `feature-mapper`
- `ui-ux-pro-max`
- `verification-before-completion`

## Guardrails

- No UI-only completion claims.
- No fabricated schedule slots from historical DOUYIN_LIFE orders.
- `yy_order` remains the only order ledger.
- `yy_booking_slot_inventory` remains the real capacity ledger.
- Store scope should prefer `storeId=<yy_store.id>`.
- Every changed workflow needs route/API/table/state/failure/verification evidence.

## Validation

```text
python C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\Administrator\.codex\skills\yiyue-jianyue-workbench-runner
Skill is valid!
```
