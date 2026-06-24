# 客户取片 H5 UI 复验记录

日期：2026-06-08

## 结论

本次复验发现并修复两个实际问题：

- `dev:h5` 本地代理模式默认预填 `13900001111 / PREVIEW-20260608`，但本地库没有该预览账号，会返回 `手机号或取片码错误`。
- 相册列表右上角 `退出` 使用 `uni-button` 后在 H5 窄屏下撑成大圆并换行，视觉不合格。

已调整为：

- `dev:h5` 默认填本地真实图账号：`13800003333 / PICK-202606-001`。
- `dev:h5:api` 默认填公网预览账号：`13900001111 / PREVIEW-20260608`。
- 相册列表 `退出` 改为紧凑文字按钮。
- 相册列表把 `ACTIVE` / `H5` 转换成 `可查看` / `网页取片`。
- 预览页移除覆盖在图片上的“左右滑动切换”提示，避免遮挡照片内容。
- 相册封面补真实 `load/error` 状态，签名 URL 返回但图片尚未加载时保留稳定占位。
- 详情页补“点击照片进入预览”说明、`短期链接` 标签和 `查看大图` 操作提示。
- 预览页补 `安全预览` / `短期授权访问` 信息条，强化短期授权交付语义。

## 浏览器复验

测试地址：

```text
http://127.0.0.1:5174/#/pages/pickup/login/index
```

本地真实图账号：

```text
手机号：13800003333
取片码：PICK-202606-001
相册：903001
```

已验证：

- 登录成功跳转相册列表。
- 相册列表返回 `1` 份可访问相册。
- 相册 `903001` 返回 `2` 张可见图片。
- 详情页缩略图接口返回 `200`。
- 预览页 `preview-url` / `download-url` 返回 `200`。
- 后端 smoke 的 `/stream` 返回 `200 image/png`。
- 详情页真实浏览器截图确认：2 张真实图、说明文案、`查看大图` 入口均可见。
- 预览页真实浏览器截图确认：主图、`安全预览`、序号、下载/返回按钮均可见。
- `https://api.evanshine.me` 下预览账号 `13900001111 / PREVIEW-20260608` 登录返回 `200`。
- `https://api.evanshine.me` 下本地样例账号 `13800003333 / PICK-202606-001` 返回 `手机号或取片码错误`，符合“本地样例账号不等于公网预览账号”的环境分工。

## 构建验证

```text
npm run typecheck      -> 通过
npm test               -> 2 tests, 0 fail
npm run test:h5        -> ok: true, responseCount=6
npm run build:h5       -> DONE Build complete
npm run build:mp-weixin -> DONE Build complete
npm run build:mp-toutiao -> DONE Build complete
```

后端目标单测：

```text
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test
-> Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
```

注意：PowerShell 下 `-Dsurefire.failIfNoSpecifiedTests=false` 必须加引号，否则会被拆成错误 lifecycle phase。

已新增完整本地验收脚本：

```text
tools/photo-pickup-local-acceptance.ps1
```

2026-06-08 18:15 复跑完整验收：

```text
tools/photo-pickup-local-acceptance.ps1 -> photo pickup local acceptance: passed
npm run test:h5 -> ok: true, responseCount=6
backend smoke -> auth/list/detail/preview-url/stream success
YyClientPhotoServiceImplTest -> Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
```

## 证据文件

```text
output/browser-real-after-login.png
output/detail-page.png
output/preview-page.png
output/albums-cover-load-final.png
output/preview-polish-final.png
```
