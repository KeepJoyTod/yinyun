# Studio Workbench Yuyue Reference Deploy 2026-06-14

## Result

`41ba8bc feat(studio): align workbench UI with yuyue reference` has been deployed to `https://studio.evanshine.me`.

This deploy updates only the studio workbench static files. It does not change backend services, database schema, OSS configuration, miniapp builds, or the system admin site.

## Deployment

| Item | Value |
| --- | --- |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Local package | `dist/studio-workbench-41ba8bc.zip` |
| Remote package | `/opt/yingyue/releases/studio-workbench-41ba8bc.zip` |
| Release | `/opt/yingyue/releases/studio-workbench-41ba8bc` |
| Backup | `/opt/yingyue/backups/20260614-175752-pre-studio-workbench-41ba8bc` |

## What Changed

- Dashboard now shows business overview, product ranking, channel order summary, conflict reminders, and quick entrances.
- Appointment orders, photo management, online selection, employees, roles, channels, and logs are aligned with the yuyue123 reference structure while keeping the Yingyue dark sidebar and amber workbench style.
- Employees page now has store/status/role/keyword filters and reference-compatible columns.
- Logs page now has handler/mobile/content/logid filters and reference-compatible columns.
- Shared workbench UI primitives were added: `StateView`, `NoticeBanner`, `StatusBadge`, `SkeletonRows`, and URL filter sync.

## Verification

Local:

```text
studio-workbench npm test -> 63 files, 309 tests passed
studio-workbench npm run build -> passed
git diff --check -> passed
```

Remote deploy output:

```text
commit=41ba8bc
release=/opt/yingyue/releases/studio-workbench-41ba8bc
backup=/opt/yingyue/backups/20260614-175752-pre-studio-workbench-41ba8bc
site=/var/www/studio.evanshine.me
asset_count=85
index=exists
nginx -t -> successful
```

Public HTTP checks:

```text
https://studio.evanshine.me/ -> 200 text/html
https://studio.evanshine.me/order/appointment -> 200 text/html
https://studio.evanshine.me/service/photos -> 200 text/html
https://studio.evanshine.me/settings/logs -> 200 text/html
```

Browser smoke:

- `/dashboard`: `经营概况`, `产品排行`, `渠道订单汇总`, `库存冲突提醒` visible.
- `/order/appointment`: `预约订单`, `导出接口未接入`, customer/product table content visible.
- `/service/photos`: `客片管理`, `通知客户`, `客片确认`, `资料发送` visible.
- `/service/selection`: `在线选片`, `待提交`, `待选片`, `已完成` visible.
- `/settings/employees`: `员工管理`, `选择状态`, `添加日期`, `未接入` visible.
- `/settings/logs`: `系统日志`, `处理场景`, `处理人`, `处理结果`, `处理时间`, `处理内容`, `requestId/logid` visible.
- Checked viewport width `1280`; no horizontal document overflow on the smoke routes.

## Notes

SSH had intermittent banner handshake failures from Windows/Posh-SSH. Deployment was completed via Python Paramiko with retry and the existing `香港2.txt` password-file parsing rule. The final remote commands completed successfully.

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260614-175752-pre-studio-workbench-41ba8bc/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
