# photoshop-master 前端优化参考地图

日期：2026-06-09

## 结论

`photoshop-master` 是影楼管理后台参考项目。它最值得吸收的是运营后台 UI、在线选片链接、相册管理、预约排期和订单看板体验；不直接替换影约云的 RuoYi admin-ui 和 Spring Boot 主后端。

| 项 | 值 |
| --- | --- |
| 项目路径 | `D:\OtherProject\CameraApp\photoshop-master` |
| 桌面副本 | `C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master` |
| 前端 | `frontend`，Vue 3 + Vite + TypeScript + Tailwind v4 + Radix Vue + lucide-vue-next |
| 后端 | `backend`，Spring Boot + MyBatis Plus + Flyway + MinIO demo |
| 重点参考 | 在线选片、相册运营、日程、订单、门店、财务 |

## 前端代码地图

| 功能 | 代码位置 | 可吸收点 |
| --- | --- | --- |
| 路由 | `frontend/src/app/router/index.ts` | 功能分组：主控台、客片中心、系统 |
| 全局布局 | `frontend/src/shared/components/layout/*` | 侧栏、顶栏、页面标题层级 |
| 主控台 | `frontend/src/features/dashboard/DashboardView.vue` | 指标卡片、趋势图 |
| 预约订单 | `frontend/src/features/orders/OrdersView.vue` | 状态列表、筛选、操作区 |
| 日程管理 | `frontend/src/features/schedule/ScheduleView.vue` | 档期和预约时段可视化 |
| 门店管理 | `frontend/src/features/stores/StoreView.vue` | 门店运营字段 |
| 套系配置 | `frontend/src/features/products/ProductConfigView.vue` | 商品/套餐/选片配置 |
| 选片配置弹窗 | `frontend/src/features/products/components/SelectionConfigModal.vue` | 精修张数、加片规则、价格配置 |
| 客片管理 | `frontend/src/features/albums/PhotoMgmtView.vue` | 相册上传、照片管理、客户关联 |
| 在线选片 | `frontend/src/features/selection/OnlineSelectionView.vue` | 选片链接、二维码、有效期、状态统计 |
| 财务 | `frontend/src/features/finance/FinanceView.vue` | 后续结算看板参考 |
| API 封装 | `frontend/src/shared/api/*` | 请求层和 demo 数据隔离 |
| 设计 token | `frontend/src/style.css` | 后台色彩、字体、边框、背景参考 |
| Vite 代理 | `frontend/vite.config.ts` | `/api` 和 `/actuator` 代理到本地后端，只作参考 |

## 后端代码地图

| 模块 | 代码位置 | 对应影约云方向 |
| --- | --- | --- |
| 相册 | `backend/src/main/java/com/amberstudio/album/*` | `yy_photo_album` / `yy_photo_asset` |
| 在线选片 | `backend/src/main/java/com/amberstudio/selection/*` | 选片链接、客户选择、统计 |
| 文件存储 | `backend/src/main/java/com/amberstudio/file/*` | RuoYi OSS / 私有 OSS 签名 |
| 订单 | `backend/src/main/java/com/amberstudio/order/*` | 订单到相册联动 |
| 日程 | `backend/src/main/java/com/amberstudio/schedule/*` | 预约库存和时段 |
| 门店 | `backend/src/main/java/com/amberstudio/store/*` | 门店维度运营 |
| 操作日志 | `backend/src/main/java/com/amberstudio/operation/*` | 访问审计和后台操作审计 |

## UI 设计吸收方向

Reading this as: 影楼/摄影 SaaS 后台，面向运营人员和店长，应该是安静、高密度、可排障的工作台，而不是营销落地页。

| 模块 | 当前主项目方向 | 从参考项目吸收 |
| --- | --- | --- |
| 相册管理 | 已有上传、底片、访问日志 | 上传结果状态、相册-照片-选片链接一屏排障 |
| 在线选片 | 目前主要是取片/下载 | 链接、二维码、有效期、访问次数、选片进度 |
| 订单页 | 已接抖音订单/渠道订单 | 订单状态卡片、客户信息、相册排障入口 |
| 日程库存 | 偏接口联调 | 时段板、可用库存、预约冲突提示 |
| 主控台 | 待增强 | 今日订单、待处理退款、待上传相册、失败访问 |

## 深度扫描补充

| 模块 | 发现 | 处理 |
| --- | --- | --- |
| 布局 | 深色侧边栏、半透明顶栏、内容区滚动 | 可参考信息层级，不整包复制 |
| 视觉 | 琥珀色 token、细边框、低饱和背景、极小圆角 | 可转译成 Element Plus 风格，避免单一棕色主题 |
| 订单筛选 | 搜索、多下拉、高级筛选、日期范围、金额汇总 | 优先吸收到订单排障页 |
| 在线选片 | 产品配置、上传、生成链接、二维码、加片统计闭环清晰 | 已落地最小选片，后续补规则和统计 |
| 代码风险 | 大量固定像素尺寸、本地样例数据、localhost 代理、`appStore.ts` 耦合 API/DTO | 不直接迁移 |

## P0 优化计划

1. 订单页“取片排障”从提示升级为真实跳转：
   - 按订单号跳到相册 tab。
   - 按手机号跳到访问审计 tab。
2. 相册管理页增加“运营排障视图”：
   - 相册有效期、手机号、取片码状态、照片数、最近访问失败原因。
3. 后台上传弹窗补强：
   - 单图/多图成功数。
   - OSS 上传成功但底片创建失败的重试入口。
   - 展示 `objectKey`，便于确认私有 OSS 对象。

## P1 优化计划

1. 增加在线选片链接模型：
   - 相册生成选片链接。
   - 链接有效期。
   - 客户选片提交状态。
   - 后台二维码复制。
2. 客户端增加“选择照片”模式：
   - 只对特定相册开放。
   - 支持最多可选张数。
   - 提交后后台可见。
3. 日程/预约面板运营化：
   - 抖音库存与门店时段同屏。
   - 库存失败、接单失败、退款待审核集中展示。

## P2 优化计划

- 财务/加片收入看板。
- 门店、套系、活动运营页。
- 客户生命周期：预约、拍摄、上传、选片、精修、交付。

## 不吸收清单

- 不引入 Tailwind v4 / Radix Vue 到 RuoYi admin-ui 作为新体系。
- 不迁移 MinIO demo 文件服务，正式仍用阿里云 OSS 私有桶。
- 不迁移 demo 后端账本。
- 不把参考项目的视觉比例原样搬到表格型后台；只吸收信息结构和状态表达。
- 不迁移 `.env`、本地代理、Demo 账号、固定人员展示数据。
- 不照搬像素级硬编码尺寸，正式后台需响应式和可维护。

## 验证建议

```powershell
cd D:\OtherProject\CameraApp\photoshop-master\frontend
npm run build
```

```powershell
cd D:\OtherProject\CameraApp\photoshop-master\backend
mvn test
```

这些命令用于确认参考项目能否作为后续对照，不作为影约云正式验收。
