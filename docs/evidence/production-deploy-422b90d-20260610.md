# 影约云生产部署记录 422b90d

时间：2026-06-10

## 结论

`422b90d` 已部署到香港2生产 API 服务器，`https://api.evanshine.me` 验证通过。

## 服务器

| 项 | 值 |
| --- | --- |
| 目标机 | 香港2 |
| API 域名 | `https://api.evanshine.me` |
| Spring Boot 服务 | `yingyue-admin.service` |
| Jar 路径 | `/opt/yingyue/backend/ruoyi-admin.jar` |
| Release 目录 | `/opt/yingyue/releases/422b90d` |
| 前端包暂存目录 | `/opt/yingyue/releases/422b90d/frontend` |
| 客户电脑网页域名 | `https://yingyueyun.evanshine.me` |
| 备份目录 | `/opt/yingyue/backups/20260610-172333-pre-422b90d` |

## 部署内容

- API Jar：`ruoyi-admin.jar`
- 本地 commit：`422b90d`
- Jar SHA256：
  `acdd5c8ff0bacf585a561dff9fb2418ab9e214c1bc835697709e3341ff218bb0`
- 前端交付包已上传并解压：
  `/opt/yingyue/releases/422b90d/yingyue-frontend-deploy-422b90d.zip`
- 客户电脑网页端已按生产 API 地址重新构建并切到：
  `https://yingyueyun.evanshine.me`
- 客户电脑网页生产包：
  `/opt/yingyue/releases/422b90d/yingyue-client-web-e930578-prod.zip`

## 处理过的线上问题

1. 旧 root 孤儿 Java 进程占用 `127.0.0.1:8080`。
   - 旧进程启动时间：2026-06-09 23:06
   - 处理：停止旧 root 进程，保留 systemd 管理的 `yingyue` 进程。
2. Logback 写 `./logs/sys-*.log` 曾出现权限错误。
   - 处理：确认并修复 `/opt/yingyue/backend/logs` 为 `yingyue:yingyue` 可写。
3. 客户电脑网页原构建未固定生产 API 地址。
   - 处理：用 `VITE_API_BASE_URL=https://api.evanshine.me` 重新构建 `client-web`。
   - 处理：用 `VITE_STUDIO_WORKBENCH_URL=https://studio.evanshine.me/login` 避免线上出现本地工作台地址。
4. `yingyueyun.evanshine.me` 原 Nginx 根路由不支持 SPA 直达路由。
   - 处理：将 `try_files $uri $uri/ =404` 改为 `try_files $uri $uri/ /index.html`。
   - Nginx 备份：`/opt/yingyue/backups/20260610-180257-pre-client-web-e930578`。

## 验证结果

### 服务状态

```text
yingyue-admin.service: active/running
8080 listener: java pid under user yingyue
NRestarts: 0
```

### 客户取片公网验证

```text
POST https://api.evanshine.me/client/photo/auth/verify
phone=13900001111
code=PREVIEW-20260608
result: code=200

GET /client/photo/albums
result: code=200, albumCount=1

GET /client/photo/albums/990202606080001
result: code=200, assetCount=4
```

### 抖音 Webhook 验证

```text
POST https://api.evanshine.me/api/douyin/life/webhook
body={"challenge":"codex-final-422b90d"}
result: 200 application/json
response={"challenge":"codex-final-422b90d"}
```

### 生产预检

执行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount -CheckDouyinMissingSignature
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

### 平台 readiness

执行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-platform-readiness.ps1
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

### 客户电脑网页浏览器验收

入口：

```text
https://yingyueyun.evanshine.me/customer/login
```

测试账号：

```text
phone=13900001111
code=PREVIEW-20260608
```

结果：

```text
登录页渲染：通过
登录跳转：/customer/albums
相册列表：显示相册 990202606080001
相册详情：显示 4 张照片
浏览器控制台错误：0
```

## 待处理

- 客户电脑网页端已临时使用 `yingyueyun.evanshine.me`。
- 仍需确定以下正式独立域名后再切对应前端：
  - 门店工作台 PC 端，例如 `studio.evanshine.me`
  - 系统管理后台网页端，例如 `admin.evanshine.me`
- 微信/抖音小程序仍需在平台后台配置合法域名：
  `https://api.evanshine.me`
