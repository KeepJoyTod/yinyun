# 抖音来客真实验收状态证据 2026-06-13

## 结论

生产环境已具备验收查询能力，但真实开放平台验收仍是 `PENDING_EXTERNAL_ACCEPTANCE`。

原因不是代码未部署，而是还缺 4 个必须由真实抖音来客链路触发或真实 OpenAPI 调用产生的 logid：

| 必填项 | 当前状态 | 下一步 |
| --- | --- | --- |
| 三方码发券 SPI | `PENDING` | 真实下单触发 `/api/douyin/life/tripartite-code/create` |
| 预约创单/支付回调 | `PENDING` | 真实预约或支付触发 `/reservation/order-create` 或 `/reservation/pay-notify` |
| 接单 OpenAPI | `PENDING` | 用真实 `book_id` 调 `/yy/channel/DOUYIN_LIFE/confirm` |
| 整单核销 OpenAPI | `PENDING` | 用真实券码或 `verify_token` 调 `/yy/channel/DOUYIN_LIFE/verify` |

## 验证命令

```powershell
.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>"
```

该脚本只读查询生产 PostgreSQL 容器中的：

- `yy_channel_sync_log`
- `yy_channel_event_inbox`

脚本不打印 SSH 密码、AppSecret、token、完整手机号、完整 openid 或原始 payload。

## 最新结果摘要

| 项 | 结果 |
| --- | --- |
| 状态 | `PENDING_EXTERNAL_ACCEPTANCE` |
| 必填项总数 | `4` |
| 必填项已通过 | `0` |
| 必填项待触发 | `4` |
| 事件收件箱 | `WARNING` |
| 死信事件 | `0` |
| 可重试失败事件 | `2` |

JSON 证据：

```text
docs/evidence/douyin-life-acceptance-status-20260613-172715.json
```

## 判断

当前项目状态仍是 `READY_FOR_EXTERNAL_ACCEPTANCE`：代码、构建、API 域名、客户取片、私有 OSS 和生产部署已经过工具验证；抖音来客还需要真实平台动作完成外部验收。
