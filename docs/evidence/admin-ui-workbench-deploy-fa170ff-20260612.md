# 管理后台员工首页部署记录 fa170ff

时间：2026-06-12

## 结论

`fa170ff` 已部署到 `https://admin.evanshine.me`。

本次上线只更新管理后台静态文件，不改后端服务、不改数据库、不改 `studio.evanshine.me`。

## 变更

| 项 | 结果 |
| --- | --- |
| 提交 | `fa170ff feat: improve douyin life workbench visibility` |
| 前端入口 | `admin-ui/src/views/index.vue` |
| 线上目录 | `/var/www/admin.evanshine.me` |
| 备份目录 | `/opt/yingyue/backups/20260612-170110-pre-admin-ui-fa170ff` |

员工首页现在聚合：

- `GET /yy/channel/DOUYIN_LIFE/auto-sync/status`
- `POST /yy/channel/DOUYIN_LIFE/orders/sync`
- `GET /yy/order/list?source=DOUYIN_LIFE&pageSize=6`
- `GET /yy/order/list?inventoryStatus=CONFLICT&pageSize=1`
- `GET /yy/order/list?photoDeliveryIssueOnly=1&pageSize=1`

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:prod
```

结果：

- `npm run test:yy`：10 个测试文件、76 个用例通过。
- `npm run build:prod`：通过。
- 本地浏览器：`http://127.0.0.1:5180` 前端壳正常加载；本地后端未接入时会提示接口 500。
- 线上：`GET https://admin.evanshine.me` 返回 `200 text/html`。
- 线上：`GET https://admin.evanshine.me/prod-api/captchaImage` 返回 `200 application/json`。

## 回滚

```bash
rsync -a --delete /opt/yingyue/backups/20260612-170110-pre-admin-ui-fa170ff/admin.evanshine.me/ /var/www/admin.evanshine.me/
nginx -t
systemctl reload nginx
```
