# Studio Workbench GSAP Deploy - 0820c9e

时间：2026-06-12 19:06 CST

## 结论

已将门店工作台 GSAP 启动动画和排期页时段条动画部署到生产静态站点：

- 生产入口：`https://studio.evanshine.me`
- 排期页入口：`https://studio.evanshine.me/schedule`
- 本次只更新门店工作台静态文件，不改后端、不改数据库、不改客户网页和管理后台。

## 部署目标

| 项 | 值 |
| --- | --- |
| Commit | `0820c9e` |
| 本地包 | `dist/studio-workbench-0820c9e.zip` |
| 远端包 | `/opt/yingyue/releases/studio-workbench-0820c9e.zip` |
| 远端 release | `/opt/yingyue/releases/studio-workbench-0820c9e` |
| 远端备份 | `/opt/yingyue/backups/20260612-190558-pre-studio-workbench-0820c9e` |
| 门店工作台目录 | `/var/www/studio.evanshine.me/` |

## 本地验证

```text
studio-workbench npm test -> 10 files / 27 tests passed
studio-workbench npm run build -> passed
```

说明：`studio-workbench` 构建仍有 Vite chunk size warning，属于体积优化提示，不影响本次静态部署。

## 远端静态校验

```text
studio_index=exists
asset_count=23
has_workbench_motion=yes:/var/www/studio.evanshine.me/assets/index-C9qQ4D_s.css
has_gsap_keyword=yes:/var/www/studio.evanshine.me/assets/index-CGO7PxPB.js
has_schedule_bundle=/var/www/studio.evanshine.me/assets/ScheduleView-_qGAsljb.js
has_reservation_bundle=/var/www/studio.evanshine.me/assets/ReservationSlots-DfGOC2s0.js
nginx -t -> successful
```

## 公网验证

| URL | 结果 |
| --- | --- |
| `https://studio.evanshine.me/` | `200 text/html` |
| `https://studio.evanshine.me/login` | `200 text/html` |
| `https://studio.evanshine.me/schedule` | `200 text/html` |

线上 `index.html` 已引用新静态资源：

```text
/assets/index-CGO7PxPB.js
/assets/index-C9qQ4D_s.css
```

## 回滚

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260612-190558-pre-studio-workbench-0820c9e/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
