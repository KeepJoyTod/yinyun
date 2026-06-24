> owner: studio-workbench-architecture-framework
> canonical_for: 门店工作台 PC 端的大框架、边界、数据账本和后续开发入口
> upstream: studio-workbench/src/app/router/featureRegistry.ts, studio-workbench/src/shared/api/backend.ts, studio-workbench/src/shared/stores/appStore.ts
> downstream: docs/studio-workbench-api-route-map.md, docs/studio-workbench-route-implementation-status.md, docs/domestic-model-handoff-small-features.md

# 影约云门店工作台大框架

更新时间：2026-06-14

## 一句话定位

`studio-workbench` 是影楼/门店员工 PC 工作台，不是 RuoYi 系统总后台，也不是客户小程序。

正式目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

本地开发：

```text
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run dev
```

## 前端分层

| 层 | 目录 | 职责 |
| --- | --- | --- |
| 路由与权限 | `src/app/router` | 菜单、路由、权限、旧路径重定向 |
| 页面 | `src/features/*/*.vue` | 页面 UI、输入态、抽屉、按钮、展示 |
| 纯规则 helper | `src/features/*/*Operations.ts` | 可测试的业务派生规则，不依赖 Vue |
| 状态与动作 | `src/shared/stores/appStore.ts` | 页面共享状态、加载数据、调用 backendApi |
| 类型与映射 | `src/shared/stores/appStoreTypes.ts`、`appStoreTransforms.ts` | 前端模型和 DTO 转换 |
| API facade | `src/shared/api/backend.ts` | 工作台到后端接口的唯一前端封装 |
| API 类型 | `src/shared/api/backendTypes.ts` | DTO、payload、查询参数类型 |
| 请求与 token | `src/shared/api/request.ts` | RuoYi token、验证码登录、请求错误 |

## 核心账本边界

| 业务 | 唯一主账本 | 工作台策略 |
| --- | --- | --- |
| 订单 | `yy_order` | 所有微信、抖音、H5、门店来源订单进入统一订单页 |
| 客户 | `yy_customer` | 会员、标签、消费记录均从客户和订单派生 |
| 相册 | `yy_photo_album` | 客片管理、在线选片、资源文件共享相册数据 |
| 底片 | `yy_photo_asset` | 后台/工作台上传后写底片记录，OSS 仍私有 |
| 商品 | `yy_product` | 服务、附加、团单、冲印从统一产品派生 |
| 渠道商品 | `yy_channel_product_mapping` | 抖音/美团映射只读排障，新增编辑在系统后台 |
| 渠道日志 | `yy_channel_sync_log` | 抖音来客、订单同步、核销排障看 logid/requestId |
| 权限 | RuoYi 菜单权限 | 工作台只展示和提示缺失权限，不维护系统角色 |

禁止新建第二套订单、会员、营销、工单或报表账本，除非后端表已经正式设计并同步到地图。

## 已拆出的稳定 helper

| helper | 页面 | 职责 |
| --- | --- | --- |
| `src/features/orders/orderOperations.ts` | `OrdersView.vue` | 今日运营订单、快捷筛选、下一步动作、日期解析、库存冲突识别 |
| `src/features/albums/photoMgmtOperations.ts` | `PhotoMgmtView.vue` | 相册进度、照片网格、批量已选计数、缩略图状态集合 |
| `src/features/tools/shareLinkOperations.ts` | `ShareLinksView.vue` | 微信/抖音 AppID、小程序 path、scene、H5 兜底链接、路由默认入口 |
| `src/features/collaboration/workOrders.ts` | 工单页面 | 从统一订单/相册/选片链接派生工单 |
| `src/features/collaboration/workExecution.ts` | 执行概况 | 推导拍摄、上传、客户选片、精修交付当前环节 |
| `src/features/orders/derivedOrderModules.ts` | 派生订单页面 | 冲印、企业、售卡、售券、表单视图 |
| `src/features/reports/derivedReportModules.ts` | 报表页面 | 门店、产品、员工、财务、客户、渠道、转化统计 |

后续小功能优先新增或扩展 helper，再让页面调用，避免继续把规则塞回 Vue 大文件。

## 入口和域名

| 端 | 入口 |
| --- | --- |
| 门店工作台 PC | `https://studio.evanshine.me` |
| 系统总后台 | `https://admin.evanshine.me` |
| 统一后端 API | `https://api.evanshine.me` |
| 客户取片/小程序 API | `https://api.evanshine.me/client/photo/*` |
| 客户 PC 兜底 | `client-web`，本地端口 `5200` |
| 微信小程序 | `mobile-uniapp` 编译 `mp-weixin` |
| 抖音小程序 | `mobile-uniapp` 编译 `mp-toutiao` |

`yingyueyun.evanshine.me` 是历史兼容入口，不作为新配置首选。

## 工作台开发硬规则

- 所有后端雪花 ID 在前端保持 `string`。
- 店员网页不创建客户预约；预约来自微信/抖音/H5/系统后台。
- OSS 保持私有，不改公共读，不暴露长期直链。
- 新增业务规则必须有 helper 或契约测试。
- API 模式失败不能自动 fallback 到 demo 数据。
- 真实渠道能力未授权时显示“待开通/待补齐”，不伪造成功数据。
- 改完至少执行：

```text
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

## 后续优先级

1. 继续拆 `appStore.ts`：按订单、相册、员工、渠道日志分组。
2. 继续拆 `backend.ts`：按 order、album、merchant、channel 分 API 模块。
3. 完成生产验收：订单状态写库、相册上传、底片记录、入口物料复制。
4. 抖音来客真实订单查询同步：写入 `yy_order` 后在工作台展示。
5. 小程序真机验收：微信/抖音登录、取片、预览、保存图片。
