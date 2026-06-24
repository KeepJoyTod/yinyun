# 影约云 Spring Boot 香港2旁路部署证据 2026-06-07

## 结论

Spring Boot 正式包已部署到香港2 `103.24.216.8`，作为旁路生产候选运行；现有 `yingyueyun.evanshine.me/api/douyin/life/*` 临时 Python SPI 未切换，仍保持在线。

## 部署内容

| 项 | 结果 |
| --- | --- |
| 服务器 | `103.24.216.8` / `ser4594579490` |
| 部署包 | `/opt/yingyue/releases/yingyue-api-deploy-e36df18.zip` |
| 部署 commit | `e36df18` |
| Spring Boot Jar | `/opt/yingyue/backend/ruoyi-admin.jar` |
| systemd 服务 | `yingyue-admin.service` |
| Java | `openjdk 17.0.19` |
| PostgreSQL | Docker `yingyue-postgres`，仅 `127.0.0.1:5432` |
| Redis | Docker `yingyue-redis`，仅 `127.0.0.1:6379` |
| 应用监听 | `127.0.0.1:8080` |

## 数据库

新库 `yingyue_cloud` 已导入基础表和影约云迁移，未导入 demo 数据。

导入顺序：

```text
postgres_ry_vue_5.X.sql
postgres_ry_job.sql
postgres_ry_workflow.sql
postgres_yy_cloud.sql
postgres_yy_cloud_codegen.sql
postgres_yy_channel_life_migration_20260606.sql
postgres_yy_ops_crud_migration_20260606.sql
postgres_yy_photo_private_oss_migration_20260606.sql
postgres_yy_photo_asset_object_key_guard_20260607.sql
```

结果：

```text
final_public_tables=80
key_tables=sys_user,yy_order,yy_photo_album,yy_photo_asset,yy_channel_sync_log
```

## 预检

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://yingyueyun.evanshine.me/spring-api -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

结果：

```text
douyin-missing-signature: rejected error_code=9999
preflight: passed
```

## 域名状态

| 域名/路径 | 结果 |
| --- | --- |
| `https://yingyueyun.evanshine.me/spring-api/...` | 新增隔离前缀，反代到 Spring Boot |
| `https://yingyueyun.evanshine.me/api/douyin/life/webhook` | 仍返回 `PING`，临时 SPI 未切走 |
| `https://api.evanshine.me/api/douyin/life/order/query` | 仍返回旧 `40401 Not Found`，Cloudflare/DNS 尚未路由到香港2 |

## 风险与下一步

- 不要直接把开放平台回调切到 Spring Boot，直到 `api.evanshine.me` 正确路由并完成正式 HTTPS 预检。
- 切换前应再次验证 `DOUYIN_LIFE_REQUIRE_SIGNATURE=true`，缺签名请求必须返回抖音裸 JSON 且 `data.error_code != 0`。
- `yingyueyun.evanshine.me/spring-api` 仅用于旁路预检，不作为开放平台正式回调地址。
