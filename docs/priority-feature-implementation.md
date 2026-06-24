# 优先功能落地记录

日期：2026-05-31

## 结论

本轮按用户指定的 7 个重点功能优先补齐，不再按普通 P0/P1/P2 排序。目标是让当前系统在页面形态和业务字段上对齐旧站观察结果。

## 功能对照

| 编号 | 功能 | 当前状态 | 本轮落地点 |
| --- | --- | --- | --- |
| C-020 | 底片/选片、底片列表 | 已补齐 | `客片选片` 页面新增底片列表，展示文件名、排序、是否已选；保留公开分享选片页。 |
| B-002 | 预约概况 | 已补齐 | 首页新增服务订单状态、预约时段工位、预约趋势三块概况。 |
| B-008 | 门店管理 | 已补齐 | 门店卡片新增本月订单、待服务单，并保留营业状态、地址、电话、员工、档期。 |
| B-022 | 在线选片配置 | 已补齐 | 商品支持选片单价、入册产品名称；商品页可维护并展示。 |
| B-026 | 抖音产品 | 插件预留 | 商品页新增渠道插件状态，抖音显示“抖音服务市场平台应用未开通”；种子数据包含抖音产品预留；企业版按已购查询、购买明细和 `service_market_order` webhook 对接。 |
| B-027 | 美团产品 | 插件预留 | 商品页新增渠道插件状态，美团显示“美团核销工具未开通”；种子数据包含美团产品预留。 |
| B-029 | 预约订单列表 | 已补齐 | 订单列表新增门店、关键字、来源、方式、下单时间、到店时间、状态筛选；导出也包含来源/方式/下单/到店字段。 |

## 关键代码位置

| 功能 | 文件 |
| --- | --- |
| 预约概况聚合 | `src/domain/dashboard.ts`、`src/server/backoffice.ts`、`src/app/dashboard/page.tsx` |
| 门店卡片指标 | `src/domain/store.ts`、`src/server/stores.ts`、`src/components/store-manager.tsx` |
| 产品选片配置/渠道插件 | `src/domain/product.ts`、`src/server/backoffice.ts`、`src/components/product-manager.tsx` |
| 订单来源/方式/高级筛选 | `src/domain/order.ts`、`src/server/backoffice.ts`、`src/components/order-manager.tsx` |
| 底片列表 | `src/components/photo-album-manager.tsx` |
| 数据模型 | `prisma/schema.prisma` |

## 验证

已通过：

```powershell
npm run typecheck
npm run lint
npm test
npx prisma validate
npm run build
```

当前测试结果：20 个测试文件，64 条用例通过。

补充：抖音真实接口对接计划见 `docs/channel-plugin-integration-plan.md`，当前 Next MVP 仍只作为渠道插件占位和验收样板，不保存真实抖音开放平台 token。
