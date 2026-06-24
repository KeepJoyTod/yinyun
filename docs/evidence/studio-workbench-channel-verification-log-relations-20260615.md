# Studio Workbench 渠道验收日志关联证据

日期：2026-06-15

## 结论

本切片收口 T05 日志/渠道排障：`/order/verification` 现在会把抖音来客验收用例和最近 `DOUYIN_LIFE` 渠道日志关联起来。

保持的边界：

- 只展示和复制排障证据，不在门店工作台直接执行真实核销。
- `DOUYIN_LIFE` 和其他渠道日志分开匹配，不混用 `DOUYIN_MINI_APP` 或微信日志。
- 精确 `logid/requestId` 匹配优先；没有精确 logid 时，只按接口类别展示最近候选日志。
- 订单号、商品 ID、account_id、POI 都不当作 logid。

## 改动范围

- `studio-workbench/src/features/orders/channelVerificationOperations.ts`
  - 新增验收用例通过状态判断。
  - 新增验收用例到最近渠道日志的关联规则。
  - 新增可复制的排障包文本。
  - 日志类别判断优先使用 `apiName`，只有 API 路径无法识别时才参考备注和错误信息，避免 `order/query` 被中文备注误判为整单核销。

- `studio-workbench/src/features/orders/channelVerificationOperations.test.ts`
  - 覆盖通过状态识别。
  - 覆盖精确 logid 优先于接口候选。
  - 覆盖无 logid 时按同接口类别匹配最近 `DOUYIN_LIFE` 日志。
  - 覆盖复制排障包包含验收用例和匹配日志证据。

- `studio-workbench/src/features/orders/ChannelVerificationView.vue`
  - 验收用例列表展示“已匹配 logid / 按接口匹配最近日志 / 未匹配日志”。
  - 详情栏展示日志匹配说明、候选日志接口、候选 requestId 和错误/备注。
  - 新增“复制排障包”按钮，便于平台或后端排障交接。

- `studio-workbench/src/features/orders/ChannelVerificationView.contract.test.ts`
  - 锁定页面必须使用共享关联 helper。
  - 锁定页面必须提供“复制排障包”和“日志匹配”入口。

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- channelVerificationOperations.test.ts
```

结果：

```text
Test Files 1 failed (1)
Tests 1 failed, 3 passed
失败点：
- uses a same-api DOUYIN_LIFE candidate when the acceptance case has no logid yet
- expected related log backendId `verify`
- received `order-query`
```

原因：

```text
resolveLogCategory() 把 apiName、remark、errorMessage 混在一起分类。
测试中的 order-query 日志带了默认 remark=整单核销验收，导致它被误判为 verify。
```

### GREEN

命令：

```powershell
npm test -- channelVerificationOperations.test.ts
```

结果：

```text
Test Files 1 passed (1)
Tests 4 passed (4)
```

### 定向回归

命令：

```powershell
npm test -- channelVerificationOperations.test.ts ChannelVerificationView.contract.test.ts LogsView.contract.test.ts logsOperations.test.ts
```

结果：

```text
Test Files 4 passed (4)
Tests 22 passed (22)
```

### 全量测试

命令：

```powershell
npm test
```

结果：

```text
Test Files 70 passed (70)
Tests 373 passed (373)
```

### 构建

命令：

```powershell
npm run build
```

结果：

```text
vue-tsc -b && vite build
2830 modules transformed
✓ built in 2.83s
```

### Diff 检查

命令：

```powershell
git diff --check
```

结果：

```text
passed；仅有 Windows LF/CRLF 提示，无空白错误。
```

### 本地浏览器 smoke

目标：

```text
http://localhost:5190/order/verification
```

结果：

```json
{
  "hasHeading": true,
  "hasCopyPackage": true,
  "hasLogMatch": true,
  "hasAcceptance": true,
  "consoleErrors": 0
}
```

## 剩余风险

- 线上真实 API 模式仍需要已登录员工会话验证 `/yy/channel/DOUYIN_LIFE/acceptance-cases`、`/sync-health` 和 `/yy/channelSyncLog/list` 的生产返回。
- 抖音来客真实平台验收仍依赖真实发券、创单/支付、接单和核销 logid。
- 真实核销动作仍不在门店工作台开放；需要管理员权限、订单归属校验、门店校验和幂等核销审计后再启用。
