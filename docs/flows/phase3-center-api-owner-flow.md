# Phase 3 Center API Owner Flow

> owner: full-product-phase3-center-api-owner
> date: 2026-06-24

```mermaid
flowchart TD
  UI["Workbench center pages\nTools / Account / Finance"] --> FE["backendApi facade\nexisting method names"]
  FE --> Slices["Domain API slices\nbackendToolsApi / backendAccountApi / backendFinanceApi"]
  Slices --> BE["Backend controllers\n/yy/tool-center\n/yy/account-center\n/yy/finance-center"]
  BE --> Services["Services\nToolCenter / AccountCenter / FinanceCenter"]
  Services --> Ledgers["Existing ledgers\nyy_photo_album\nyy_customer\nyy_notification_log\nyy_store\nyy_payment_record"]
  Ledgers --> Services
  Services --> BE
  BE --> Slices
  Slices --> UI
  Slices --> Demo["Demo fallback\nonly when VITE_STUDIO_DEMO=true"]
```

## Failure Path

- API mode surfaces backend errors instead of silently returning fake data.
- Demo mode may return scaffold fallback data for local preview.
- Write-like actions in this package are response-level contract placeholders and do not persist funds, profile, brand, or album publishing state.

## Acceptance

- Routes continue to enter through existing navigation.
- Frontend uses `apiRequest` for account, finance, and tool center owner slices.
- Backend exposes controller/service boundaries without touching external channel write paths.
- Contract tests verify facade compatibility and endpoint strings without duplicating page-level tests.
