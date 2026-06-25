# Phase 3 Center API Owner Contract

> owner: full-product-phase3-center-api-owner
> canonical_for: tools/account/finance center API ownership
> date: 2026-06-24

## Scope

- Frontend owner: `backendToolsApi.ts`, `backendAccountApi.ts`, `backendFinanceApi.ts`.
- Backend owner: `YyToolCenterController`, `YyAccountCenterController`, `YyFinanceCenterController`.
- Data boundary: read from existing ledgers only. No new payment, refund, album publish, brand switch, or profile persistence side effects in this package.

## API Contract

| Domain | API | Source ledger | Status rule |
| --- | --- | --- | --- |
| Tools sample works | `GET /yy/tool-center/sample-works` | `yy_photo_album` | `ready` when album status is public/active, otherwise `scaffold` |
| Tools sample publish | `POST /yy/tool-center/sample-works/{sampleId}/publish` | backend owner action placeholder | Returns current list with selected item in `REVIEWING`; no table write |
| Precision delivery summary | `GET /yy/tool-center/precision-delivery/summary` | `yy_customer`, `yy_notification_log` | `ready` when any audience/log exists |
| Precision delivery tasks | `GET /yy/tool-center/precision-delivery/tasks` | `yy_notification_log` grouped by channel | `ready` when logs exist |
| Account profile | `GET/PUT /yy/account-center/profile` | login context | `ready` when a login user exists |
| Account brands | `GET /yy/account-center/brands`, `PUT /yy/account-center/brands/{brandId}/switch` | `yy_store` visible list | Switch is response-level only in this package |
| Help articles | `GET /yy/account-center/help/articles` | backend-owned help catalog | Keyword filter is server side |
| Finance overview | `GET /yy/finance-center/overview` | `yy_payment_record` | `ready` when payment rows exist |
| Finance transactions | `GET /yy/finance-center/transactions` | `yy_payment_record` | Read-only ledger rows, refund amount offsets paid amount |

## Compatibility

- `backendApi` keeps the existing method names: `listToolSampleWorks`, `publishToolSampleWork`, `getAccountProfile`, `listAccountBrands`, `getFinanceOverview`, `listFinanceTransactions`.
- Demo mode keeps local fallback data only when `VITE_STUDIO_DEMO=true`.
- This package does not mark Phase 2 member/marketing ledgers or Phase 4 approval/open API governance as complete.

## Validation

- `npm --prefix studio-workbench run check:file-size`
- `npm --prefix studio-workbench run test -- src/shared/api/backend.contract.test.ts src/features/system/Phase234Scaffolds.contract.test.ts`
- `npm --prefix studio-workbench run build`
- Maven target tests for `YyPhase34CenterControllerTest` and `YyPhase34CenterServiceImplTest`.
