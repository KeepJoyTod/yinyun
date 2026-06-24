# 生产域名探测证据 2026-06-07

## 结论

当前 `api.evanshine.me` 尚未反代到影约云 Spring Boot API。`yingyueyun.evanshine.me` 仍可响应抖音 webhook challenge，说明旧临时 SPI 域名仍在线。

## 探测结果

### `api.evanshine.me`

命令：

```powershell
Invoke-WebRequest -Method Post -Uri 'https://api.evanshine.me/client/photo/auth/verify' -ContentType 'application/json' -Body '{"phone":"13800003333","code":"PICK-202606-001","platform":"H5"}'
```

结果摘要：

```json
{"code":40401,"message":"Not Found","data":null,"requestId":"req_b3d17a39e11f4c6d"}
```

判断：

```text
不是 RuoYi/Spring Boot 客户取片接口响应。正式 API 域名还没有切到 Spring Boot。
```

### `yingyueyun.evanshine.me`

命令：

```powershell
Invoke-WebRequest -Method Post -Uri 'https://yingyueyun.evanshine.me/api/douyin/life/webhook' -ContentType 'application/json' -Body '{"challenge":"PING"}'
```

结果摘要：

```text
HTTP 200
PING
```

判断：

```text
旧抖音回调域名仍在线，当前仍承担 webhook challenge 能力。后续要把 /api/douyin/life/* 切到 Spring Boot 并启用 DOUYIN_LIFE_REQUIRE_SIGNATURE=true。
```

### `photo.evanshine.me`

命令：

```powershell
Invoke-WebRequest -Method Get -Uri 'https://photo.evanshine.me'
```

结果摘要：

```text
SSL connection could not be established; Received an unexpected EOF or 0 bytes from the transport stream.
```

判断：

```text
当前 photo 域名 HTTPS 不稳定，不适合作为正式 API 验收域名。
```

## 当前 SSH 状态

| 目标 | 结果 |
| --- | --- |
| `oracle-japan` | SSH 连接被关闭 |
| `aliyun-lsky` | 依赖 `oracle-japan` ProxyJump，因此失败 |
| `root@103.24.216.8` | 22 端口可达，但当前无可用私钥，BatchMode 登录失败 |
| `root@38.76.178.91` | 22 端口可达，但当前无可用私钥，BatchMode 登录失败 |

## 下一步

1. 在目标服务器 `103.24.216.8` 或实际 Spring Boot 主机上添加本机可用公钥，或提供可用 SSH alias。
2. 部署 `dist\yingyue-api-deploy`。
3. 将 `api.evanshine.me` 反代到 Spring Boot。
4. 跑 `tools\yingyue-production-preflight.ps1` 记录生产通过证据。
