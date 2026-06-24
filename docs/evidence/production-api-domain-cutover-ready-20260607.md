# 影约云 API 域名预检证据 2026-06-07

## 结论

`api.evanshine.me` 已指向香港2 `103.24.216.8`，并已在 nginx 上签发独立 Let's Encrypt 证书。Spring Boot 生产候选服务通过正式 API 域名预检。

## 证书

```text
subject=CN = api.evanshine.me
issuer=C = US, O = Let's Encrypt, CN = YE2
notBefore=Jun  7 00:31:20 2026 GMT
notAfter=Sep  5 00:31:19 2026 GMT
```

## HTTPS 探测

请求：

```text
POST https://api.evanshine.me/api/douyin/life/order/query
```

结果：

```text
HTTP 200
data.error_code=9999
fail_reason=SIGNATURE_INVALID
```

说明：缺少 `x-life-sign` 的请求被 Spring Boot 正式 SPI 拒绝，且返回抖音裸 JSON，不是 RuoYi wrapper。

## 预检脚本

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

结果：

```text
yingyue production preflight
baseUrl: https://api.evanshine.me
auth-json-route: skipped
douyin-missing-signature: rejected error_code=9999
preflight: passed
```

## 未切换项

`https://yingyueyun.evanshine.me/api/douyin/life/webhook` 仍返回 `PING`，现有临时 Python SPI 未切走。

下一步是把抖音开放平台回调地址从 `yingyueyun.evanshine.me` 切到 `api.evanshine.me` 对应路径，切换后再按真实回调 logid 验证。
