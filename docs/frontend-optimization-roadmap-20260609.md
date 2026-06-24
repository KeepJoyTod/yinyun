# 前端优化参考吸收路线图

日期：2026-06-09

## 结果

`photoshop-master` 作为影楼后台 UI 和运营流程参考，不进入正式运行链路。正式后台仍是：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
```

## 可吸收模块

| 模块 | 参考位置 | 正式落点 | 优先级 |
| --- | --- | --- | --- |
| 相册管理 | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | P0 |
| 在线选片 | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | 后台相册页 + 客户取片端 | P1 |
| 预约档期 | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | 抖音预约库存运营页 | P1 |
| 订单状态 | `photoshop-master/frontend/src/features/orders/OrdersView.vue` | `admin-ui/src/views/yy/order/index.vue` | P1 |
| 仪表盘 | `photoshop-master/frontend/src/features/dashboard/DashboardView.vue` | 影约云运营首页 | P2 |
| 财务看板 | `photoshop-master/frontend/src/features/finance/FinanceView.vue` | 后续结算报表 | P2 |

说明：迁入到 `studio-workbench/src/features/customers`、`finance`、`packages` 的同名页面当前只是标题级参考残留，未接入正式路由；不要把它们作为 P0/P1 验收缺口。

## 不吸收内容

- 不引入 Tailwind v4 / Radix Vue 作为 RuoYi admin 新组件体系。
- 不迁移 `photoshop-master/backend` 的 MinIO demo 存储。
- 不迁移 demo 订单、用户、财务账本。
- 不把长期图片直链用于客户取片。

## P0 优化计划

| 任务 | 具体动作 | 验收 |
| --- | --- | --- |
| 上传结果可诊断 | 后台上传弹窗展示每张图的 OSS 状态、建底片状态、失败原因 | 上传失败能知道卡在 OSS 还是 `yy_photo_asset` |
| 底片排障字段 | 底片列表/图库展示 `objectKey`、`visible`、`fileUrl` | 能快速判断数据库记录和 OSS 对象是否对应 |
| 访问审计入口 | 相册、底片、订单都能跳到访问审计过滤 | 能查客户为什么看不到图 |
| 空状态质感 | 客户端空相册、无权限、过期、图片失败要有清晰下一步 | 无白屏，无 404，无技术词 |
| 相册交付提醒 | 客户相册列表展示预览、下载、延期/重新授权说明和门店协助入口 | 客户进入相册前知道下一步，不误解为公开网盘 |
| 相册空态恢复 | 客户相册列表为空时提供换手机号、预约拍摄、拨打门店电话 | 客户知道该换账号、重新预约还是找门店核对 |
| 详情空照片恢复 | 相册详情无照片时提供刷新、返回列表、拨打门店电话 | 门店还未上传时客户有下一步 |
| 客服入口统一 | 客户电脑网页端预约和取片页面统一使用 `customerSupport.ts` 管理门店名、电话和联系说明 | 后续换真实门店电话、客服二维码不用逐页搜索 |

## P1 优化计划

| 任务 | 具体动作 | 验收 |
| --- | --- | --- |
| 在线选片链接 | 后台相册生成选片链接、二维码、有效期 | 链接可复制，过期后不可访问 |
| 客户选片模式 | 客户在相册里勾选照片并提交 | 后台能看到已选照片和提交时间 |
| 订单排障摘要 | 订单详情展示相册数、可见照片数、最近失败访问 | 运营不用切多个页面也能初判 |
| 档期可视化 | 抖音预约库存按日期/时段展示 | 能看容量、已约、失败原因 |

## P2 优化计划

| 任务 | 具体动作 | 验收 |
| --- | --- | --- |
| 运营首页 | 聚合今日订单、待上传相册、退款待审核、访问失败 | 打开后台先看到待办 |
| 加片/精修流程 | 选片后进入加片、精修、交付状态 | 客户生命周期完整 |
| 财务报表 | 统计订单、退款、加片收入 | 与订单/核销数据一致 |

## UI 原则

- 后台是运营工具，保持高密度、可扫描、少装饰。
- 客户端是交付体验，强调安全感、照片可见性、错误下一步。
- 不展示服务器端口、OSS 管理地址、后台路径、长期图片 URL。
- 所有按钮必须有加载、禁用、失败状态。

## 2026-06-11 门店工作台 UI 吸收记录

| 页面 | 本轮结果 | 验收重点 |
| --- | --- | --- |
| `studio-workbench /login` | 增加员工工作范围、门店管理员角色、登录后进入主控台和员工入口安全边界 | 店员能分清这是工作台入口，不是客户预约/取片入口 |
| `studio-workbench /` | 主控台增加今日运营看板：今日待拍、待上传、待选片、待交付 | 店员进首页先看到当天拍摄、上传、选片、交付四类待办 |
| `studio-workbench /orders` | 预约订单增加门店订单处理顺序、今日到店/待确认/待拍摄/选片跟进指标和快捷筛选 | 店员不用只看表格，能先处理今日到店、待确认和选片跟进 |
| `studio-workbench /schedule` | 日程管理增加今日排期承接看板、今日预约/待确认/已占用/可接待指标和待确认/已确认快捷筛选 | 店员能先确认未确认时段，再判断工位是否还能加约 |
| `studio-workbench /store` | 门店管理增加门店承接概况、门店总数/营业中/待服务单/本月订单指标和门店快捷筛选 | 店员能先看有待服务门店，再确认营业中和预约制门店 |
| `studio-workbench /store` | 清理待服务单操作卡占位 scope，从占位标记改为 `SERVICE` | 后续扫描不再把正式门店页误判为未完成 |
| `studio-workbench /config` | 在线选片配置增加产品配置承接、在售/待补规则/加片营收/平均加片指标和产品快捷筛选 | 店员能先补齐选片规则，再决定产品上架、下架或继续运营 |
| `studio-workbench /photo-mgmt` | 增加相册摘要、当前动作建议、客户联系、选片进度；照片卡增加 `Selected / Pending / Picked` 状态；新增批量选择工具栏和缩略图加载/失败态 | 门店员工一眼知道该上传、发链接、跟进选片还是归档，并能批量整理已选精修片 |
| `studio-workbench /online-selection` | 增加今日交付动作看板、临期/已选统计、链接复制反馈、二维码下载反馈 | 选片链接不是只有表格，能直接用于客户沟通 |
| `studio-workbench /settings` | 系统设置增加工作台安全与运行状态、员工会话、接口模式、客户取片隔离、可运营数据和入口边界说明 | 店员能分清员工入口、客户官网、小程序和后端 API 的边界 |
| 响应式 | 客片页左右布局在窄屏折叠，在线选片表格改为横向滚动容器 | 小屏笔记本不出现不可控挤压 |

这轮只优化 `studio-workbench` 的门店工作台演示/工作台体验，不改 `admin-ui` 的 RuoYi 管理后台，不改后端接口。

## 2026-06-11 客户电脑网页首页吸收记录

| 页面 | 本轮结果 | 验收重点 |
| --- | --- | --- |
| `client-web /` | 首页新增“PHOTO PACKAGES”套餐选择区，展示证件照精修、形象照拍摄、家庭纪念照 | 客户进入官网后能先理解可预约服务，再进入预约表单 |
| `client-web /` | 首页新增“PRIVATE DELIVERY”样片交付区，说明照片私有存储、手机号/取片码校验、短期预览链接和原图下载授权 | 客户能理解取片不是公开网盘或长期直链 |
| `client-web /booking` | 预约页新增选中套餐说明、到店前准备和门店联系方式 | 客户提交预约前能确认服务内容、准备事项和门店联系入口 |
| `client-web /customer/result` | 结果页新增处理建议和门店协助卡片 | 客户遇到错误取片码、无权限、过期或系统异常时不会停在死路 |
| `client-web /customer/albums` | 相册列表新增交付提醒服务区和联系门店协助卡 | 客户进入相册前知道预览、下载、延期/重新授权的处理路径 |
| `client-web /customer/albums` | 空相册状态新增换手机号登录、预约拍摄、拨打门店电话 | 无相册时客户不会只看到一句说明 |
| `client-web /customer/albums/:albumId` | 照片未上传状态新增刷新照片目录、返回相册列表、拨打门店电话 | 相册已开通但照片未上传时客户有清晰处理路径 |
| `client-web shared` | 新增 `customerSupport.ts` 和契约测试，清理客户取片页、预约页和预约成功页硬编码门店名/电话 | 联系入口可维护，移动端无按钮溢出 |
| 响应式 | 桌面 `1280` 宽和移动 `390` 宽均无横向溢出，控制台无 error/warn | 客户电脑网页端可用于展示和继续联调 |

这轮优化的是 `client-web` 客户电脑网页端，不改小程序 `mobile-uniapp`，不改门店工作台 `studio-workbench`，不改系统后台 `admin-ui`。

## 2026-06-11 系统管理后台订单运营页吸收记录

| 页面 | 本轮结果 | 验收重点 |
| --- | --- | --- |
| `admin-ui /yy/order` | 首屏增加“交付处理顺序”：先同步订单、再筛不可交付、最后发取片入口 | 运营进订单页就知道先拉抖音订单、再处理缺手机号/无相册/无照片/缺 Key，最后上传照片或复制取片说明 |
| 动作复用 | 复用现有 `syncDouyinOrders(1)`、`showPhotoDeliveryIssues`、订单行 `copyOrderPickupShareText` | 不新增接口，不改变订单/相册业务链路 |
| 响应式 | 动作步骤桌面三列、窄屏两列/一列折叠 | 小屏后台也能看清处理顺序 |

这轮优化的是 `admin-ui` 的系统管理后台订单运营页，用于平台/运营排障；门店员工日常工作台仍看 `studio-workbench`，客户取片仍看 `mobile-uniapp` / `client-web`。

## 2026-06-11 系统管理后台相册工作台吸收记录

| 页面 | 本轮结果 | 验收重点 |
| --- | --- | --- |
| `admin-ui /yy/photo` | 相册工作台抽屉增加“本相册待处理清单” | 打开单个相册即可看到缺手机号、缺取片码、相册过期、无可见照片、缺 OSS Key、最近访问失败 |
| 动作复用 | 每个待处理项复用 `handleAlbumOperationAction` 分发到编辑相册、上传照片、查看缺 Key、查看审计 | 不新增接口，不绕过后台权限，不改变相册/底片/审计数据链路 |
| 空状态 | 无阻塞时显示可交付说明 | 运营能明确知道可以复制取片入口发给客户 |

这轮优化的是 `admin-ui` 的系统管理后台相册排障抽屉，用于平台/运营快速判断“为什么客户看不到图”；客户取片端和门店工作台不受影响。

## 2026-06-11 系统管理后台抖音来客页吸收记录

| 页面 | 本轮结果 | 验收重点 |
| --- | --- | --- |
| `admin-ui /yy/channel/life` | 真实下单入口配置区增加“P0 来客商品页支付 / 先同步后导出 / P1 小程序 tt.pay”三段操作引导 | 运营不会把 `DOUYIN_LIFE` 来客商品页支付和 `DOUYIN_MINI_APP` 小程序内支付混在一起 |
| 动作复用 | “复制首个入口”复用 `landingUrl/landingPath`；“同步近24小时”复用 `syncRecentOrders(1)`；“去订单导出”跳 `/yy/order?source=DOUYIN_LIFE&intent=export` | 不新增后端接口，不改变订单同步和导出链路 |
| 订单页承接 | `/yy/order` 已读取 `source/intent` 查询参数，自动筛选抖音来客订单并提示确认同步状态后导出 | 从来客页跳订单页后能直接进入“同步后导出”的工作状态 |

这轮优化的是 `admin-ui` 的系统管理后台抖音来客运营页，用于把真实下单入口配置、订单同步和统一导出串成可执行路径；小程序内 `tt.pay` 仍是后续 P1 独立支付线。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
```
