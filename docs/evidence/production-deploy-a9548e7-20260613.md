# 影约云生产部署记录 a9548e7

时间：2026-06-13

## 结论

`a9548e7` 已部署到香港2生产 API 服务器，`https://api.evanshine.me` 预检通过。

本次为后端热修：支持客户输入完整 11 位手机号时，匹配抖音来客同步订单中已脱敏保存的手机号，例如 `136****9923`。客户仍必须输入完整手机号和后四位，不支持仅后四位查单，避免枚举订单。

## 部署信息

| 项 | 值 |
| --- | --- |
| 目标机 | 香港2 `103.24.216.8` |
| API 域名 | `https://api.evanshine.me` |
| Spring Boot 服务 | `yingyue-admin.service` |
| Release commit | `a9548e7` |
| Release 目录 | `/opt/yingyue/releases/a9548e7` |
| Runtime Jar | `/opt/yingyue/backend/ruoyi-admin.jar` |
| Runtime Jar SHA256 | `04160750cd6baccdf96334c71a5b9147e6560a4502bc11bc9aed09dd5229c89f` |
| Runtime Jar size | `162897574` |
| 部署前备份 | `/opt/yingyue/backups/20260613-171241-pre-a9548e7` |
| DB dump size | `794421` bytes |
| 服务状态 | `active` |

## 本地验证

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest#mobileOrdersShouldMatchDouyinMaskedPhoneWithFullPhone,YyOrderServiceImplTest#clientOrderLinksShouldMatchDouyinMaskedPhoneWithFullPhone,YyOrderServiceImplTest#clientOrderVerifyShouldIssueScopedTokenAndAllowTokenOrderDetailLookup,YyOrderServiceImplTest#clientOrderLinksShouldRequireFullPhoneToAvoidLast4Enumeration" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

结果：`Tests run: 4, Failures: 0, Errors: 0, Skipped: 0`

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

结果：`Tests run: 66, Failures: 0, Errors: 0, Skipped: 0`

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-build-deploy-package.ps1 -OutputDir dist\yingyue-api-deploy-check -Clean -Build
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\verify-yingyue-deploy-package.ps1 -PackageDir dist\yingyue-api-deploy-check -AsJson
```

结果：发布包构建成功，部署包校验 `PASS`，`failureCount=0`。

## 生产验证

生产预检：

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

Webhook challenge：

```text
POST https://api.evanshine.me/api/douyin/life/webhook
返回 {"challenge":"codex-a9548e7-171316"}
```

客户订单查询热修验证：

```text
POST https://api.evanshine.me/client/orders/auth/verify
输入：完整格式手机号 + phoneLast4
返回：code=200，tokenPresent=true，phoneMasked=136****9923，orderCount=4，pickupAvailable=true
```

说明：验证样本来自生产库中已脱敏手机号记录，未在证据中记录完整真实手机号。

## 回滚

后端回滚：

```bash
cp /opt/yingyue/backups/20260613-171241-pre-a9548e7/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```

数据库本次无结构变更。若需要恢复部署前数据，先确认部署后是否产生新订单、新相册、新同步日志，再决定是否使用：

```text
/opt/yingyue/backups/20260613-171241-pre-a9548e7/yingyue_cloud.dump
```
