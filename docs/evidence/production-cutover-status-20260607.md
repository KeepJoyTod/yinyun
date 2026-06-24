# 影约云生产切换状态 2026-06-07

## 结论

本地“上线前工具链”已补齐，香港2 `103.24.216.8` 已完成 Spring Boot 旁路生产候选部署，PostgreSQL/Redis/Java/systemd 均已跑通。`api.evanshine.me` 已指向香港2并签发独立 HTTPS 证书，签名专项预检通过。剩余未完成项主要是正式切换：开放平台回调 URL 切换、微信/抖音小程序合法域名配置。

## 本地已完成

| 项 | 状态 | 证据 |
| --- | --- | --- |
| 生产部署文档 | 已完成 | `docs/yingyue-springboot-production-deploy.md` |
| Nginx API 反代模板 | 已完成 | `backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf` |
| Caddy API 反代模板 | 已完成 | `backend/script/docker/caddy/YingyueApi.Caddyfile.example` |
| systemd 服务模板 | 已完成 | `backend/script/deploy/yingyue-admin.service.example` |
| 生产预检脚本 | 已完成 | `tools/yingyue-production-preflight.ps1` |
| 只测抖音 SPI 签名开关 | 已完成 | `-SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature` |
| 部署包生成脚本 | 已完成 | `tools/yingyue-build-deploy-package.ps1` |
| 部署包生成 | 已验证 | `docs/evidence/deploy-package-local-20260607.md` |
| 本地客户取片预检 | 已通过 | `docs/evidence/production-cutover-preflight-local-20260607.md` |
| 生产域名探测 | 已完成 | `docs/evidence/production-domain-probe-20260607.md` |
| 香港2 Spring Boot 旁路部署 | 已通过 | `docs/evidence/production-springboot-deploy-hk2-20260607.md` |
| `api.evanshine.me` 正式域名预检 | 已通过 | `docs/evidence/production-api-domain-cutover-ready-20260607.md` |

## 本地提交

当前本地分支领先远端：

```text
61a98bd tools: add yingyue deploy package builder
1ea962c test: allow signature-only production preflight
e3958fb docs: record production preflight evidence
18b9359 docs: add production cutover preflight
```

## 当前阻塞

`git push` 多次失败，最近一次结果：

```text
Failed to connect to github.com port 443 after 21206 ms: Could not connect to server
```

判断：当前是本机到 GitHub HTTPS 的网络问题，不是仓库状态或代码问题。

2026-06-07 后续更新：GitHub push 已恢复，远端分支已同步到 `8716963`，PR 正文已更新。

## 当前外部状态

| 项 | 状态 |
| --- | --- |
| `api.evanshine.me` | 已命中香港2 Spring Boot；HTTPS 证书 CN 为 `api.evanshine.me`；缺签名 SPI 预检返回 `data.error_code=9999` |
| `yingyueyun.evanshine.me` | `/api/douyin/life/webhook` challenge 返回 `PING`，旧临时 SPI 仍在线；`/spring-api` 隔离前缀已反代 Spring Boot 并通过签名预检 |
| `photo.evanshine.me` | HTTPS 探测出现 EOF，不作为正式 API 验收域名 |
| `103.24.216.8` | 可用密码登录；Spring Boot 旁路服务 active，监听 `127.0.0.1:8080` |
| `38.76.178.91` | 22 端口可达，但当前无可用私钥 BatchMode 登录 |

## 待外部执行

| 项 | 下一步 |
| --- | --- |
| 推送 PR | 已完成 |
| Spring Boot API 上线 | 香港2旁路部署已完成，暂未承接正式抖音回调 |
| API 域名 | 已完成，`https://api.evanshine.me` 通过签名预检 |
| 生产 DB | 香港2新库已初始化；正式业务切换前确认是否迁入旧数据 |
| OSS 私有验证 | 裸 OSS 链接 403；后端 stream 200 |
| 抖音 SPI | 开放平台回调 URL 切到 `https://api.evanshine.me/api/douyin/life/*` |
| 生产验签 | 设置 `DOUYIN_LIFE_REQUIRE_SIGNATURE=true`，并让签名探针通过 |
| 小程序域名 | 微信/抖音 request/download/upload 配置 `https://api.evanshine.me` |
