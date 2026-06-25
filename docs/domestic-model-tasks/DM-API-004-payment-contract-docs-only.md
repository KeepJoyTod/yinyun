> owner: domestic-model-task-DM-API-004-payment-contract-docs-only
> canonical_for: 国产模型整理小程序支付接口文档但不实现真实支付的任务边界
> upstream: docs/contracts/studio-workbench-api-contract-20260615.md, docs\yiyue\callback_map.md
> downstream: future payment implementation plan

# DM-API-004：支付接口文档整理

## 目标

整理微信/H5/抖音小程序自建支付的接口文档和字段清单。当前只做文档，不写真实支付代码。

## 允许修改

```text
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
docs/studio-workbench-preimplementation-solutions-20260615.md
```

## 禁止

- 不实现 `tt.pay`、微信支付、退款、回调验签。
- 不写 fake success。
- 不改 `DOUYIN_LIFE` 支付通知。
- 不读取或输出支付密钥。
- 不执行数据库迁移。

## 必须写清

- `DOUYIN_LIFE`：抖音来客侧支付，影约云只同步支付事实。
- `DOUYIN_MINI_APP`：未来小程序内自建支付，走 `yy_payment_record`。
- 微信/H5：未来自建支付，也走 `yy_payment_record`。
- 工作台只展示支付状态和流水摘要，不提供“手动改已支付”。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-studio-api-contracts.ps1
git diff --check
```

## 交给国产模型时复制

```text
你只做 DM-API-004：支付接口文档整理。
只改文档，不写真实支付代码，不读密钥，不伪造支付成功。

先读：
docs/contracts/studio-workbench-api-contract-20260615.md
docs/domestic-model-tasks/DM-API-004-payment-contract-docs-only.md

完成后运行验证命令，按“结果 / 改动 / 验证 / 风险”回报。
```
