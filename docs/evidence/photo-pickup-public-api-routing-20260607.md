# 客户取片公网 API 路由排查 2026-06-07

## 结论

`http://47.94.157.55:8080` 当前不是影约云 Spring Boot API，而是阿里云 Lsky 临时图床入口。因此客户取片 smoke 在该地址失败是预期结果，不能通过只改客户端参数解决。

## 复现命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://47.94.157.55:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

## 复现结果

```text
POST http://47.94.157.55:8080/client/photo/auth/verify failed:
status=404, received HTML page instead of JSON
```

已额外探测：

```text
http://47.94.157.55:8080/client/photo/auth/verify -> 404
http://47.94.157.55:8080/prod-api/client/photo/auth/verify -> 404
http://47.94.157.55:8080/api/client/photo/auth/verify -> 404
```

## 服务器只读排查

SSH 只读检查 `aliyun-lsky`：

```text
47.94.157.55:8080 由 Caddy 监听
机器上没有 Java / Spring Boot 进程
机器上没有 Docker 容器
运行服务为 Caddy + PHP-FPM + MariaDB
```

Caddy 站点：

```text
:8080 -> /var/www/photo.evanshine.me/public
photo.evanshine.me -> /var/www/photo.evanshine.me/public
```

这说明该端口服务的是 Lsky PHP 应用，不会响应 `/client/photo/*`。

## 后续处理

二选一：

```text
方案 A：部署影约云 Spring Boot 到正式 API 服务器，并把 /client/photo/* 反代过去。
方案 B：新增正式 API 域名，例如 api.evanshine.me，专门指向 Spring Boot；H5/微信/抖音小程序都使用该域名。
```

不建议把 Lsky 临时服务器作为正式影约云客户取片后端。

