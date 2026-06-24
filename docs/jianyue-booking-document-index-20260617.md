# JianYue Booking Document Index 2026-06-17

## Conclusion

This index is the entry point for the JianYue-aligned booking workbench work. Read the P0 documents before changing code.

## P0: Must Read Before Code

| Document | Purpose |
| --- | --- |
| `docs/jianyue-booking-product-map-20260617.md` | Product goal, personas, core UX policy |
| `docs/jianyue-booking-feature-map-20260617.md` | Natural-language feature to code map |
| `docs/jianyue-booking-code-map-20260617.md` | Main files and module ownership |
| `docs/jianyue-booking-api-contract-20260617.md` | API request/response and ledger effects |
| `docs/jianyue-booking-api-map-20260617.md` | Endpoint map |
| `docs/jianyue-booking-data-ledger-map-20260617.md` | Tables, fields, write/read paths |
| `docs/jianyue-booking-status-machine-map-20260617.md` | Status groups and transitions |
| `docs/jianyue-booking-interaction-flow-map-20260617.md` | Page-to-page flows and click policy |
| `docs/jianyue-booking-acceptance-test-map-20260617.md` | Verification and evidence rules |

## P1: Required Before Deploy/Team Handoff

| Document | Purpose |
| --- | --- |
| `docs/jianyue-booking-permission-map-20260617.md` | Store scope, roles, API permission expectations |
| `docs/jianyue-booking-deploy-rollback-map-20260617.md` | GitHub, Hong Kong 2 deploy, backup, rollback |
| `docs/jianyue-booking-exception-map-20260617.md` | Mapping, conflict, missing slot, sync failure handling |
| `docs/jianyue-booking-chain-refresh-runbook-20260617.md` | JianYue-backed schedule/order refresh runbook |
| `docs/jianyue-booking-optimization-map-20260617.md` | Optimization priority and known gaps |

## P2: Future Expansion

| Document | Purpose |
| --- | --- |
| `docs/jianyue-booking-reporting-map-20260617.md` | Report metrics and drill-down rules |
| `docs/jianyue-booking-crm-member-map-20260617.md` | Customer/member integration boundary |
| `docs/jianyue-booking-photo-selection-map-20260617.md` | Booking-to-photo handoff |
| `docs/jianyue-booking-meituan-map-20260617.md` | Meituan channel plan |
| `docs/jianyue-booking-domestic-model-task-pack-20260617.md` | Task package for domestic model workers |
| `docs/jianyue-booking-requirement-intake-map-20260617.md` | Requirement intake workflow for this project |

## Implementation Plan

| Document | Purpose |
| --- | --- |
| `docs/superpowers/specs/2026-06-17-jianyue-booking-workbench-design.md` | Approved design |
| `docs/superpowers/plans/2026-06-17-jianyue-booking-workbench.md` | Step-by-step implementation plan |

## External/Local Context

| Local file | Purpose |
| --- | --- |
| `C:\Users\Administrator\Desktop\yiyue\code_map.md` | Global project and Douyin code map |
| `C:\Users\Administrator\Desktop\yiyue\api_map.md` | Douyin/OpenAPI map |
| `C:\Users\Administrator\Desktop\yiyue\callback_map.md` | SPI/Webhook map |
| `C:\Users\Administrator\Desktop\yiyue\liucheng_map.md` | Douyin integration flow |
| `C:\Users\Administrator\Desktop\yiyue\open_platform_setting_map.md` | Open platform setup notes |

## Reading Order For A New Worker

1. Product map.
2. Data ledger map.
3. Status machine map.
4. Interaction flow map.
5. API contract/map.
6. Code map.
7. Implementation plan.
8. Acceptance test map.
9. Domestic model task pack if the worker is an implementation-only agent.
