# 影约云门店工作台 PC 端优化地图

更新时间：2026-06-14

## 当前状态

已把 `photoshop-master/frontend` 迁入正式仓库：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

已完成首轮正式化：

| 项 | 当前值 |
| --- | --- |
| 包名 | `yingyue-studio-workbench` |
| 本地端口 | `5190` |
| 预览端口 | `5191` |
| 页面标题 | `影约云门店工作台` |
| 可见品牌 | `影约云 / Studio Workbench` |
| token key | `yingyue_studio_workbench_access_token` |
| 员工会话 key | `yingyue_studio_workbench_staff_session` |
| 默认代理 | `http://localhost:8080` |
| 本地演示兜底 | 默认使用 demo 数据；设置 `VITE_STUDIO_DEMO=false` 后走真实接口 |
| 真实 adapter | 已接 `/yy/store`、`/yy/product`、`/yy/order`、`/yy/photoAlbum`、`/yy/photoAsset` 列表 |
| 真实上传闭环 | 已接 `/resource/oss/upload` -> `/resource/oss/listByIds/{ossId}` -> `/yy/photoAsset` |
| 门店登录页 | 已接 `/login`，线上 API 模式走 `/auth/code` + `/auth/login`；未登录或无 API token 访问工作台会跳转登录 |
| 生产门店账号 | 已创建 `store-admin`，角色 `studio_staff`，使用通用演示密码；权限覆盖门店/产品/订单/相册/底片/OSS 上传查询 |
| 主控台运营看板 | 已补“今日待拍 / 待上传 / 待选片 / 待交付”四个指标，由订单、相册、选片链接现有数据派生 |
| 主控台加载性能 | 趋势图与 ECharts 改为异步加载并独立分包；`DashboardView` 入口由约 `533.17 kB` 降至约 `12.85 kB`，最大 ECharts 分包约 `101.89 kB` |
| 预约订单看板 | `/orders` 已补门店订单处理顺序、今日待处理/今日到店/今日待确认/待拍摄/选片跟进指标和快捷筛选；默认按到店日期只看今日待处理，历史订单需手动切“全部订单” |
| 日程排期承接 | `/schedule` 已补今日预约、待确认时段、已占用工位、可接待工位指标和快捷筛选 |
| 门店承接概况 | `/store` 已补门店总数、营业中、待服务单、本月订单指标和门店快捷筛选 |
| 门店页占位清理 | `/store` 待服务单操作卡 scope 已从占位 `TODO` 改为业务语义 `SERVICE`，避免正式路由展示/扫描误判为未完成 |
| 产品配置承接 | `/config` 已补在售产品、待补规则、本月加片营收、平均加片张数指标和产品快捷筛选 |
| 附加/团单/冲印/美团产品 | `/product/addon`、`/product/group`、`/product/print`、`/product/meituan` 已从建设中替换为共用派生商品页面；前三个读 `yy_product`，美团读渠道映射 |
| 客片批量操作 | `/photo-mgmt` 已补批量选择工具栏、批量标记已选/取消已选、缩略图加载中和失败态 |
| 系统设置边界 | `/settings` 已补员工会话、接口模式、客户取片、可运营数据指标和入口边界说明 |
| 入口物料管理 | `/tools/booking-entry`、`/tools/pickup-entry`、`/tools/share-links` 已从建设中替换为真实页面；可按门店生成微信小程序路径、scene、H5 兜底链接、二维码预览和桌牌文案 |
| 角色与权限 | `/settings/roles` 已从建设中替换为真实页面；展示门店角色模板、当前账号权限体检、菜单权限矩阵和 RuoYi 后台维护边界 |
| 渠道配置 | `/settings/channels` 已从建设中替换为真实页面；集中展示微信/抖音 AppID、合法域名、抖音来客回调/SPI 地址和上线检查 |
| 系统日志 | `/settings/logs` 已从建设中替换为真实页面；集中展示操作日志、渠道同步日志、失败原因、可重试状态和 requestId/logid 复制 |
| 抖音产品 | `/product/douyin` 已从建设中替换为真实页面；读取 `/yy/channelProductMapping/list`，展示商品 ID、SKU、POI、落地页和可投放状态 |
| 渠道核销 | `/order/verification` 已从建设中替换为真实页面；读取抖音来客验收、同步健康和渠道日志，展示 logid 与只读核销排障清单 |
| 活动订单 | `/order/campaign` 已从建设中替换为真实页面；从统一 `yy_order` 派生活动来源、支付、今日到店和待跟进视图 |
| 冲印/企业/售卡/售券/表单 | `/order/print`、`/order/enterprise`、`/order/card`、`/order/coupon`、`/order/forms` 已从建设中替换为共用派生订单页面 |
| 工作执行概况 | `/collaboration/overview` 已从建设中替换为真实页面；每个订单按下游数据推导唯一的拍摄、上传、客户选片或精修交付环节 |
| 工单管理 | `/collaboration/work-orders` 已从建设中替换为真实页面；从执行队列派生工单池，支持阻塞、超时、进行中和关联页面处理 |
| 工单数据导出 | `/collaboration/export` 已从建设中替换为真实页面；按门店、环节、状态和关键词导出派生工单 CSV |
| 环节统计 | `/collaboration/statistics` 已从建设中替换为真实页面；统计四个制作环节的数量、阻塞、超时、进行中比例和平均进度 |
| 文件资源/样片作品 | `/resource/files`、`/resource/samples` 已从建设中替换为共用派生资源页面；只读相册底片和样片候选 |
| 会员账户/客户标签/消费记录 | `/member/accounts`、`/member/tags`、`/member/consumption` 已从建设中替换为共用派生会员页面；只读客户档案和统一订单 |
| 营销中心/优惠券/活动清单/参与记录 | `/marketing/*` 四个建设中入口已替换为共用派生营销页面；只读统一订单和客户数据 |
| 统计报表 | `/report/*` 十个建设中入口已替换为共用派生报表页面；实时读取订单、员工、相册和客户数据 |
| 顶部主按钮 | 已从“新建预约”改为“处理订单”，点击进入 `/orders`；店员工作台不再创建客户预约 |
| 雪花 ID 正确性 | API DTO、store 和页面表单统一使用字符串 ID，19 位雪花 ID 不再转成 JavaScript `number` |
| 订单范围隔离 | 今日运营订单使用 `orders`，会员消费和报表范围订单使用 `reportOrders`，不再用今日数据生成月报 |
| 页面数据生命周期 | 会员和报表页面在挂载、模块切换时按领域加载客户、员工或当前月订单，并复用已有数据 |
| 创建结果一致性 | 服务组、员工、客户、通知模板、订单、产品创建后回查服务端真实记录；demo ID 明确使用 `demo-*` |
| Store 可维护性 | `appStore.ts` 已拆出 `appStoreTypes.ts` 与 `appStoreTransforms.ts`；状态/动作、业务模型、DTO 映射分层更清晰，页面导入保持兼容 |
| Backend 可维护性 | `backend.ts` 已拆出 `backendTypes.ts`；API facade、DTO/payload 类型与 RuoYi adapter 依赖边界更清楚，外部旧导入继续兼容 |
| 订单页可维护性 | `OrdersView.vue` 已拆出 `orderOperations.ts`；今日运营看板、快捷筛选、下一步动作、日期解析和库存冲突识别都有独立单测 |
| 客片页可维护性 | `PhotoMgmtView.vue` 已拆出 `photoMgmtOperations.ts`；相册进度、照片网格、批量已选计数和缩略图集合清理都有独立单测 |
| 入口物料可维护性 | `ShareLinksView.vue` 已拆出 `shareLinkOperations.ts`；小程序 path、scene、H5 兜底链接和路由默认入口都有独立单测 |
| 架构与交接框架 | 已新增大框架、接口路径、路由状态、国产模型交接文档和小任务模板：`studio-workbench-architecture-framework.md`、`studio-workbench-api-route-map.md`、`studio-workbench-route-implementation-status.md`、`domestic-model-handoff-small-features.md`、`domestic-model-task-template.md` |

未接入正式路由的参考残留：

- `src/features/customers/CustomersView.vue`、`src/features/finance/FinanceView.vue`、`src/features/packages/PackagesView.vue` 当前只是标题级占位，不在 `src/app/router/index.ts`。
- 它们不作为门店工作台 P0/P1 验收入口；客户 CRM、财务结算、独立套餐页以后按新需求重新设计。
- 当前套餐配置入口仍是 `/config`，客户和财务相关能力先在订单、相册、在线选片和系统后台里承接。

## P0：跑通展示与接口适配

目标：让门店工作台能作为演示和内部使用入口打开。

- 保持当前漂亮 PC UI，不把它改回 RuoYi 后台风格。
- 启动 `http://127.0.0.1:5190/`，确认主控台、订单、日程、客片、在线选片、配置页面可打开。
- 当前已实现本地 demo fallback，后端接口未适配时不会白屏，也不会请求未适配接口。
- 已增加影约云 API adapter：
  - 门店：`/yy/store/list`
  - 产品：`/yy/product/list`
  - 订单：`/yy/order/list`
  - 相册：`/yy/photoAlbum/list`
  - 底片：`/yy/photoAsset/list`
  - 选片链接/统计/日程：先由相册、底片、订单数据派生。
- 已补真实上传照片：
  - `/resource/oss/upload`
  - `/resource/oss/listByIds/{ossId}`
  - `/yy/photoAsset`
- 已补门店员工登录入口：
  - `/login`
  - 独立员工会话 key，不复用客户手机号取片登录
  - 线上 API 模式演示账号 `store-admin` / 通用演示密码；本地 Demo 模式才使用 `store-admin` / `demo123456`
  - API 模式必须同时具备员工会话和 API token；旧 demo 会话不能绕过真实登录
  - API 模式下后端失败不再 fallback 到 demo 数据，避免误判订单/相册已经写库
  - 页面已展示订单确认、拍摄日程、客片交付、在线选片四类员工工作范围
  - 页面已说明客户入口走客户官网或小程序，不使用门店员工登录态
  - 已新增 `src/features/auth/StaffLoginView.contract.test.ts` 锁定登录页边界
- 待做生产验收：用 `store-admin` 输入页面验证码登录，验证订单状态写库、OSS 上传、底片创建、刷新后返回真实底片 ID。
- 本地开发仍保留 demo fallback；线上 API 模式不再自动降级为 demo。
- P0 正确性基线已完成：
  - 后端业务 ID 全程字符串化，避免 19 位雪花 ID 精度丢失。
  - `listTodayOrders()` 与 `listOrders(query)` 分离，运营首页和范围报表互不污染。
  - 会员/报表页面补齐挂载与模块切换加载器。
  - 正式创建接口不再使用 `Date.now()` 合成数据库记录，创建后回查服务端权威数据。
  - demo 临时记录使用 `demo-*` ID，刷新前后不会误认成正式数据。

## P1：门店真实运营闭环

目标：让门店每天能用。

- 预约订单页支持：
  - 查看和处理小程序/抖音来客同步来的预约订单
  - 修改到店时间
  - 状态流转：待确认、已确认、拍摄中、选片中、已完成
  - 来源：微信小程序、抖音小程序、抖音来客、管理员后台补录
- 日程页支持：
  - 已支持按门店筛选、日期筛选、日/周视图切换。
  - 已补今日排期承接看板：今日预约、待确认时段、已占用工位、可接待工位。
  - 已补快捷筛选：全部时段、只看待确认、只看已确认。
  - 后续补摄影师筛选、拖动或快捷改期、冲突提示。
- 客片管理支持：
  - 相册创建
  - 多图上传
  - 照片显隐
  - 取片码生成
  - 客户预览入口复制
- 入口物料管理支持：
  - 现场预约通道 / 底片下载桌牌
  - 扫码预约证件照桌牌
  - 客户取片入口
  - 我的订单入口
  - 微信小程序页面路径、scene 和 H5 兜底链接复制
  - 正式替换旧 `yuyue123.cn` / 第三方二维码的检查清单
- 角色与权限支持：
  - 系统管理员、门店主管、前台店员、摄影师、修图师模板
  - 当前账号角色标识、门店范围和菜单权限数量
  - 工作台菜单权限矩阵
  - 缺失权限复制，方便去系统后台补授权
  - 明确不在门店工作台修改全局系统角色
- 渠道配置支持：
  - 微信/抖音小程序 request、uploadFile、downloadFile 合法域名复制
  - 抖音来客 Webhook、发券、退款、预约、库存、核销、订单查询地址复制
  - `api.evanshine.me` 与历史 `yingyueyun.evanshine.me` 的新旧边界说明
  - 上线前人工确认清单
- 系统日志支持：
  - 操作日志读取 `/monitor/operlog/list`
  - 渠道同步日志读取 `/yy/channelSyncLog/list`
  - 失败、渠道同步、操作日志、可重试快速筛选
  - 复制 requestId / 抖音 logid 给平台排障
  - 操作日志缺权限时不影响渠道同步日志展示
- 抖音产品支持：
  - 商品映射读取 `/yy/channelProductMapping/list`
  - 展示 `externalProductId`、`externalSkuId`、`externalPoiId`、`landingUrl/landingPath`
  - 自动标识“可投放 / 待补齐”
  - 复制抖音来客入口
  - 明确新增/编辑映射仍在系统后台，不在店员工作台直接改渠道账本
- 渠道核销支持：
  - 验收记录读取 `/yy/channel/DOUYIN_LIFE/acceptance-cases`
  - 同步健康读取 `/yy/channel/DOUYIN_LIFE/sync-health`
  - 关联渠道同步日志 `/yy/channelSyncLog/list`
  - 展示发券、接单、整单核销用例和 `X-Bytedance-Logid`
  - 明确不在门店工作台直接执行真实核销，避免店员误操作已售订单
- 活动订单支持：
  - 直接读取统一 `yy_order`，不新建第二套活动订单数据
  - 将抖音来客、微信预约、美团和门店线索归因到活动渠道
  - 支持全部活动、已支付、待支付、今日到店、待跟进筛选
  - 支持按渠道和客户/手机号/订单号搜索
  - 从活动订单跳到统一订单页继续处理，不在店员网页创建预约
- 冲印/企业/售卡/售券/表单支持：
  - 共用 `DerivedOrderModuleView.vue`，减少五套重复页面
  - 统一从 `yy_order` 和相册数据派生，不新增冲印、卡券、表单第二账本
  - 冲印订单识别冲印、加洗、打印、相纸、证照打印等关键词
  - 企业团单识别企业、团体、团单、多人、公司等关键词
  - 售卡订单识别会员卡、年卡、次卡、储值卡、售卡等关键词
  - 售券订单识别券、团购、抖音、美团、兑换等关键词
  - 表单管理聚焦表单/问卷/线索来源、缺资料、待支付和待确认
  - 所有记录只跳转统一订单页处理，不在店员网页创建预约
- 附加/团单/冲印/美团产品支持：
  - 共用 `DerivedProductModuleView.vue`，减少四套重复页面
  - 附加产品从服务产品的精修张数、加片单价和说明派生，不新建第二套附加产品账本
  - 团单产品识别企业、团体、团单、多人、公司等关键词
  - 冲印产品识别冲印、加洗、打印、相纸、证照等关键词
  - 美团产品读取 `/yy/channelProductMapping/list` 的 `MEITUAN` 映射，展示商品、SKU、POI、入口和授权状态
  - 未授权或缺 SKU/POI/入口的美团商品只显示“待补齐”，不伪造可投放
  - 所有操作只跳转服务产品或渠道配置，不在店员网页创建客户预约
- 在线选片支持：
  - 客户访问次数
  - 已选数量
  - 加选数量
  - 已支持导出客户选择结果 CSV，只包含 `is_selected=1` 的底片
  - 导出前刷新真实相册详情，提供导出中、成功、无已选照片和加载失败状态
- 工作执行概况支持：
  - 读取统一 `yy_order`、相册和选片链接，不新建第二套执行账本
  - 每个订单只展示当前最靠后的一个环节，避免同一客户重复出现在多个任务列表
  - 支持按日期、门店、环节和客户/订单关键词筛选
  - 已超时工作优先排序，并跳转现有订单、客片或在线选片页面处理
- 工单管理支持：
  - 读取工作执行队列，不新建第二套工单账本
  - 每个订单派生一个当前工单号，格式如 `WO-SHOOT-YY202606100003`
  - 支持全部工单、阻塞、已超时、进行中快捷筛选
  - 展示负责人、优先级、阻塞原因、关联订单/相册/选片链接
  - 阻塞工单引导打开订单处理；拍摄工单可从页面推进到 `拍摄中`
  - 后续接入 `yy_work_order` 表后，可替换数据源并保留当前页面交互
- 工单数据导出支持：
  - 复用派生工单池，不新建第二套导出数据源
  - 支持按工单状态、环节、门店和关键词筛选
  - 导出 UTF-8 BOM CSV，字段包含工单号、订单、客户、门店、环节、状态、优先级、负责人、时限、超时和阻塞原因
  - 当前导出适合每日交接和超时追踪；后续 `yy_work_order_event` 接好后再纳入事件明细
- 环节统计支持：
  - 复用派生工单池，不新建统计快照表
  - 固定展示拍摄、上传、客户选片、精修交付四个环节
  - 统计工单总数、阻塞数、超时数、进行中比例和平均进度
  - 右侧突出当前瓶颈环节，并跳转工单管理处理
  - 当前为只读统计；后续 `yy_work_order_event` 接好后再补平均耗时、员工产能和超时率趋势
- 文件资源/样片作品支持：
  - 共用 `DerivedResourceModuleView.vue`，减少资源组重复页面
  - 文件资源从相册底片派生，展示客户、订单、相册、摄影师、私有 OSS 访问状态和排查建议
  - 样片作品只从客户已选照片派生候选，不写公开作品账本
  - 未公开发布前提示客户授权、展示分类和封面裁切仍需后台审核
  - 页面只跳转客片管理，不直接上传照片、不发布样片、不暴露永久 OSS 地址
- 会员账户/客户标签/消费记录支持：
  - 共用 `DerivedMemberModuleView.vue`，减少会员组重复页面
  - 会员账户从 `yy_customer` 与 `yy_order` 派生会员等级、消费总额和订单次数
  - 客户标签只读 `yy_customer.tags`，聚合客户数量、来源和累计消费
  - 消费记录只读 `yy_order`，展示已入账、待支付和已退款状态
  - 页面只跳转客户档案或统一订单处理，不创建积分、余额、标签或消费第二账本
- 营销中心/优惠券/活动清单/参与记录支持：
  - 共用 `DerivedMarketingModuleView.vue`，减少营销组重复页面
  - 营销中心和活动清单按 `yy_order.source` 聚合订单量、支付金额和待跟进数量
  - 优惠券只展示券、团购、兑换相关订单线索，不伪造发放、领取和核销结果
  - 活动参与记录逐单展示已转化、待转化和已退款状态
  - 页面只跳转活动订单或统一订单，不创建营销活动、券模板、券实例和参与记录第二账本
- 统计报表支持：
  - 十个统计入口共用 `DerivedReportModuleView.vue`
  - 门店日报/月报、产品、收支、渠道和转化从 `yy_order` 实时聚合
  - 员工与修图统计读取 `yy_employee`、`yy_photo_album`、`yy_photo_asset`
  - 客户分析读取 `yy_customer`
  - 客户评价在没有评价表或渠道评价 API 时保持真实空态，不伪造评分
  - 所有报表只读，不写第二套报表快照、财务、绩效或评价账本

## P2：UI 质感和工作效率

目标：把朋友项目 UI 变成影约云产品级工作台。

- 替换示例门店/客户数据为影约云演示数据。
- 统一按钮状态：加载中、成功、失败、禁用。
- 表格和列表增加空态、错误态、重试入口。
- 页面搜索支持订单号、客户名、手机号、相册号。
- 主控台已补“今日待拍 / 待上传 / 待选片 / 待交付”四个运营指标；桌面和移动视口均无横向溢出。
- 主控台趋势图已使用 `defineAsyncComponent` 延迟加载，并提供固定高度加载态；Vite 将 Vue 框架与 ECharts 拆成独立分包，消除单个页面超过 `500 kB` 的构建警告。
- 预约订单页已补“门店订单处理顺序”和快捷筛选，店员默认只看今日待处理；`待确认优先` 只统计今日到店待确认，历史订单需手动切“全部订单”。
- 日程页已补“今日排期承接”和快捷筛选，店员可先确认待确认时段，再看已占用/可接待工位。
- 门店页已补“门店承接概况”和快捷筛选，店员可先看有待服务门店，再确认营业中/预约制门店。
- 门店页已清理待服务单操作卡占位 scope，改为 `SERVICE`，并用契约测试锁定不再出现占位标记。
- 配置页已补“产品配置承接”和快捷筛选，店员可先确认在售套餐和待补选片规则。
- 设置页已补“工作台安全与运行状态”，店员能确认员工入口、接口模式、客户取片隔离和入口边界。
- 员工登录页已接真实后端账号和验证码；后续补门店角色、权限提示和数据范围说明。
- 客片页已增加批量选择工具栏、批量标记已选/取消已选；缩略图加载中和加载失败都有明确状态。
- `appStore.ts` 第一轮重构已完成：业务类型和 DTO 映射独立成文件，外部页面仍可从 `appStore.ts` 导入类型，降低后续继续拆分订单、相册、员工模块的风险。
- `backend.ts` 第一轮重构已完成：DTO、payload 和查询类型独立到 `backendTypes.ts`，`backend.ts` 继续 re-export 类型并保留 `backendApi` facade；`yingyueAdapter.ts` 改为依赖类型文件，降低 adapter 与 facade 的耦合。
- `OrdersView.vue` 第一轮重构已完成：订单运营规则独立到 `orderOperations.ts`，页面只负责状态、筛选输入和渲染；后续接抖音订单同步、并发库存提示或新状态时先改纯函数和单测。
- `PhotoMgmtView.vue` 第一轮重构已完成：客片展示和批量选择规则独立到 `photoMgmtOperations.ts`，页面继续保留上传、拖拽排序、重命名、删除和选片链接动作；后续接真实显隐/批量保存接口时先补 helper 单测。
- `ShareLinksView.vue` 第一轮重构已完成：店内二维码、小程序 path、scene 和 H5 兜底链接生成规则独立到 `shareLinkOperations.ts`，后续生成真实微信小程序码或抖音码时先扩展该 helper 和单测。
- 保留当前克制、精致、偏影楼管理系统的视觉，不走营销站风格。

## P3：客户 PC 网页端拆分

目标：避免把“门店工作台”和“客户电脑网页”混在一起。

后续新建：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
```

定位：

- 给客户在电脑浏览器预约、下单、看相册。
- 不使用门店工作台的左侧管理导航。
- 与 `mobile-uniapp` 共用后端 `/client/photo/*` 和未来客户预约接口。

## 验收清单

- `npm run build` 通过。
- `npm test` 通过。
- `src/shared/api/backendId.test.ts` 验证 19 位雪花 ID 原样保留。
- `src/shared/api/backend.contract.test.ts` 验证今日/范围订单隔离及创建后回查真实记录。
- `src/shared/stores/appStore.contract.test.ts` 验证 `reportOrders`、领域加载器和 `demo-*` 临时 ID。
- `npm run dev` 能启动到 `5190`。
- 浏览器打开首页不是空白。
- 浏览器打开 `/orders` 默认显示“今日待处理”，不会把历史待确认订单混入首屏。
- 浏览器打开 `/orders?focus=pending` 显示“已进入今日待确认订单”，不会展示全部历史待确认。
- 浏览器打开 `/photo-mgmt` 无当前控制台错误。
- 浏览器打开 `/schedule` 能看到“今日排期承接”，桌面和 390px 移动视口无横向溢出。
- 浏览器打开 `/store` 能看到“门店承接概况”，桌面和 390px 移动视口无横向溢出。
- 浏览器打开 `/config` 能看到“产品配置承接”，桌面和 390px 移动视口无横向溢出。
- 浏览器打开 `/product/addon`、`/product/group`、`/product/print`、`/product/meituan` 能看到对应标题、产品/渠道派生说明、筛选、详情栏和数据边界。
- 浏览器打开 `/settings` 能看到“工作台安全与运行状态”，桌面和 390px 移动视口无横向溢出。
- 浏览器打开 `/tools/share-links` 能看到“二维码与分享链接”，能切换现场通道、扫码预约、底片取片、我的订单。
- 浏览器打开 `/tools/booking-entry` 默认选中扫码预约，能看到微信小程序页面路径和 `scene`。
- 浏览器打开 `/tools/pickup-entry` 默认选中底片取片，能看到客户取片 H5 兜底链接。
- 浏览器打开 `/settings/roles` 能看到“角色与权限”、五类门店角色模板、当前账号体检和菜单权限矩阵。
- 浏览器打开 `/settings/channels` 能看到“小程序合法域名”和“抖音来客回调 / SPI 地址”。
- 浏览器打开 `/settings/logs` 能看到“系统日志”、失败/渠道同步/操作日志筛选、requestId/logid 复制和日志详情。
- 浏览器打开 `/product/douyin` 能看到“抖音产品”、可投放/待补齐筛选、商品 ID、SKU、POI、落地页复制和系统后台维护边界。
- 浏览器打开 `/order/verification` 能看到“渠道核销”、抖音来客验收记录、同步健康、最近渠道日志和“不直接执行真实核销”提示。
- 浏览器打开 `/order/campaign` 能看到“活动订单”、活动来源归因、已支付/待支付/今日到店/待跟进筛选和统一订单跳转。
- 浏览器打开 `/order/print`、`/order/enterprise`、`/order/card`、`/order/coupon`、`/order/forms` 能看到对应标题、统一订单派生说明、筛选和统一订单跳转。
- 浏览器打开 `/service/selection` 能看到访问次数、已选/加选数量，并能导出只包含客户已选照片的 CSV。
- 浏览器打开 `/collaboration/overview` 能看到工作执行概况、拍摄/上传/客户选片/精修交付环节、超时优先和真实处理入口。
- 浏览器打开 `/collaboration/work-orders` 能看到工单管理、阻塞/超时/进行中筛选、工单详情和关联页面入口。
- 浏览器打开 `/collaboration/export` 能看到工单数据导出、筛选条件、导出数量和 CSV 导出按钮。
- 浏览器打开 `/collaboration/statistics` 能看到环节统计、四环节分布、当前瓶颈和工单管理跳转。
- 浏览器打开 `/resource/files`、`/resource/samples` 能看到对应标题、资源/样片派生说明、筛选、详情栏、私有 OSS 和数据边界。
- 浏览器打开 `/member/accounts`、`/member/tags`、`/member/consumption` 能看到对应标题、客户/订单派生说明、筛选、详情栏和不建立第二账本边界。
- 浏览器打开 `/marketing/center`、`/marketing/coupons`、`/marketing/campaigns`、`/marketing/participations` 能看到对应标题、转化筛选、详情栏和真实营销表尚未接入的数据边界。
- 浏览器打开全部 `/report/*` 路由能看到对应标题、实时聚合指标、筛选、详情栏和数据边界；`/report/reviews` 在未接评价数据时显示明确空态。
- 左侧品牌显示为 `影约云`。
- `admin-ui`、`mobile-uniapp`、`studio-workbench` 三者端口不冲突。
- 文档明确：
  - `admin-ui` 是系统后台。
  - `studio-workbench` 是门店工作台 PC。
  - `mobile-uniapp` 是客户 H5/微信/抖音小程序。
  - `client-web` 是客户电脑网页端，已创建并可本地运行。
