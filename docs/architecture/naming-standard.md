# 影约云命名和模块边界规范

> owner: yingyue-naming-module-standard
> canonical_for: 文件命名、模块职责、接口对象命名、跨层命名约定
> upstream: `docs/architecture/three-layer-standard.md`
> downstream: frontend modules, backend modules, docs/contracts, maps

## 命名原则

- 名称必须表达业务概念，不用 `misc`, `common`, `helper`, `manager`, `tmp`, `final` 这类弱名称作为长期公开模块名。
- 一个文件只有一个主要职责。职责说不清时先拆文档，再拆代码。
- 前后端共享业务词汇：订单叫 `Order`，预约时段叫 `BookingSlot`，库存叫 `SlotInventory`，客片叫 `PhotoAlbum`，抖音来客叫 `DouyinLife`。
- 兼容旧入口时可以保留 facade，但必须写明它只是兼容层。

## 前端命名

| 类型 | 命名 | 示例 | 规则 |
| --- | --- | --- | --- |
| 页面 | `XxxView.vue` | `OrdersView.vue` | 只负责编排，不承载大量业务纯函数。 |
| 叶子组件 | `XxxPanel.vue`, `XxxCard.vue`, `XxxTable.vue` | `OrderCancelPanel.vue` | 接收 props、emit events，不直接跨层写数据。 |
| Composable | `useXxx.ts` | `useOrderMutations.ts` | 负责一类状态/行为，可测试，可替换。 |
| 纯函数 | `xxxOperations.ts` | `orderSlotOperations.ts` | 无 UI 副作用，输入输出明确。 |
| API 模块 | `xxxApi.ts` | `ordersApi.ts` | 只负责 HTTP 调用、payload mapping、返回归一化。 |
| Store | `xxxStore.ts` | `ordersStore.ts` | 负责一类 domain state，不做页面布局判断。 |
| Contract test | `Xxx.contract.test.ts` | `OrdersView.slotScope.contract.test.ts` | 锁定跨模块契约，不测私有实现。 |

## 后端命名

| 类型 | 命名 | 示例 | 规则 |
| --- | --- | --- | --- |
| Controller | `YyXxxController` | `YyOrderController` | HTTP 入参/出参、权限、路由，不放复杂业务。 |
| Service 接口 | `IYyXxxService` | `IYyOrderService` | 定义业务能力。 |
| Service 实现 | `YyXxxServiceImpl` | `YyOrderServiceImpl` | 状态机、事务、校验、领域逻辑。 |
| Adapter | `XxxChannelAdapter` | `DouyinLifeChannelAdapter` | 外部平台协议适配。 |
| Resolver/Policy | `XxxResolver`, `XxxPolicy` | `DouyinLifeStoreResolver` | 封装判断规则，不散在 Service 中。 |
| Mapper | `YyXxxMapper` | `YyOrderMapper` | 数据访问，不放业务判断。 |
| Domain | `YyXxx` | `YyOrder` | 数据结构，避免塞流程逻辑。 |

## 文件体积规则

| 文件类型 | 目标 | 迁移期上限 |
| --- | ---: | ---: |
| Vue 页面 | 500 行 | 800 行 |
| Vue 叶子组件 | 350 行 | 500 行 |
| TS helper/composable | 500 行 | 800 行 |
| Store | 600 行 | 900 行 |
| API module | 500 行 | 800 行 |
| Contract test | 800 行 | 1000 行 |

超过迁移期上限时，新增功能前必须先拆 owner。

后端补充口径：

| 文件类型 | 目标 | 迁移期上限 |
| --- | ---: | ---: |
| Java controller/service/channel | 500 行 | 800 行 |
| Java domain/mapper/XML mapper | 500 行 | 800 行 |
| Java test | 800 行 | 1000 行 |

机器检查：

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run check:file-size
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp run check:file-size
node D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\scripts\check-file-size.mjs
node D:\OtherProject\CameraApp\yingyue-cloud-repo\tools\check-file-size-all.mjs
```

实现位置：

- `studio-workbench\scripts\check-file-size.mjs`
- `studio-workbench\src\shared\tooling\fileSizeGuard.contract.test.ts`
- `mobile-uniapp\scripts\check-file-size.mjs`
- `backend\scripts\check-file-size.mjs`
- `tools\file-size-guard-core.mjs`
- `tools\check-file-size-all.mjs`

当前允许通过的超限文件必须在脚本的 `DEFAULT_KNOWN_OVERSIZED_FILES` 中显式登记 owner。新超限文件不得默认放行。

## 工作树和任务包边界

一个任务包必须有明确写入边界。没有写入边界的任务，默认只能读代码和写计划。

| 场景 | 推荐工作区 | 规则 |
| --- | --- | --- |
| 小修/文档/验证 | 当前主工作树 | 只改相关文件，至少跑一条验证命令。 |
| 订单页/API/store 大拆分 | 独立 worktree 或明确任务包 | 每个任务包只碰一个 owner；禁止跨 `OrdersView.vue`、`backend.ts`、`appStore.ts` 同时大改。 |
| 生产紧急修复 | 当前主工作树 | 先修最小链路，再补计划和地图；部署后记录证据。 |
| 国产模型填代码 | 独立任务包 | 给允许文件、禁止文件、契约、验证命令；不让它 `git add .`。 |
| 证据/探针/部署日志整理 | 当前主工作树 | 只追加到 `docs/evidence` 或本地 `yiyue` 地图；不混业务代码。 |

任务包模板：

```text
任务包：<名称>
目标：<一句话>
允许修改：<文件/目录>
禁止修改：<文件/目录>
三层归属：表现层 / 控制逻辑层 / 持久数据层
契约来源：docs/contracts/<feature>-contract.md 或本次 inline 契约
地图更新：code_map / function_map / api_map / optimization_map
验证命令：<可复制命令>
停止条件：<出现什么情况立即停>
```

代码地图区域规则：

- 改用户可见功能：更新 `C:\Users\Administrator\Desktop\yiyue\function_map.md`。
- 改文件 owner、模块拆分、入口位置：更新 `C:\Users\Administrator\Desktop\yiyue\code_map.md`。
- 改 API、DTO、读写表、外部平台调用：更新 `C:\Users\Administrator\Desktop\yiyue\api_map.md`。
- 改计划、风险、债务、优先级：更新 `C:\Users\Administrator\Desktop\yiyue\optimization_map.md`。
- 改简约网对标交互：更新 `C:\Users\Administrator\Desktop\yiyue\jianyue_benchmark_map.md`。

## 三层目录约定

```text
studio-workbench/src/
├── app/                         # 应用入口、路由、权限
├── features/                    # 表现层 + feature-local composables
│   └── orders/
│       ├── OrdersView.vue
│       ├── OrderCancelPanel.vue
│       ├── composables/
│       └── orderSlotOperations.ts
├── shared/api/modules/          # 控制逻辑层：HTTP API facade
├── shared/stores/               # 控制逻辑层：domain state
├── shared/ui/                   # 纯 UI 组件
└── shared/tooling/              # 测试/脚本合同，不进业务运行时
```

```text
backend/ruoyi-modules/ruoyi-yy/src/main/
├── java/org/dromara/yy/controller/     # HTTP 表现入口
├── java/org/dromara/yy/service/        # 控制逻辑层
├── java/org/dromara/yy/channel/        # 第三方平台 adapter
├── java/org/dromara/yy/domain/         # 数据对象
├── java/org/dromara/yy/mapper/         # 持久层接口
└── resources/mapper/yy/                # SQL 映射
```

## 禁止模式

- UI 页面直接复制后端 payload 解析逻辑。
- 多个页面各自实现订单状态流转。
- API module 同时承担 store mutation。
- Store 直接操作 DOM 或 router。
- Mapper/SQL 层判断 UI 文案。
- 把临时证据文件、探针结果、测试 fixture 混入业务模块。
