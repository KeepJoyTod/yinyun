# Frontend Hotfix Deploy - adceda1

时间：2026-06-12 17:55 CST

## 结论

已将客户电脑网页和门店工作台的入口边界更新部署到生产静态站点：

- 客户电脑网页 `/booking`：改为微信/抖音小程序预约引导，不再展示网页预约表单。
- 旧 `/booking/success`：返回同一个 SPA 入口，由前端重定向到 `/booking`。
- 门店工作台顶部主按钮：改为“处理订单”，点击进入 `/orders`，不再弹“新建预约”表单。

## 部署目标

| 项 | 值 |
| --- | --- |
| Commit | `adceda1` |
| 本地包 | `dist/frontend-hotfix-adceda1.zip` |
| 远端包 | `/opt/yingyue/releases/frontend-hotfix-adceda1.zip` |
| 远端 release | `/opt/yingyue/releases/frontend-hotfix-adceda1` |
| 远端备份 | `/opt/yingyue/backups/20260612-175548-pre-frontend-hotfix-adceda1` |
| 客户网页目录 | `/var/www/yingyueyun/` |
| 门店工作台目录 | `/var/www/studio.evanshine.me/` |

## 构建验证

```text
client-web npm test -> 10 files / 31 tests passed
client-web npm run build -> passed
studio-workbench npm test -> 10 files / 27 tests passed
studio-workbench npm run build -> passed
```

说明：`studio-workbench` 构建仍有 Vite chunk size warning，属于体积优化提示，不影响本次静态部署。

## 远端静态校验

```text
release_dir=exists
client_index=exists
studio_index=exists
client_has_miniapp=yes
client_has_old_submit=no
studio_has_handle_orders=yes
studio_has_new_appointment=no
nginx -t -> successful
```

## 公网验证

| URL | 结果 |
| --- | --- |
| `https://yingyueyun.evanshine.me/booking` | `200 text/html` |
| `https://yingyueyun.evanshine.me/booking/success` | `200 text/html` |
| `https://studio.evanshine.me/` | `200 text/html` |

静态资源关键词检查：

| 检查 | 结果 |
| --- | --- |
| 客户网页 `BookingView` 包含“小程序预约” | `true` |
| 客户网页 `BookingView` 包含“提交预约意向” | `false` |
| 门店工作台主包包含“处理订单” | `true` |
| 门店工作台主包包含“新建预约” | `false` |

## 回滚

```bash
cp -a /opt/yingyue/backups/20260612-175548-pre-frontend-hotfix-adceda1/yingyueyun/. /var/www/yingyueyun/
cp -a /opt/yingyue/backups/20260612-175548-pre-frontend-hotfix-adceda1/studio.evanshine.me/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

