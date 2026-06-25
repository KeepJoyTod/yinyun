# Douyin Order Payment Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 固化抖音来客真实订单、支付状态和后续小程序内支付所需的数据库结构与项目地图。

**Architecture:** `yy_order` 继续作为唯一订单/预约账本，`yy_channel_order_mapping` 继续作为外部订单幂等映射。`DOUYIN_LIFE` 支付事实来自抖音来客订单和回调；`DOUYIN_MINI_APP` / 微信支付后续通过 `yy_payment_record` 保存自建支付流水。

**Tech Stack:** PostgreSQL SQL migration, RuoYi-Vue-Plus backend schema scripts, Markdown project maps.

---

### Task 1: Add Payment-Aware Order Schema

**Files:**
- Create: `backend/script/sql/postgres/postgres_yy_order_payment_migration_20260611.sql`
- Modify: `backend/script/sql/postgres/postgres_yy_cloud.sql`

- [ ] **Step 1: Add idempotent migration SQL**

Create a PostgreSQL migration that:

```sql
alter table yy_order add column if not exists channel_type varchar(32) default '';
alter table yy_order add column if not exists total_amount_cent bigint default 0;
alter table yy_order add column if not exists paid_amount_cent bigint default 0;
alter table yy_order add column if not exists pay_status varchar(32) default 'UNPAID';
alter table yy_order add column if not exists paid_time timestamp;
alter table yy_order add column if not exists refund_status varchar(32) default '';
alter table yy_order add column if not exists external_product_id varchar(128) default '';
alter table yy_order add column if not exists external_sku_id varchar(128) default '';
alter table yy_order add column if not exists external_poi_id varchar(128) default '';
```

- [ ] **Step 2: Add future payment ledger table**

Add `yy_payment_record` with unique idempotency on `(tenant_id, channel_type, out_trade_no)` so `DOUYIN_MINI_APP` and 微信支付回调 can be safely retried.

- [ ] **Step 3: Update fresh-install SQL**

Mirror the same columns and table into `postgres_yy_cloud.sql` so new deployments and migrated deployments match.

- [ ] **Step 4: Validate SQL references**

Run:

```powershell
rg -n "yy_payment_record|pay_status|total_amount_cent|DOUYIN_MINI_APP" backend/script/sql/postgres
```

Expected: migration and base SQL both contain the new payment structure.

### Task 2: Update Project Maps

**Files:**
- Modify: `docs/comprehensive-architecture-absorption-20260611.md`
- Modify: `docs/douyin-life-current-status.md`
- Modify: `docs\yiyue\code_map.md`
- Modify: `docs\yiyue\api_map.md`
- Modify: `docs\yiyue\liucheng_map.md`
- Modify: `docs\yiyue\callback_map.md`

- [ ] **Step 1: Document DOUYIN_LIFE payment boundary**

State that real payment is completed on Douyin Life side and影约云 only receives callbacks / queries orders / writes unified local ledger.

- [ ] **Step 2: Document DOUYIN_MINI_APP payment boundary**

State that `tt.pay` requires platform payment capability and will use `yy_payment_record`, not `DOUYIN_LIFE` SPI paths.

- [ ] **Step 3: Document database table ownership**

Add the ownership rule:

```text
yy_order = 主账本
yy_channel_order_mapping = 外部订单幂等映射
yy_channel_product_mapping = 商品/POI/SKU/下单入口映射
yy_channel_sync_log = 回调和 OpenAPI logid
yy_payment_record = 小程序/微信自建支付流水
```

### Task 3: Verification

**Files:**
- Read-only validation across SQL and maps.

- [ ] **Step 1: Search for schema tokens**

Run:

```powershell
rg -n "yy_payment_record|pay_status|total_amount_cent|paid_amount_cent" D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Expected: base SQL, migration SQL, and docs contain the new terms.

- [ ] **Step 2: Search for channel boundary language**

Run:

```powershell
rg -n "DOUYIN_LIFE.*抖音.*支付|DOUYIN_MINI_APP.*tt\.pay|yy_payment_record" docs\yiyue D:\OtherProject\CameraApp\yingyue-cloud-repo\docs
```

Expected: maps consistently distinguish Douyin Life real payment from miniapp self-payment.

- [ ] **Step 3: Check git status**

Run:

```powershell
git status --short
```

Expected: only SQL/docs/map files changed for this task.
