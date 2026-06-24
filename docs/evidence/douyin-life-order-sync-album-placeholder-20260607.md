# 抖音订单同步生成取片相册证据 2026-06-07

## 结论

已在香港2生产环境用加白出口跑通抖音 OpenAPI 订单查询，并用指定订单同步到影约云本地库。同步结果成功创建 1 条本地订单和 1 个 `DOUYIN_LIFE` 客户取片相册占位。

这证明当前链路已经闭合：

```text
抖音订单查询 -> yy_order -> yy_channel_order_mapping -> yy_photo_album 占位
```

## 生产环境

| 项 | 值 |
| --- | --- |
| 服务器 | 香港2 `103.24.216.8` |
| 服务 | `yingyue-admin` |
| API 域名 | `https://api.evanshine.me` |
| 后端 Jar | `/opt/yingyue/backend/ruoyi-admin.jar` |
| 数据库 | PostgreSQL 容器 `yingyue-postgres` / database `yingyue_cloud` |

## 关键过程

| 步骤 | 结果 |
| --- | --- |
| 远程 OpenAPI 探针 | `client_token` 成功，订单查询成功 |
| 远程订单查询 logid | `20260607211535C87A5FBA80DF285ABD5A` |
| 远程脚本复测 | 2026-06-07 22:08 复测成功，订单查询 logid `202606072208504E201B9153C6496DA465`，返回订单数 `10` |
| 初次生产同步问题 | `yy_order.store_id` 非空约束失败 |
| 根因 | 生产 `yy_store` 和 `yy_channel_account` 当时均为空，没有门店兜底 |
| 修复 | `upsertLocalOrder(...)` 增加门店兜底：显式 `storeId` -> 渠道配置 `storeId` -> 第一家 `yy_store`；仍无门店时返回本地落库失败，不抛 DB 异常 |
| 生产补齐 | 创建默认门店 `DY-LIFE-DEFAULT` / `抖音来客默认门店` |
| 指定订单同步 | `SyncStatus=SYNCED`、`Total=1`、`Created=1`、`Failed=0` |
| 同步 logid | `202606072150269EF6B8106858BB7611D2` |

## 相册审计

同步后生产审计结果：

| 项 | 结果 |
| --- | --- |
| `DOUYIN_LIFE` 相册总数 | `1` |
| 最近 48 小时 `DOUYIN_LIFE` 相册数 | `1` |
| 相册 ID | `2063619596662734850` |
| 门店 ID | `2063619430924812290` |
| 本地订单 ID | `2063619596503351297` |
| 抖音订单号 | `8000010230007933698` |
| 相册状态 | `ACTIVE` |
| 选片状态 | `WAITING` |
| 手机号记录 | 存在，未打印明文 |

## 代码护栏

本次又补了一层状态护栏：

- 如果 OpenAPI 查到订单，但本地订单因为缺门店等原因没有落库，`yy_channel_order_mapping.sync_status` 写 `FAILED_LOCAL`。
- 只有拿到本地 `orderId` 时，映射才写 `SYNCED`。
- 这样后台不会再出现“映射显示成功，但本地订单为空”的误导状态。

## 验证命令

远程只读查单：

```powershell
.\tools\yingyue-douyin-openapi-remote-order-query.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 48 -PageSize 10
```

相册审计：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 48 -RecentLimit 10
```

后端回归：

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dtest=DouyinLifeChannelAdapterTest,YyChannelSyncLogServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

结果：`26 tests, 0 failures, 0 errors`。

## 注意

- 不要使用宽时间范围做生产批量同步，直到抖音订单查询时间过滤行为完全确认。
- 生产安全验证优先使用指定 `orderId`。
- 远程探针脚本会脱敏 token、secret、手机号、openid，不应增加明文输出。
