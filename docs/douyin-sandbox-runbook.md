# 抖音沙盒联调 Runbook

更新日期：2026-06-01

## 结论

你现在这个沙盒小程序信息可以先用来测试 `client_token`。沙盒 AppID 填 `DOUYIN_CLIENT_KEY`，Secret 只填本机环境变量或后台授权账号，不提交到 GitHub。

## 本机环境变量

PowerShell 当前窗口临时生效：

```powershell
$env:DOUYIN_BASE_URL="https://open-sandbox.douyin.com"
$env:DOUYIN_CLIENT_KEY="<沙盒 AppID>"
$env:DOUYIN_CLIENT_SECRET="<沙盒 Secret，不要提交>"
```

后续拿到服务市场参数后再补：

```powershell
$env:DOUYIN_SERVICE_ID="<service_id>"
$env:DOUYIN_SERVICE_MODE_ID="<service_mode_id>"
$env:DOUYIN_TEST_OPEN_ID="<测试用户 open_id>"
```

## 联调顺序

1. 重启后端，让 Java 进程读取新的 `DOUYIN_*` 环境变量。
2. 打开后台页面：`影约云 -> 抖音产品 -> 抖音沙盒接口联调`。
3. 先点 `生成 client_token`。
4. 如果 token 成功，再补 `open_id`、`service_id`、`service_mode_id`。
5. 再点 `查询已购状态`、`查询购买明细`。
6. Webhook 真回调需要公网 HTTPS 域名；本地只能先点 `模拟 webhook` 验证解析逻辑。

本地命令行可直接跑：

```powershell
.\tools\douyin-sandbox-smoke.ps1
```

如果要连同已购状态一起测，再先补 `DOUYIN_TEST_OPEN_ID`、`DOUYIN_SERVICE_ID`、`DOUYIN_SERVICE_MODE_ID`。

## 开放平台还要准备

| 项 | 说明 |
| --- | --- |
| 测试账号 | 沙盒里把测试用户加入白名单，否则购买状态可能返回空 |
| 授权换 open_id | 通过测试用户授权 code 换 `open_id` |
| 服务市场参数 | 平台应用类服务需要 `service_id` 和 `service_mode_id` |
| 服务器域名白名单 | Webhook、H5、接口域名都要按平台要求配置 |
| 回调地址 | 建议正式联调用 `https://你的域名/yy/channel/DOUYIN/webhook` |

## 当前已实现接口

| 本地接口 | 作用 |
| --- | --- |
| `GET /yy/channel/DOUYIN/client-token` | 生成 `client_access_token` |
| `GET /yy/channel/DOUYIN/service-status` | 查询用户是否已购服务 |
| `GET /yy/channel/DOUYIN/purchase-list` | 查询购买明细 |
| `POST /yy/channel/DOUYIN/webhook` | 解析服务市场订单事件 |

## 注意

- 沙盒网关是 `https://open-sandbox.douyin.com`，正式环境才是 `https://open.douyin.com`。
- `Secret`、token、授权凭据不能写进源码、文档截图、Git 提交和普通日志。
- 如果你接的是普通抖音电商店铺订单，不是服务市场平台应用类服务，需要另走电商开放平台接口。
