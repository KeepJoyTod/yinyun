# 影约云生产部署记录 71f19cb

时间：2026-06-11

## 结论

`71f19cb` 已部署到香港2生产 API 服务器，`https://api.evanshine.me` 预检通过。
管理后台与门店工作台独立域名已完成 nginx 挂载和 HTTPS 配置。

本次上线重点：

- PostgreSQL 订单支付/预约库存迁移已执行。
- `ruoyi-admin.jar` 已替换并由 `yingyue-admin.service` 重启。
- 客户电脑网页 `https://yingyueyun.evanshine.me` 已重新同步当前 `client-web` 包。
- 管理后台 `https://admin.evanshine.me` 已挂载 `admin-ui` 生产包，`/prod-api/` 反向代理到生产后端。
- 门店工作台 `https://studio.evanshine.me` 已挂载 `studio-workbench` 生产包。

## 服务器

| 项 | 值 |
| --- | --- |
| 目标机 | 香港2 |
| API 域名 | `https://api.evanshine.me` |
| 客户电脑网页 | `https://yingyueyun.evanshine.me` |
| 管理后台 | `https://admin.evanshine.me` |
| 门店工作台 | `https://studio.evanshine.me` |
| Spring Boot 服务 | `yingyue-admin.service` |
| Jar 路径 | `/opt/yingyue/backend/ruoyi-admin.jar` |
| 后端 Release 目录 | `/opt/yingyue/releases/71f19cb` |
| 前端 Release 目录 | `/opt/yingyue/releases/71f19cb/frontend` |
| 后端备份目录 | `/opt/yingyue/backups/20260611-211329-pre-71f19cb` |
| 客户网页备份目录 | `/opt/yingyue/backups/20260611-212539-pre-client-web-71f19cb` |
| 管理后台/门店工作台 nginx 备份目录 | `/opt/yingyue/backups/20260611-214850-pre-admin-studio-nginx-71f19cb` |

## 数据库迁移

执行脚本：

```text
/opt/yingyue/releases/71f19cb/sql/postgres/postgres_yy_order_payment_migration_20260611.sql
```

迁移结果：

```text
yy_booking_slot_inventory: exists
yy_order payment/inventory columns checked: 4
sys_menu inventory entries: 5
```

数据库备份：

```text
/opt/yingyue/backups/20260611-211329-pre-71f19cb/yingyue_cloud.dump
```

## 服务验证

远端服务状态：

```text
yingyue-admin.service: active
JAR: yingyue:yingyue 644 162827221 /opt/yingyue/backend/ruoyi-admin.jar
Spring Boot started successfully.
```

生产预检：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount -CheckDouyinMissingSignature
```

结果：

```text
auth: success
albums: success count=1
detail: success albumId=990202606080001, assetCount=4
thumbnail-url: success
preview-url: success
download-url: success
auth-json-route: success
douyin-missing-signature: rejected error_code=9999
preflight: passed
```

平台 readiness：

```powershell
.\tools\yingyue-platform-readiness.ps1
```

结果：

```text
api-domain-scheme: PASS
douyin-miniapp-appid: PASS
wechat-miniapp-appid: PASS
douyin-miniapp-dist: PASS
wechat-miniapp-dist: PASS
douyin-webhook-challenge: PASS
douyin-missing-signature: PASS
github-repo-private: PASS
platform readiness passed
```

客户电脑网页：

```text
GET https://yingyueyun.evanshine.me -> 200
```

管理后台与门店工作台：

```text
nginx -t -> ok
certbot --nginx -d admin.evanshine.me -d studio.evanshine.me -> success
certificate: /etc/letsencrypt/live/admin.evanshine.me/fullchain.pem
certificate expires: 2026-09-09
GET https://admin.evanshine.me -> 200 text/html
GET https://studio.evanshine.me -> 200 text/html
GET https://admin.evanshine.me/prod-api/captchaImage -> 200 application/json
```

## 当前外部阻塞

项目代码、部署包、生产 API、客户网页已就绪。微信/抖音小程序后台合法域名已由用户确认完成：

```text
request 合法域名: https://api.evanshine.me
uploadFile 合法域名: https://api.evanshine.me
downloadFile 合法域名: https://api.evanshine.me
```

最终 `get-yingyue-delivery-status.ps1` 仍为 `BLOCKED`，原因是外部实际运行验收项未完成：

- 微信小程序需完成开发者工具或真机验收：登录、相册、预览、保存图片。
- 抖音小程序需完成开发者工具或真机验收：登录、相册、预览、保存图片。
- 抖音来客真实验收需要平台侧能力和真实触发：发券 SPI logid、创单/支付回调、接单 logid、核销 logid。

## 回滚信息

后端回滚：

```bash
cp /opt/yingyue/backups/20260611-211329-pre-71f19cb/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin
```

客户网页回滚：

```bash
rsync -a --delete /opt/yingyue/backups/20260611-212539-pre-client-web-71f19cb/yingyueyun-www/ /var/www/yingyueyun/
systemctl reload nginx
```

管理后台/门店工作台回滚：

```bash
cp /opt/yingyue/backups/20260611-214850-pre-admin-studio-nginx-71f19cb/nginx-sites-available-yingyue-frontends.conf /etc/nginx/sites-available/yingyue-frontends.conf
rsync -a --delete /opt/yingyue/backups/20260611-214850-pre-admin-studio-nginx-71f19cb/admin.evanshine.me/ /var/www/admin.evanshine.me/
rsync -a --delete /opt/yingyue/backups/20260611-214850-pre-admin-studio-nginx-71f19cb/studio.evanshine.me/ /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

数据库回滚需先确认部署后是否产生新订单、新预约、新相册，再决定是否从 dump 恢复。
