# order-card-batch-scaffold-contract-20260625

## 1. 用户路径

1. 店员进入工作台 `订单 / 批量开卡`，填写门店、卡项、批次数量、目标人群和审批原因。
2. 点击“提交审批申请”后，前端调用 `POST /yy/card-batch-orders`。
3. 后端不直接创建真实卡项订单，只创建一条 `yy_risk_approval` 申请，`businessType=CARD_BATCH_ORDER_APPLY`。
4. 页面刷新后通过 `GET /yy/card-batch-orders` 查看最近申请、审批状态和预估金额。

## 2. 表现层

- 页面：`/order/card-batch`
- 入口：`featureKey=order-card-batch`
- 权限：`yy:order:add`
- 状态：`building`
- 成功态：显示申请号、审批状态、预估总额和审批说明
- 失败态：展示接口错误，不伪造批量订单成功

## 3. 控制逻辑层

### 3.1 `GET /yy/card-batch-orders`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `storeId` | `Long` | 否 | 门店过滤 |
| `status` | `String` | 否 | `PENDING/APPROVED/REJECTED` |
| `keyword` | `String` | 否 | 标题/申请号/原因 |
| `limit` | `Integer` | 否 | 默认 `20`，最大 `100` |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `Long` | 审批单 ID |
| `batchNo` | `String` | 批量开卡申请号 |
| `title` | `String` | 申请标题 |
| `status` | `String` | 审批状态 |
| `cardName` | `String` | 卡项名称 |
| `cardType` | `String` | 卡项类型 |
| `batchCount` | `Integer` | 批量数量 |
| `targetCustomerCount` | `Integer` | 目标客户数 |
| `unitPriceCent` | `Long` | 单价（分） |
| `estimatedTotalCent` | `Long` | 预估总额（分） |
| `targetAudience` | `String` | 目标人群 |
| `channelPolicy` | `String` | 执行策略 |
| `resultSummary` | `String` | 审批结果摘要 |

### 3.2 `POST /yy/card-batch-orders`

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `storeId` | `Long` | 是 | 门店 ID |
| `batchTitle` | `String` | 否 | 申请标题 |
| `cardName` | `String` | 是 | 卡项名称 |
| `cardType` | `String` | 否 | 默认 `TIMES_CARD` |
| `batchCount` | `Integer` | 是 | 批量数量 |
| `targetCustomerCount` | `Integer` | 否 | 目标客户数 |
| `unitPriceCent` | `Long` | 否 | 单价（分） |
| `targetAudience` | `String` | 否 | 目标人群 |
| `channelPolicy` | `String` | 否 | 执行策略 |
| `reason` | `String` | 是 | 审批原因 |
| `remark` | `String` | 否 | 备注 |

行为边界：

- 只创建 `yy_risk_approval` 申请。
- `businessId` 暂不绑定真实订单。
- `payloadJson` 保存批次元数据，供前端 owner 和后续闭环复用。

## 4. 持久数据层

- 读写表：`yy_risk_approval`
- 不新增批量卡项订单表
- 不创建真实卡项实例、权益账本、余额账本或支付账本

## 5. 错误与幂等

- 校验失败直接返回参数错误
- `RepeatSubmit` 防止连续重复提交
- 审批状态仍复用统一 `PENDING/APPROVED/REJECTED`

## 6. 验证命令

```powershell
npm --prefix studio-workbench run test -- src/features/orders/card-batch/OrderCardBatchView.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/shared/api/backend.contract.test.ts
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dtest=YyCardBatchOrderServiceImplTest,YyRiskApprovalServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```
