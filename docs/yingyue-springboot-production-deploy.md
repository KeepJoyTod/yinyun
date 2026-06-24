# 影约云 Spring Boot 生产部署说明

## 结论

正式客户取片和抖音来客 SPI 必须走影约云 Spring Boot API。`http://47.94.157.55:8080` 当前是 Lsky 临时图床入口，不是 Spring Boot API，不能作为 `/client/photo/*` 或 `/api/douyin/life/*` 的正式验收地址。

推荐拓扑：

| 项 | 值 |
| --- | --- |
| API 域名 | `https://api.evanshine.me` |
| Spring Boot upstream | `127.0.0.1:8080` |
| 客户取片 API | `/client/photo/*` |
| 后台 API | `/prod-api/*` |
| 抖音来客 SPI | `/api/douyin/life/*` |
| H5 取片入口 | `photo.evanshine.me` 或后续专属取片域名 |

## 前置条件

- 服务器出网 IP 已加入抖音生活服务白名单。
- 服务器开放 `80/443`，SSH/RDP 不对 `0.0.0.0/0` 开放。
- 已准备 PostgreSQL、Redis、私有 OSS Bucket。
- OSS Bucket 保持私有，阻止公共访问保持开启。
- 已生成 `ruoyi-admin.jar`。

## 构建后端

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

产物：

```text
backend\ruoyi-admin\target\ruoyi-admin.jar
```

也可以生成一个不含密钥的部署包：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-build-deploy-package.ps1
```

如果要先重新构建 jar：

```powershell
.\tools\yingyue-build-deploy-package.ps1 -Build
```

输出目录默认在：

```text
dist\yingyue-api-deploy
```

`dist/` 已被 `.gitignore` 忽略，部署包不会进入 Git。

## 生产环境变量

在服务器创建：

```text
/opt/yingyue/backend/.env.production
```

从 `backend/.env.example` 复制后改生产值。必须改掉所有 `change-before-production` 和 `replace-with-*`。

关键项：

```env
DB_URL=jdbc:postgresql://127.0.0.1:5432/yingyue_cloud?useUnicode=true&characterEncoding=utf8&sslmode=disable&reWriteBatchedInserts=true
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=yingyue
DB_PASSWORD=<server-only-secret>
REDIS_PASSWORD=<server-only-secret>
YY_CLIENT_PHOTO_TOKEN_SECRET=<server-only-32-plus-char-secret>
YY_CLIENT_ORDER_TOKEN_SECRET=<server-only-32-plus-char-secret>
YY_CLIENT_PUBLIC_TOKEN_SECRET=<server-only-32-plus-char-secret>
YY_CLIENT_ORDER_PUBLIC_BASE_URL=https://photo.evanshine.me
YY_PUBLIC_API_BASE_URL=https://api.evanshine.me
YY_CLIENT_PHOTO_STREAM_BASE_URL=https://api.evanshine.me
DOUYIN_LIFE_BASE_URL=https://open.douyin.com
DOUYIN_LIFE_REQUIRE_SIGNATURE=true
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

不要把 `.env.production`、真实 AccessKey、AppSecret、数据库密码提交到仓库或聊天。

## systemd 服务

参考模板：

```text
backend/script/deploy/yingyue-admin.service.example
```

部署后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable yingyue-admin
sudo systemctl restart yingyue-admin
sudo systemctl status yingyue-admin --no-pager
```

预期：

```text
Active: active (running)
```

## 反代配置

Nginx 模板：

```text
backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf
```

Caddy 模板：

```text
backend/script/docker/caddy/YingyueApi.Caddyfile.example
```

必须确保这些前缀命中 Spring Boot：

```text
/prod-api/
/client/photo/
/api/douyin/life/
```

## 数据库迁移

生产执行前先备份：

```bash
pg_dump -Fc -f /opt/yingyue/backups/yingyue_cloud_$(date +%Y%m%d_%H%M%S).dump yingyue_cloud
```

再执行：

```bash
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_order_payment_migration_20260611.sql
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql
```

如果是全新 PostgreSQL 库，先按顺序执行基础脚本：

```text
postgres_ry_vue_5.X.sql
postgres_ry_job.sql
postgres_ry_workflow.sql
postgres_yy_cloud.sql
postgres_yy_cloud_codegen.sql
postgres_yy_cloud_demo_data.sql
```

其中 `postgres_yy_cloud_demo_data.sql` 只建议测试环境执行；正式生产可跳过 demo 数据。

验收：

```sql
select count(*) from yy_photo_asset where del_flag = '0' and visible = '1' and coalesce(btrim(object_key), '') = '';

select tenant_id, album_id, object_key, count(*)
from yy_photo_asset
where del_flag = '0' and coalesce(btrim(object_key), '') <> ''
group by tenant_id, album_id, object_key
having count(*) > 1;
```

两个结果都应为 `0` 或空结果。

## 生产预检

本地执行：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

可选检查抖音 SPI 缺签名是否被拒绝：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -CheckDouyinMissingSignature
```

如果生产库还没有 `13800003333` 这类测试相册数据，只单独验证 SPI 签名：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

如果这个探针提示 `missing signature was accepted`，说明当前运行环境没有强制启用 `DOUYIN_LIFE_REQUIRE_SIGNATURE=true`，生产不能上线。

平台配置前后执行发布就绪检查：

```powershell
.\tools\yingyue-platform-readiness.ps1
```

该脚本会检查 API HTTPS、Webhook challenge JSON、缺签名 SPI 拒绝、小程序构建产物、抖音小程序 AppID、GitHub 私有状态，并输出平台后台需要填写的 URL。

## 平台配置

微信小程序：

```text
request合法域名: https://api.evanshine.me
downloadFile合法域名: https://api.evanshine.me
uploadFile合法域名: https://api.evanshine.me
```

抖音小程序：

```text
request/download/upload domain: https://api.evanshine.me
```

抖音生活服务开放平台 SPI URL：

```text
https://api.evanshine.me/api/douyin/life/webhook
https://api.evanshine.me/api/douyin/life/tripartite-code/create
https://api.evanshine.me/api/douyin/life/refund/apply
https://api.evanshine.me/api/douyin/life/refund/notify
https://api.evanshine.me/api/douyin/life/reservation/order-create
https://api.evanshine.me/api/douyin/life/reservation/pay-notify
https://api.evanshine.me/api/douyin/life/reservation/order-query
https://api.evanshine.me/api/douyin/life/reservation/stock-query
https://api.evanshine.me/api/douyin/life/voucher/revoke
https://api.evanshine.me/api/douyin/life/voucher/batch-revoke
https://api.evanshine.me/api/douyin/life/order/query
https://api.evanshine.me/api/douyin/life/fulfil/check-info-sync
```

## 回滚

1. 反代临时切回旧 upstream。
2. `sudo systemctl stop yingyue-admin`。
3. 用备份恢复数据库前先确认没有新订单/新相册写入。
4. 抖音开放平台 SPI URL 如需回滚，要同步记录回滚时间和 logid。
