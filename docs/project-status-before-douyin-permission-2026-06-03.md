# 影约云当前状态与明日抖音权限联调清单

更新日期：2026-06-03

## 结论

抖音闭环代码侧已经基本准备好，当前不要继续付款或重复创建商品。明天等抖音 SaaS Oncall 开通当前测试商户的商户直连/库存直连后，先测库存和预约创单，再测接单、核销、订单同步。

管理后台 `admin-ui` 当前可构建，可继续作为主后台推进。用户使用的照相馆系统 `prototype-next` 当前单测、类型检查、lint、生产构建都通过，可作为用户端/照相馆前端继续演示和迭代。

## 抖音 DOUYIN_LIFE 状态

| 项 | 当前状态 |
| --- | --- |
| `client_token` | 已成功 |
| 公网域名 | `yingyueyun.evanshine.me` 已解析到新服务器出口 |
| 服务器出口 IP | `103.24.216.8`，已加白后不再返回 IP 白名单错误 |
| 订单查询 | 本地代码已实现；平台仍返回“应用未获得该能力” |
| 发券 SPI | Spring Boot 正式入口已实现；是否需要三方码白名单由平台验收决定 |
| 预约创单/支付 SPI | 已实现，且已修复下划线事件名落库问题 |
| 接单/拒单 | 已实现；等待真实 `book_id` |
| 整单核销 | 已实现；等待核销权限、真实券码或 `verify_token` |
| 库存 SKU/实时库存/时段库存 | 本地接口和后台入口已实现；等待商户直连/库存直连权限 |

服务器出口 `103.24.216.8` 最新 smoke 结果：

| 接口 | 结果 |
| --- | --- |
| `client_token` | 成功 |
| 库存 SKU | `3000001 无效的库存时间间隔` |
| 实时库存/库存通知 | `2138000360 没有推送该POI套餐权限` |
| 时段库存查询 | `3000007 无该poi创建套餐权限` |

判断：IP 白名单已经不是主阻塞。当前要让平台确认当前应用、测试 POI、测试商品/套餐已经开通商户直连/库存直连，并给出库存 SKU 的合法 `time_slot` 取值。

## 管理后台状态

主后台目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
```

已具备：

| 模块 | 状态 |
| --- | --- |
| 预约订单 | 本地订单列表、渠道状态、抖音同步按钮 |
| 抖音来客联调 | token、查单、同步、库存、接单、核销、logid 展示 |
| 美团渠道 | 授权状态、订单同步、核销记录框架；真实接口待美团资料 |
| 微信/多端入口 | 本地配置和订单状态查询框架 |
| 客户/员工/预约配置/通知/报表 | 第二批企业运营模块页面和接口已补入主线 |

最近验证已通过：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npx eslint vite.config.ts src/main.ts src/views/tool/gen/index.vue src/views/yy/order/index.vue src/views/yy/channel/life/index.vue src/views/yy/components/YyChannelWorkbench.vue src/views/yy/utils/douyinLife.ts src/views/yy/utils/douyinLife.test.ts src/api/yy/channel/index.ts src/api/yy/channel/types.ts src/views/yy/channel/meituan/index.vue
npx vitest run src/views/yy/utils/douyinLife.test.ts
npm run build:dev
```

构建结论：通过，无 circular chunk warning。较大的 Element Plus/VXE chunk 属于后台公共缓存包，不是当前 P0。

## 用户端照相馆系统状态

用户端/照相馆系统目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\prototype-next
```

已具备：

| 模块 | 状态 |
| --- | --- |
| 客户预约页 | 门店、服务组、商品、日期、时段联动选择 |
| 后台页面 | 登录、看板、门店、产品、订单、客户、通知、报表、选片等 |
| API | 预约提交、订单动作、选片、客户、产品、门店等 |
| 数据模型 | Prisma + PostgreSQL |
| 降级演示 | 数据库未启动时预约页有 fallback 数据，便于 UI 演示 |

2026-06-03 验证结果：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\prototype-next
npm test
npm run typecheck
npm run lint
$env:DATABASE_URL='postgresql://camera:camera@localhost:5432/camera_studio?schema=public'; npx prisma validate
$env:DATABASE_URL='postgresql://camera:camera@localhost:5432/camera_studio?schema=public'; npm run build
```

结果：

| 验证 | 结果 |
| --- | --- |
| `npm test` | 21 个测试文件，68 个测试通过 |
| `npm run typecheck` | 通过 |
| `npm run lint` | 通过 |
| `npx prisma validate` | 需要 `DATABASE_URL`；临时设置后通过 |
| `npm run build` | Next.js 生产构建通过 |

## 今天还能做的事

1. 不再付款，不再重复创建商品。
2. 整理抖音平台问题，发给 SaaS Oncall：当前不是 IP 白名单，是 POI/套餐权限和 `time_slot` 参数。
3. 后台继续准备演示：打开订单列表、抖音联调页、库存面板，确认能看到失败摘要和 logid。
4. 用户端继续做照相馆前端体验优化：预约页日期日历、小程序样式、订单状态页、选片页。
5. 美团只推进基础资料准备：开放平台账号、AppKey/AppSecret、门店授权、订单/核销接口文档。

## 明天权限开通后的执行顺序

1. 让平台确认当前测试商户已开通商户直连/库存直连。
2. 从服务器出口或线上 Spring Boot 调库存接口，不从本机直连。
3. 先跑库存 SKU、实时库存、时段库存查询。
4. 创建或编辑测试商品，确认勾选 `抖音APP预约`。
5. 用测试用户在抖音 App 发起预约，不只看“待使用/免预约”。
6. 观察 `/api/douyin/life/reservation/order-create` 是否收到回调。
7. 拿真实 `book_id` 调接单接口，保存 OpenAPI `logid`。
8. 拿真实券码或 `verify_token` 调整单核销接口，保存 OpenAPI `logid`。
9. 最后再跑订单查询/同步，让 `yy_order` 和 `yy_channel_order_mapping` 落库。

## 发给 SaaS Oncall 的确认话术

```text
我们已经从服务器出口 103.24.216.8 调库存接口，不再报 IP 白名单错误。
现在返回：
1. 库存 SKU：3000001 无效的库存时间间隔
2. 实时库存/库存通知：2138000360 没有推送该POI套餐权限
3. 时段库存查询：3000007 无该poi创建套餐权限

请确认当前测试 POI 7571364336015247401、当前生活服务商家应用、当前测试商品/套餐是否已经开通商户直连/库存直连权限，以及库存 SKU 的 time_slot 应该传什么合法值。
```
