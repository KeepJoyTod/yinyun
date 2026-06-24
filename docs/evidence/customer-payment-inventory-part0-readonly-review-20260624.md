# Customer Payment Inventory Part 0 Read-Only Review 2026-06-24

## Purpose

This is the required Part 0 read-only challenge record before payment/inventory implementation starts.

## Verified Facts

1. Customer pay endpoint exists and currently returns a placeholder response only.
2. Customer create-order flow already writes local unpaid orders and does not confirm inventory while unpaid.
3. Inventory confirmation service already has its own idempotent branch for `inventory_status=CONFIRMED`.
4. PostgreSQL schema already contains the three required ledgers: `yy_order`, `yy_payment_record`, `yy_booking_slot_inventory`.
5. `yy_payment_record` does not yet have verified Java domain/mapper/service implementation in the current backend module.
6. WeChat payment capability is still reserved, so real notify integration must remain gated.
7. `DOUYIN_LIFE` and future self-built mini-app payment are separate concerns and must not be mixed.

## Read-Only Challenge Questions

### Q1. Can this phase reuse existing ledgers instead of introducing new ones?

Answer:

- Yes.
- `yy_order` already stores payment summary fields.
- `yy_payment_record` already stores payment transaction facts.
- `yy_booking_slot_inventory` already stores real slot capacity facts.

Decision:

- Do not add a second order ledger or a second inventory ledger.

### Q2. Is the current customer pay entry already safe against fake paid state?

Answer:

- Yes for the placeholder path.
- Current `payCustomerOrder` only validates ownership and returns `paymentReady=false`.
- It does not update order pay fields and does not write payment records.

Decision:

- Preserve this fallback until real prepay configuration is verified.

### Q3. Is there already one unified paid-entry service?

Answer:

- No.
- Current codebase has inventory confirmation logic and order creation logic, but no verified `YyPaymentService.markPaid(...)` owner yet.

Decision:

- Part 1 must introduce one unified paid-entry service.
- Part 2 and Part 3 must not each implement their own paid update path.

### Q4. Is inventory confirmation already idempotent enough for reuse?

Answer:

- Partially yes.
- `confirmPaidOrderSlot(...)` skips duplicate deduction when order inventory status is already confirmed.
- It also uses atomic capacity update for slot confirmation.
- But payment-layer idempotency still needs `yy_payment_record` ownership and duplicate-callback protection.

Decision:

- Reuse `confirmPaidOrderSlot(...)`.
- Add payment-layer idempotency before any notify or store-confirm merge.

### Q5. Can `DOUYIN_LIFE` orders enter this customer payment path?

Answer:

- No.
- Existing project docs already distinguish `DOUYIN_LIFE` from `DOUYIN_MINI_APP` and local/WeChat self-built payment.

Decision:

- Reject `DOUYIN_LIFE` orders from customer pay entry and store-confirm payment entry in this phase unless a later contract explicitly broadens scope.

### Q6. Can Part 0 verify the required external `C:\Users\Administrator\Desktop\yiyue\*.md` maps on this machine?

Answer:

- No.
- The required `code_map.md`, `api_map.md`, `liucheng_map.md`, `callback_map.md`, and `open_platform_setting_map.md` paths are not present on this machine during this task.

Decision:

- This information cannot be verified locally right now.
- If later steps require those maps, first recreate or restore the files at the configured path, then append this phase summary into them.

## Locked Decisions

- The only order ledger is `yy_order`.
- The only payment/receipt ledger in this phase is `yy_payment_record`.
- The only slot capacity ledger is `yy_booking_slot_inventory`.
- `markPaid(...)` is the future single write owner for paid success.
- Real WeChat callback implementation stays paused until merchant config, certificate path, callback domain, and official signature rules are verified.
- `STORE_CONFIRM` is a local audit provider, not a fake third-party channel.
- Part 0 is documentation and contract work only; no production platform write, no HK2 deploy, no production DB write.

## Merge Gates

| Gate | Requirement |
| --- | --- |
| Gate A | User paths, flows, contract, tables, permissions, idempotency are documented |
| Gate B | `markPaid(...)` and payment idempotency tests pass before notify/store-confirm merge |
| Gate C | Frontend integrations use the shared backend contract and do not forge paid state |
| Gate D | Any real WeChat adapter work re-verifies official docs and merchant config first |

## Stop Conditions

- merchant config or WeChat signature rules remain unverified
- callback replay can still double-confirm inventory
- cancelled/refunded/non-local orders can still enter paid-entry path
- implementation needs real Douyin platform writes, HK2 deploy, production DB writes, or member/coupon/points/refund ledgers

## Suggested Next Implementation Order

1. Part 1 backend payment core service
2. Part 2 customer payment API upgrade
3. Part 3 notify and store-confirm paid entry
4. Part 4 mobile client integration
5. Part 5 workbench confirm-receipt UI
6. Part 6 maps, docs, and acceptance evidence
