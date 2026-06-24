# Studio Workbench P0 Correctness Refactor Design

> owner: studio-workbench-p0-correctness
> canonical_for: 门店工作台 ID、订单查询范围、页面数据加载与创建后状态一致性
> upstream: `studio-workbench/src/shared/api/backend.ts`, `studio-workbench/src/shared/stores/appStore.ts`
> downstream: 订单、会员、报表、相册、员工与客户页面

## 目标

在不改变现有界面和业务入口的前提下，消除四类会产生错误数据或错误关联的风险：

1. 19 位雪花 ID 被 JavaScript `number` 截断。
2. 月报、渠道和财务报表误用“今日到店订单”集合。
3. 会员和报表页面进入时没有加载客户、员工等依赖数据。
4. 创建接口成功后使用 `Date.now()` 伪造后端 ID。

## 设计

### ID 边界

- 新增统一 `BackendId = string` 类型与 `normalizeBackendId` 转换函数。
- API DTO、请求载荷、工作台状态中的业务主键统一使用 `BackendId`。
- 后端返回的 ID 在 mapper 边界立即转成字符串；比较统一使用字符串语义。
- 演示数据允许以短数字书写，但进入状态前必须归一化为字符串。
- 正式 Spring Boot 接口必须将雪花 ID 序列化为 JSON 字符串；前端无法恢复已经被 JSON 数字解析损坏的 ID。

### 订单查询

- `listTodayOrders()` 只服务首页、今日排期和每日处理视图。
- `listOrders(query)` 接受明确的时间、门店、渠道、状态和分页条件。
- 报表页面按模块加载所需范围；月报默认当前月，渠道/财务/转化默认当前月，不再复用今日订单缓存冒充完整数据。
- 报表订单单独保存，不覆盖每日运营页的今日订单集合。

### 页面数据生命周期

- `ensureCustomersLoaded()`、`ensureEmployeesLoaded()` 和 `ensureReportDataLoaded()` 提供幂等加载。
- 会员页挂载时加载客户；消费记录同时加载报表订单。
- 员工报表加载员工和相册，客户报表加载客户，其余经营报表加载范围订单。
- 加载失败保留真实错误状态，不注入演示数据。

### 创建结果

- 创建 API 优先读取服务端返回 DTO。
- 对暂时只返回成功状态的接口，创建后重新加载对应列表并以业务字段定位新记录。
- 不再把 `Date.now()` 当作正式后端主键。
- 演示模式仍可生成本地临时 ID，但必须带 `demo-` 前缀，避免与正式主键混淆。

## 非目标

- 本轮不重写 Vue 状态管理方案。
- 本轮不拆分全部大文件，不改变页面视觉。
- 本轮不新增第二套订单、会员或报表账本。
- 本轮不改动抖音、微信支付和客户取片协议。

## 验收

- 19 位 ID 从 API mapper 到路由参数、比较和请求路径保持完全一致。
- 今日订单与报表订单查询互不污染。
- 直接打开会员、员工业绩、客户分析等页面可自动加载依赖数据。
- 正式 API 模式下创建记录后使用服务端权威 ID。
- `npm test` 与 `npm run build` 通过。
