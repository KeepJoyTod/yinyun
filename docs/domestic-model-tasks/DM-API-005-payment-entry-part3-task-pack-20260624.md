# DM-API-005 Payment Entry Part 3 Task Pack 2026-06-24

## 任务包

- 名称：Part 3 支付成功入口脚手架收敛
- 目标：在既有 `markPaid(...)` 核心之上，补齐微信 notify 成功入口、工作台确认收款入口，以及对应契约/策略/入口 owner 收敛，不扩散到真实微信证书接入、前端联动和退款账本。
- 影响层级：第二层控制逻辑层 + 文档治理层

## 允许修改

- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/**`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/**`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/**`
- `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/controller/**`
- `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/**`
- `docs/contracts/customer-payment-inventory-closed-loop-contract-20260624.md`
- `docs/flows/customer-payment-inventory-closed-loop-flow-20260624.md`
- `docs/superpowers/plans/2026-06-23-customer-payment-inventory-closed-loop.md`

## 禁止触碰

- `mobile-uniapp/**`
- `studio-workbench/**`
- 抖音来客真实平台写入链路
- 香港 2 部署脚本、生产配置、生产库
- 会员、卡券、积分、退款账本
- 真实微信商户证书、真实微信官方回调 wire format 接入

## 数据与平台边界

- 允许写本地后端业务代码与测试代码；不直接写生产库。
- 不调用真实抖音平台。
- 不部署香港 2。
- 微信 notify 仅实现规范化 JSON 输入和本地可测 ack，不承诺真实官方报文格式。
- 所有支付成功事实仍只允许通过 `IYyPaymentService.markPaid(...)` 入账。

## 地图更新

- `docs\yiyue\code_map.md`：本机不存在，无法验证或更新。
- `docs\yiyue\api_map.md`：本机不存在，无法验证或更新。
- `docs\yiyue\liucheng_map.md`：本机不存在，无法验证或更新。
- `docs\yiyue\callback_map.md`：本机不存在，无法验证或更新。
- `docs\yiyue\open_platform_setting_map.md`：本机不存在，无法验证或更新。
- 仓库内替代更新：已更新 `docs/contracts/customer-payment-inventory-closed-loop-contract-20260624.md` 与 `docs/flows/customer-payment-inventory-closed-loop-flow-20260624.md`。

## 工作树约束

- 本次在当前主工作树执行。
- 选择当前主工作树的原因：本轮属于单一任务域下的后端入口/契约收敛，可通过显式任务包隔离范围，并已完成最小验证。
- 当前工作区存在非本任务改动，执行期间未回滚、未清理、未覆盖无关改动。
- 本任务提交时只允许显式 `git add <文件路径>`，禁止 `git add .`。

## 实际改动范围

- 新增微信 notify 入口 owner：`YyWechatPaymentNotifyController`
- 新增工作台确认收款入口 owner：`YyOrderPaymentController`
- 新增策略/解析 owner：
  - `YyOrderPaymentEligibilityPolicy`
  - `YyWechatPaymentNotifySignaturePolicy`
  - `YyWechatPaymentNotifyPayloadParser`
- 收敛入口编排：
  - `YyOrderPaymentEntryServiceImpl`
  - `YyWechatPaymentNotifyServiceImpl`
- 同步契约与数据流文档：
  - payment contract
  - payment flow

## 验证命令

```powershell
cd D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPaymentServiceImplTest,YyWechatPaymentNotifyServiceTest,YyOrderPaymentEntryServiceTest,YyPaymentEntryControllerTest" "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

## 预期结果

- `BUILD SUCCESS`
- `YyPaymentServiceImplTest` 通过
- `YyWechatPaymentNotifyServiceTest` 通过
- `YyOrderPaymentEntryServiceTest` 通过
- `YyPaymentEntryControllerTest` 通过
- 总计 `Tests run: 16, Failures: 0, Errors: 0, Skipped: 0`

## 实际结果

- 已达到预期结果。

## 停止条件

- 若实现需要接入真实微信商户证书或真实官方回调验签，暂停本任务包并另开高风险任务包。
- 若实现需要触碰 `mobile-uniapp`、`studio-workbench`、抖音真实平台或香港 2，暂停本任务包。
- 若发现 `markPaid(...)` 之外存在第二套 paid-entry 写入口，先回到契约层重新收口，再继续实现。
