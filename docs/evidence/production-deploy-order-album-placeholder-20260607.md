# 抖音订单自动创建取片相册生产部署证据 2026-06-07

## 结论

`DOUYIN_LIFE` 订单落库后自动创建客户取片相册占位的后端包已部署到香港2生产 API 服务，`https://api.evanshine.me` 预检通过。该能力用于把抖音来客订单、预约创单、支付通知同步到本地订单后，自动沉淀到 `yy_photo_album`，后续后台上传客片即可让客户通过手机号 + 取片码进入相册。

## 变更范围

| 项 | 结果 |
| --- | --- |
| 核心后端 | `DouyinLifeChannelAdapter` |
| 自动建相册条件 | 抖音外部订单号、门店、手机号齐全 |
| 幂等键 | `channel_type=DOUYIN_LIFE + douyin_order_id + del_flag=0` |
| 默认相册状态 | `status=ACTIVE`、`selection_status=WAITING` |
| 默认取片码 | `PICK-` + 稳定 8 位码 |
| 默认有效期 | 创建时起 30 天 |
| 边界处理 | 缺手机号或门店时只同步订单，不创建相册 |
| Webhook challenge | 返回 `application/json`，形如 `{"challenge": 原值}` |
| 后台验收 | 新增开放平台验收用例与最近 logid 聚合接口和联调页卡片 |

## 本地验证

命令：

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dtest=DouyinLifeChannelAdapterTest,YyChannelSyncLogServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn -pl ruoyi-admin -am -DskipTests package
git diff --check
.\tools\run-douyin-life-spi-public-smoke.ps1
npm run build:dev
npm run build:mp-toutiao
npm run build:mp-weixin
```

结果：

| 验证 | 结果 |
| --- | --- |
| 后端定向测试 | 最新回归 `26 tests, 0 failures, 0 errors` |
| 后端打包 | BUILD SUCCESS |
| Diff 检查 | 无 whitespace error；仅 Git LF/CRLF 提示 |
| 公网 SPI smoke | `webhook-challenge` 返回 200 JSON OK |
| 后台前端构建 | `admin-ui` `build:dev` 成功 |
| 抖音小程序构建 | `mobile-uniapp` `build:mp-toutiao` 成功 |
| 微信小程序构建 | `mobile-uniapp` `build:mp-weixin` 成功 |

## 生产部署

| 项 | 结果 |
| --- | --- |
| 服务器 | 香港2 `103.24.216.8` |
| 服务 | `yingyue-admin` |
| 目标 Jar | `/opt/yingyue/backend/ruoyi-admin.jar` |
| 备份 Jar | `/opt/yingyue/backups/ruoyi-admin.jar.20260607_194722` |
| 应用监听 | `127.0.0.1:8080` |
| 启动时间 | `2026-06-07 19:47:57` |
| 生产域名 | `https://api.evanshine.me` |

部署后服务状态：

```text
yingyue-admin active
Spring Boot started successfully
OSS config initialized
```

## 生产预检

命令：

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

结果：

| 项 | 结果 |
| --- | --- |
| 缺签名 SPI | 正确拒绝，`error_code=9999` |
| 生产预检 | passed |
| 日志抽查 | `/api/douyin/life/order/query` 请求进入 Spring Boot，耗时约 241ms |

说明：服务重启窗口内曾短暂出现 502；应用完全启动后重试通过，属于重启期间的临时现象。

## 回滚点

如需回滚本次后端包，可使用生产备份：

```text
/opt/yingyue/backups/ruoyi-admin.jar.20260607_194722
```

回滚后需要重启：

```text
systemctl restart yingyue-admin
```

## 后续验收

| 项 | 下一步 |
| --- | --- |
| 抖音开放平台 | SPI/Webhook 地址统一填 `https://api.evanshine.me/api/douyin/life/*` |
| 真实订单 | 触发 `reservation/order-create` 或订单查询同步，确认 `yy_photo_album` 自动出现 |
| 后台客片 | 在自动创建的相册上传照片到私有 OSS |
| 客户取片 | H5/微信/抖音小程序使用 `/client/photo/*` 验证手机号 + 取片码进入相册 |

2026-06-07 21:50 更新：已用指定抖音订单完成生产同步，`SyncStatus=SYNCED`、`Total=1`、`Created=1`、`Failed=0`，同步 logid `202606072150269EF6B8106858BB7611D2`。生产审计确认出现 1 个 `DOUYIN_LIFE` 相册占位。详见 `docs/evidence/douyin-life-order-sync-album-placeholder-20260607.md`。
