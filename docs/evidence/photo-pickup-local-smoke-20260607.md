# 客户取片本地 Smoke 证据 2026-06-07

## 结论

本地 Spring Boot 后端已恢复，客户取片主链路通过。

## 启动方式

直接执行 `java -jar ruoyi-admin\target\ruoyi-admin.jar --spring.profiles.active=dev` 会因为没有带上本地 DB/Redis 环境变量而失败，日志根因为：

```text
FATAL: password authentication failed for user "postgres"
```

正确启动方式：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\start-yingyue-local.ps1 -SkipFrontend -SkipPrototype
```

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

## 验证结果

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success assetId=2063173233076416514, contentType=image/png
stream: success status=200, contentType=image/png
```

脚本只输出 token 长度和前后 4 位，未记录完整 `clientToken` 或签名 URL。

