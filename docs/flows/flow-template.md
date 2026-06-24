# 影约云 Mermaid 数据流模板

> owner: yingyue-flow-template
> canonical_for: 开工前数据流图、三层调用路线、错误路径表达
> upstream: `docs/architecture/three-layer-standard.md`
> downstream: feature flow docs, implementation plans, handoff docs

## 使用规则

当用户说“先不要写代码，先画路线图/数据流/模块怎么配合”时，使用本模板。功能复杂时同时写 `docs/contracts/<feature>-contract.md`。

## 标准三层流程图

```mermaid
flowchart TD
  A["用户动作\n点击/输入/上传"] --> B["表现层\nView/Component"]
  B --> C["前端控制逻辑\nComposable/Store"]
  C --> D["前端 API Module\nDTO mapping"]
  D --> E["后端 Controller\n权限/参数"]
  E --> F["后端 Service\n业务规则/状态机/事务"]
  F --> G["Adapter/Policy/Resolver\n外部平台或规则"]
  F --> H["持久数据层\nDB/Mapper/Object Storage"]
  H --> F
  G --> F
  F --> E
  E --> D
  D --> C
  C --> B
  B --> I["用户反馈\n成功/失败/加载/空态"]
```

## 标准时序图

```mermaid
sequenceDiagram
  actor User as 用户
  participant View as 表现层
  participant Logic as 前端控制逻辑
  participant Api as API Module
  participant Controller as Backend Controller
  participant Service as Backend Service
  participant Data as 持久数据层

  User->>View: 触发动作
  View->>Logic: submit(input)
  Logic->>Logic: validate input
  Logic->>Api: call(dto)
  Api->>Controller: HTTP request
  Controller->>Service: command
  Service->>Data: read current state
  Data-->>Service: current state
  Service->>Service: apply business rule
  Service->>Data: write result
  Data-->>Service: persisted result
  Service-->>Controller: result
  Controller-->>Api: response
  Api-->>Logic: normalized result
  Logic-->>View: update state
  View-->>User: render feedback
```

## 错误路径模板

```mermaid
flowchart TD
  Start["用户提交"] --> Validate["前端校验"]
  Validate -->|失败| UIError["表现层显示字段错误"]
  Validate -->|通过| Request["请求后端"]
  Request --> Auth["后端权限/门店范围校验"]
  Auth -->|失败| PermissionError["返回无权限\nUI 显示不可操作"]
  Auth -->|通过| Business["业务规则校验"]
  Business -->|失败| BusinessError["返回业务错误\nUI 可重试/引导处理"]
  Business -->|通过| Persist["持久化"]
  Persist -->|失败| SystemError["返回系统错误\n记录日志/可重试"]
  Persist -->|成功| Success["返回成功\n刷新列表/详情/日志"]
```

## 影约云关键字段标注要求

每张图必须标出：

- `storeId` 是否为真实 `yy_store.id`。
- 订单 ID 使用前端展示 ID 还是后端 `yy_order.id`。
- 是否读写 `yy_booking_slot_inventory`。
- 是否触发外部平台 `DOUYIN_LIFE`。
- 是否需要 `logid/requestId` 证据。
- 是否可能写生产数据。

## 输出要求

图下面必须附：

| 项 | 内容 |
| --- | --- |
| 写库表 | 表名和字段 |
| 读接口 | 接口路径或 API module |
| 写接口 | 接口路径或 API module |
| 空态 | UI 如何显示 |
| 加载态 | UI 如何显示 |
| 失败态 | UI 如何显示 |
| 验证 | 命令、smoke、证据路径 |
