# 影约云开源项目借鉴计划

更新时间：2026-06-03

## 结论

本地已经有主要参考项目源码，当前不缺“再下载一堆项目”，缺的是把这些项目的可借鉴点映射到影约云当前代码。

策略：

- 不迁移技术栈。
- 不复制开源项目代码、素材和品牌视觉。
- 只借鉴领域模型、后台信息架构、状态流转、日志和验收方式。
- 抖音/美团闭环优先，性能深度拆包暂列 P3。

## 本地已有参考项目

| 项目 | 本地路径 | 借鉴点 | 不采用点 | 当前影约云落点 |
| --- | --- | --- | --- | --- |
| RuoYi-Vue-Plus | `D:\OtherProject\CameraApp\RuoYi-Vue-Plus-5.X` | 企业后台、多租户、权限、日志、代码生成 | 不另起一套后台 | 当前主项目 `yingyue-cloud-repo` 已采用同系架构 |
| Cal.com | `D:\OtherProject\CameraApp\cal-com-main` | 预约排期、可用时段、资源/员工日历、白标预约页 | 不迁移 monorepo、tRPC、复杂集成 | `yy_schedule_rule`、预约库存、照相馆前端预约页 |
| pretix | `D:\OtherProject\CameraApp\pretix-master` | 券码、核销、check-in 日志、订单生命周期 | 不引入 Django/Python 栈 | 抖音发券 SPI、整单核销、`yy_channel_sync_log` |
| Medusa | `D:\OtherProject\CameraApp\medusa-develop` | 商品、订单、库存、渠道、履约模块抽象 | 不引入完整 Node commerce 平台 | `yy_order`、`yy_channel_order_mapping`、`yy_channel_product_mapping`、`yy_channel_inventory_slot` |
| Saleor | `D:\OtherProject\CameraApp\saleor-main` | API-first、渠道、商品、订单、客户、后台体验 | 不改 GraphQL-only，不拆多服务 | 后台订单列表、渠道工作台、客户/订单状态展示 |

## 可选参考项目

| 项目 | 本地状态 | 是否必须 | 用途 |
| --- | --- | --- | --- |
| `eahau/douyin-openapi` | 已下载到 `D:\OtherProject\CameraApp\douyin-openapi` | 否 | 参考抖音 OpenAPI schema / Java client 生成思路；不作为官方依据 |

说明：这个项目只做参考。当前抖音主线更依赖官方文档、开放平台能力、真实 `logid` 和本地已实现的 `DouyinOpenApiClient`。

## 当前已落地内容

| 能力 | 当前状态 | 代码/文档位置 |
| --- | --- | --- |
| 抖音订单查询/同步 | 已实现；平台能力仍可能返回未获得能力 | `DouyinLifeChannelAdapter`、`DouyinOpenApiClient` |
| 发券 SPI | 已实现，返回抖音裸 JSON；等待三方码白名单/真实回调 | `YyDouyinLifeSpiController`、`DouyinLifeChannelAdapter.issueTripartiteCode` |
| 预约接拒单 | 已实现；需要真实 `book_id` 和能力解除 | `POST /yy/channel/DOUYIN_LIFE/confirm` |
| 整单核销 | 已实现；需要核销能力和券码/verify_token | `POST /yy/channel/DOUYIN_LIFE/verify` |
| 商户直连库存 | 已实现库存 SKU、实时库存、库存通知、时段库存保存/查询 | `yy_channel_inventory_slot`、抖音联调页库存面板 |
| 美团基础框架 | 已实现授权状态、订单同步、核销记录查询框架 | `MeituanChannelAdapter`、`MeituanOpenApiClient` |
| 后台体验 | 已增强订单同步、最近 logid、错误摘要、空状态和防重复点击 | `admin-ui/src/views/yy/order`、`YyChannelWorkbench`、`yy/channel/life` |

## 当前未落地但建议保留的项

| 项 | 优先级 | 为什么暂不做 | 触发条件 |
| --- | --- | --- | --- |
| `yy_channel_certificate` | P1 | 真实三方码/券码/核销未跑通前，字段容易猜错 | 抖音真实发券 SPI 或核销回调稳定后 |
| `yy_order_status_log` | P1 | 当前 `yy_channel_sync_log` 足够排查接口；状态流转表等事件复杂后再拆 | 创单、支付、发券、接单、核销、退款、撤销核销都开始稳定入站后 |
| 美团真实 path/签名 | P0/P1 | 缺美团开放平台账号、接口文档、门店授权、AppKey/AppSecret | 拿到美团商家应用和门店授权后 |
| 抖音 OpenAPI 生成器 | P3 | 当前 client 手写范围可控，生成器可能引入更多维护成本 | 抖音接口数量大幅增加，手写 client 维护吃力时 |
| Vite 深度拆包到全量小于 500KB | P3 | 当前无 chunk warning；Element Plus 公共包可缓存，硬拆收益低 | 线上首屏性能确实慢，且有浏览器性能数据支撑 |

## 借鉴映射

| 参考项目 | 借鉴主题 | 影约云当前文件/模块 | 下一步动作 |
| --- | --- | --- | --- |
| Cal.com | 可约时段、资源日历、员工排期 | `yy_schedule_rule`、`yy_channel_inventory_slot`、照相馆预约页 | 等抖音商户直连开通后，把本地排期和抖音库存槽做一致性校验 |
| pretix | 券码、核销、check-in 日志 | `issueTripartiteCode`、`verifyCertificate`、`yy_channel_sync_log` | 真实核销跑通后再加 `yy_channel_certificate` |
| Medusa | 商品/订单/渠道/履约抽象 | `yy_order`、`yy_channel_order_mapping`、`yy_channel_product_mapping` | 保持统一订单模型，抖音/美团/微信端都只读本地订单 |
| Saleor | 后台订单筛选、渠道状态、客户视图 | 订单列表、渠道工作台、美团/抖音页面 | 继续优化“渠道状态 + 本地状态 + 最近 logid”展示 |
| RuoYi-Vue-Plus | 权限、菜单、代码生成、审计日志 | 当前后台基座 | 继续沿用，不做框架替换 |

## 下一步执行顺序

1. P0：等抖音商户直连/库存直连开通后，跑库存 smoke，拿真实 `logid`。
2. P0：确认来客商品勾选 `抖音APP预约`，用户端出现在线预约后再下单。
3. P0：触发创单 SPI、接单 OpenAPI、整单核销 OpenAPI，填开放平台验收 `logid`。
4. P1：拿到真实券码/核销数据后，新增 `yy_channel_certificate`。
5. P1：状态事件变多后，新增 `yy_order_status_log`。
6. P1：美团拿到开放平台资料后，把 `MeituanOpenApiClient` 的真实 path、签名、分页字段补齐。
7. P2：把开源项目借鉴点继续补到 `code_map.md` 和 `api_map.md`，保证下次 Codex 不用重新查。
8. P3：有性能数据后再做 Vite 深度拆包，不作为当前抖音/美团闭环前置条件。

## 已补充下载

已执行：

```powershell
cd D:\OtherProject\CameraApp
git clone https://github.com/eahau/douyin-openapi.git D:\OtherProject\CameraApp\douyin-openapi
```

下载后只看 schema/client 组织方式，不把它作为抖音官方依据。抖音正式联调仍以开放平台文档、平台能力状态、真实回调和 `logid` 为准。
