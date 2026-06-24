# 生产切换预检本地证据 2026-06-07

## 结论

本地 Spring Boot API 的客户取片预检通过。抖音来客缺签名探针在本地失败，失败原因是当前本地运行环境接受了缺少 `x-life-sign` 的 SPI 请求；这正是生产上线前要拦住的风险，正式环境必须设置 `DOUYIN_LIFE_REQUIRE_SIGNATURE=true` 后再跑探针。

## 环境

| 项 | 值 |
| --- | --- |
| 仓库 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` |
| 分支 | `yingyue-closed-loop-optimization-20260603` |
| BaseUrl | `http://127.0.0.1:8080` |
| 手机号 | `13800003333` |
| 取片码 | `PICK-202606-001` |
| 相册 | `903001` |

## 客户取片预检

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

结果摘要：

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success
stream: success status=200, contentType=image/png
auth-json-route: success
preflight: passed
```

脚本没有输出完整 `clientToken`，也没有输出完整签名 URL。

## 抖音 SPI 缺签名探针

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl http://127.0.0.1:8080 -SkipPhotoSmoke -CheckDouyinMissingSignature
```

结果摘要：

```text
auth-json-route: success
douyin signature probe failed: missing signature was accepted; check DOUYIN_LIFE_REQUIRE_SIGNATURE=true
```

判断：

```text
本地环境未强制启用 DOUYIN_LIFE_REQUIRE_SIGNATURE=true。
生产环境必须让该探针返回 Douyin raw JSON failure，不能接受缺签名请求。
```

补充：如果生产库没有 demo 取片账号，可使用 `-SkipAuthJsonRoute` 跳过取片 auth，仅检查抖音 SPI 签名。
