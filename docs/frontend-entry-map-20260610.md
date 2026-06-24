# 影约云前端入口地图

更新时间：2026-06-11

## 结论

当前项目不是“网页用户前端 + 小程序用户前端”两套客户代码。

实际分层如下：

| 前端入口 | 作用 | 源码 | 运行 / 导入 |
| --- | --- | --- | --- |
| 系统管理后台网页前端 | RuoYi 系统后台，管理权限、字典、平台配置、影约云基础数据 | `admin-ui` | `http://127.0.0.1:5180/` |
| 门店工作台 PC 端 | 给影楼/门店员工使用：主控台、订单、日程、客片、在线选片、配置 | `studio-workbench` | `http://127.0.0.1:5190/` |
| 客户电脑网页端 | 给客户看品牌、取片、进入相册、查看小程序预约引导；不承载网页预约表单 | `client-web` | `http://127.0.0.1:5200/` |
| 客户取片 H5 调试入口 | 用浏览器预览小程序同款客户取片页面，便于快速联调 | `mobile-uniapp` | `http://127.0.0.1:5174/#/pages/pickup/login/index` |
| 微信小程序客户前端 | 客户在微信里取片、选片、预览、保存 | `mobile-uniapp` | 导入 `mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序客户前端 | 客户在抖音里取片、选片、预览、保存 | `mobile-uniapp` | 导入 `mobile-uniapp\dist\build\mp-toutiao` |

`127.0.0.1:5174` 是 uni-app 的 H5 运行形态，用来本地调试客户取片页面。它不是单独维护的一套“网页用户前端”。

## 代码边界

| 目录 | 定位 | 说明 |
| --- | --- | --- |
| `admin-ui` | 系统管理后台网页前端 | Vue3 + Element Plus + RuoYi 后台，偏平台管理、权限、配置、基础运营数据 |
| `studio-workbench` | 门店工作台 PC 端 | 从 `photoshop-master/frontend` 直接迁入，给影楼/门店员工使用，后续接影约云真实接口 |
| `client-web` | 客户电脑网页端 | 已创建，给客户看品牌、取片、进入相册和小程序预约引导；不调用 `/client/booking/intent`；`/staff` 只跳转门店工作台，不混入门店管理 |
| `mobile-uniapp` | 客户端多端源码 | 一套代码编译 H5、微信小程序、抖音小程序 |
| `backend` | 统一业务后端 | Spring Boot API，负责客户取片、订单、OSS 权限、抖音来客 SPI |
| `prototype-next` | 原型/参考 | 不作为正式生产前端入口 |

## 客户端多端关系

`mobile-uniapp` 同一套页面：

| 页面 | H5 URL | 微信/抖音小程序页面 |
| --- | --- | --- |
| 登录 | `/#/pages/pickup/login/index` | `pages/pickup/login/index` |
| 相册列表 | `/#/pages/pickup/albums/index` | `pages/pickup/albums/index` |
| 照片目录 | `/#/pages/pickup/detail/index?albumId=...` | `pages/pickup/detail/index?albumId=...` |
| 预览/保存 | `/#/pages/pickup/preview/index?albumId=...&assetId=...` | `pages/pickup/preview/index?albumId=...&assetId=...` |
| 结果页 | `/#/pages/pickup/result/index` | `pages/pickup/result/index` |

## 启动与构建

### 管理后台网页

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
pnpm run dev
```

打开：

```text
http://127.0.0.1:5180/
```

2026-06-11 已补一轮系统管理后台订单运营页优化：

- `/yy/order` 首屏增加“交付处理顺序”：先同步订单、再筛不可交付、最后发取片入口。
- 同步动作复用 `syncDouyinOrders(1)`；不可交付筛选复用 `showPhotoDeliveryIssues`；取片说明仍在订单行/详情里通过 `copyOrderPickupShareText` 生成。
- 这页用于平台/运营排障和全渠道订单处理，不替代门店员工日常 PC 工作台。

2026-06-11 已补一轮系统管理后台相册工作台优化：

- `/yy/photo` 相册工作台抽屉增加“本相册待处理清单”，集中提示缺手机号、缺取片码、相册过期、无可见照片、缺 OSS Key、最近访问失败。
- 待处理项复用已有编辑相册、上传照片、查看缺 Key、查看审计动作，不新增接口，不绕过权限。

2026-06-11 已补一轮系统管理后台抖音来客页优化：

- `/yy/channel/life` 真实下单入口配置区增加“P0 来客商品页支付 / 先同步后导出 / P1 小程序 tt.pay”三段操作引导。
- “复制首个入口”复用已维护的 `landingUrl/landingPath`，方便明天配置或演示真实商品页入口。
- “同步近24小时”复用 `syncRecentOrders(1)`；“去订单导出 / 只看来客订单”跳到 `/yy/order?source=DOUYIN_LIFE`，其中导出意图会让订单页自动筛抖音来客订单并提示先确认同步状态。
- `DOUYIN_LIFE` 仍只负责来客商品页真实支付、订单同步和 SPI/OpenAPI；抖音小程序内 `tt.pay` 仍归 `DOUYIN_MINI_APP` 后续独立实现。

### 门店工作台 PC 端

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run dev
```

打开：

```text
http://127.0.0.1:5190/
```

说明：当前 UI 已迁入并品牌化，默认使用 demo fallback；设置 `VITE_STUDIO_DEMO=false` 后走影约云 RuoYi `/yy/*` 列表和 OSS 上传闭环。

2026-06-11 已补一轮门店工作台 UI 抛光：

- `/login` 员工登录页新增“今日要处理”：订单确认、拍摄日程、客片交付、在线选片。
- `/login` 登录表单新增门店管理员角色提示、登录后进入主控台提示和员工入口安全边界。
- `/login` 明确客户入口走客户官网或小程序，不复用门店员工登录态。
- `/` 主控台新增“今日运营看板”：今日待拍、待上传、待选片、待交付，直接从订单、相册、选片链接派生，方便店员先处理当天交付动作。
- `/orders` 预约订单新增“门店订单处理顺序”：今日到店、待确认、待拍摄、选片跟进，并提供只看今日、待确认优先、选片跟进快捷筛选。
- `/schedule` 日程管理新增“今日排期承接”：今日预约、待确认时段、已占用工位、可接待工位，并提供全部时段、只看待确认、只看已确认快捷筛选。
- `/store` 门店管理新增“门店承接概况”：门店总数、营业中、待服务单、本月订单，并提供全部门店、有待服务、营业中、预约制快捷筛选。
- `/config` 在线选片配置新增“产品配置承接”：在售产品、待补规则、本月加片营收、平均加片张数，并提供全部产品、在售产品、已下架、待补规则快捷筛选。
- `/photo-mgmt` 客片管理：增加底片总数、可交付相册、待处理相册摘要；当前相册展示下一步动作、底片数、已选数、选片进度、客户手机号和摄影师。
- `/photo-mgmt` 照片网格：照片卡增加 `Selected / Pending / Picked` 状态标记，补批量选择工具栏、批量标记已选/取消已选、缩略图加载中/失败态；上传/同步按钮在窄屏下保持可点击、不横向挤压。
- `/online-selection` 在线选片：增加今日交付动作看板、临期链接数、已选链接数、下一步提示。
- `/online-selection` 链接列表：状态从纯 `进行中` 升级为 `待客户选 / 待精修 / 临期催选 / 已完成 / 已失效`，复制链接和下载二维码后有明确反馈。
- `/settings` 系统设置：增加工作台安全与运行状态、员工会话、接口模式、客户取片隔离、可运营数据和入口边界说明。
- 两页均补窄屏断点，门店笔记本或小屏浏览时不再硬挤固定宽度。

2026-06-11 已补一轮 `mobile-uniapp` 客户取片 UI 抛光：

- 照片目录页新增选片说明：客户能直接理解“右上角选择、选择顺序就是精修顺序、提交后门店按顺序处理”。
- 预览页新增照片位置进度条和保存安全说明，强调保存原图会重新校验取片身份，不暴露后台地址或长期 OSS 链接。
- 本轮改动同时覆盖 H5 调试入口、微信小程序包、抖音小程序包。

### 客户电脑网页端

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run dev
```

打开：

```text
http://127.0.0.1:5200/
```

当前路由：

| 页面 | URL | 用途 |
| --- | --- | --- |
| 官网首页 | `/` | 展示客户预约、客户取片、门店入口、服务承诺、交付流程和入口边界 |
| 小程序预约引导 | `/booking` | 引导客户进入微信/抖音小程序下单预约，说明统一订单账本和入口边界 |
| 旧预约成功兼容 | `/booking/success` | 旧链接重定向到 `/booking`，不再保留网页预约成功页 |
| 客户取片登录 | `/customer/login` | 手机号 + 取片码入口，已接 `/client/photo/auth/verify`，展示取片前确认、私密授权说明和恢复入口 |
| 客户相册列表 | `/customer/albums` | 登录成功后展示 `/client/photo/albums` 返回的可访问相册、交付概览、交付提醒、门店协助、空状态恢复动作、相册状态和下一步动作 |
| 客户相册详情 | `/customer/albums/:albumId` | 展示相册照片网格、短期预览 URL、原图下载、交付说明、照片目录状态、照片未上传恢复动作和预览翻页 |
| 客户取片结果 | `/customer/result` | 展示错误取片码、无权限、相册过期、系统异常等失败状态和恢复动作 |
| 门店入口 | `/staff` | 跳转 `studio-workbench`，不在官网内管理订单 |

2026-06-11 已补一轮客户电脑网页取片列表 UI 抛光：

- `/customer/albums` 增加可访问相册、照片总数、即将过期三项概览。
- 相册列表补私密取片说明，明确客户只看到手机号授权范围内的相册。
- 相册卡补可查看、即将过期、待上传、暂停查看等可读状态，并显示渠道来源和下一步动作。
- `/customer/albums` 新增交付提醒服务区：打开相册、预览确认、保存原图三步说明，并补“联系门店”延期/重新授权说明。
- `/customer/albums` 空相册状态新增换手机号登录、小程序预约、拨打门店电话三个恢复动作。

2026-06-12 已调整客户电脑网页预约边界：

- `/booking` 已从网页预约表单改成微信/抖音小程序预约引导。
- `/booking/success` 旧链接重定向到 `/booking`。
- `client-web` 已删除 `clientBookingApi.ts` 和旧预约成功页。
- 已新增契约测试，禁止客户电脑网页重新出现 `/client/booking/intent`。
- 客户预约下单只走微信/抖音小程序；管理员后台看全量订单；店员工作台只处理确认、排期、客片上传、选片、核销和异常。

2026-06-11 已补一轮客户电脑网页取片失败结果页：

- `/customer/result` 统一承接错误取片码、无权限、相册过期和系统异常。
- `/customer/login` 登录失败、`/customer/albums` 相册列表读取失败、`/customer/albums/:albumId` 相册详情读取失败都会跳到结果页。
- 结果页提供重新取片、小程序预约、联系门店三个恢复动作。
- 结果页新增处理建议和门店协助卡片，按错误状态显示下一步核对事项、来源位置和拨打门店电话入口。

2026-06-11 已补一轮客户电脑网页首页 UI 抛光：

- `/` 首屏新增小程序预约、门店确认、私密取片三项服务承诺，客户进入官网先看到可执行服务，而不是单纯入口堆叠。
- 首页新增提交预约、到店拍摄、相册交付三步流程，和 `/booking`、`/customer/login` 主链路对应。
- 首页新增套餐选择区：证件照精修、形象照拍摄、家庭纪念照，客户先看到可预约服务再进入表单。
- 首页新增样片交付区：说明照片私有存储、手机号和取片码校验、短期预览链接、原图下载授权。
- 客户取片、门店工作台、系统后台三类入口已用不同卡片语义分层，并补私密访问说明，避免客户误以为后台是自己的入口。

2026-06-11 已补一轮客户电脑网页取片登录页 UI 抛光：

- `/customer/login` 新增取片前确认：预留手机号、门店发送的取片码、相册有效期内。
- 登录页新增私密相册说明，明确客户通过手机号/取片码校验后才生成短期授权，不暴露后台地址或长期 OSS 链接。
- 登录页提供小程序预约、联系门店、返回首页三个恢复入口，客户忘记取片码或未预约时不用卡在表单。
- 客户网页端门店联系方式统一到 `client-web/src/shared/customerSupport.ts`，登录页、结果页、相册列表、详情页和小程序预约引导页不再散落硬编码门店名/电话。

2026-06-11 已补一轮客户电脑网页相册详情页 UI 抛光：

- `/customer/albums/:albumId` 新增交付说明：预览照片、下载原图、联系门店，客户能理解正式交付流程。
- 照片目录新增可预览、生成中、需重试状态摘要，并支持刷新预览和联系门店。
- 预览弹窗新增上一张/下一张和当前位置，客户可连续看图，减少来回关闭弹窗。
- 照片未上传状态新增刷新照片目录、返回相册列表、拨打门店电话三个动作。

### 客户取片 H5 调试

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run dev:h5:api
```

打开：

```text
http://127.0.0.1:5174/#/pages/pickup/login/index
```

### 微信小程序

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-weixin
```

导入微信开发者工具：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

### 抖音小程序

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-toutiao
```

导入抖音开发者工具：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

## 前端交付包

所有前端构建通过后，可以生成统一交付包：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-build-frontend-package.ps1 -Clean -Zip
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\verify-yingyue-frontend-package.ps1 -PackageDir dist\yingyue-frontend-deploy
```

当前交付包结构：

| 包内路径 | 用途 |
| --- | --- |
| `web/admin-ui` | 系统管理后台网页静态产物 |
| `web/client-web` | 客户电脑网页端静态产物 |
| `web/studio-workbench` | 门店工作台 PC 端静态产物 |
| `web/mobile-uniapp-h5` | uni-app H5 调试/兜底产物 |
| `miniapps/mp-weixin` | 微信开发者工具导入目录 |
| `miniapps/mp-toutiao` | 抖音开发者工具导入目录 |

## 客户预约入口边界

客户预约下单只走小程序：

- 微信小程序：后续用于自建套餐、微信支付和预约时段选择。
- 抖音小程序/抖音来客：P0 真实支付走抖音来客商品页，订单同步到本地 `yy_order`；P1 再接抖音小程序内 `tt.pay`。
- 客户电脑网页：只做品牌展示、客户取片和小程序预约引导，不维护网页预约表单。
- 管理员后台：看全渠道订单和主数据。
- 店员工作台：只处理确认、排期、客片上传、选片、核销和异常。

后端历史 `POST /client/booking/intent` 不再由 `client-web` 调用；确认无外部依赖后再安排下线或改为明确废弃响应。

短信验证码、人机校验、真实客服入口和取片失败页客服二维码仍属于 P1。

## 域名配置

小程序后台配置的是纯域名，不带 `https://`：

```text
request合法域名: api.evanshine.me
uploadFile合法域名: api.evanshine.me
downloadFile合法域名: api.evanshine.me
socket合法域名: 暂不填
web-view合法域名: 暂不填
```

代码和 H5 环境变量里使用完整 API 地址：

```text
https://api.evanshine.me
```

## 常见误区

| 误区 | 正确理解 |
| --- | --- |
| `5174` 是网页用户前端 | `5174` 是 uni-app H5 调试入口，和小程序共用源码 |
| `admin-ui` 就是门店工作台 | 不准确，`admin-ui` 是系统管理后台；门店工作台 PC 是 `studio-workbench` |
| `studio-workbench` 是客户网页 | 不准确，它是给门店员工用；客户电脑网页是 `client-web` |
| 客户电脑网页负责预约下单 | 不准确，预约下单只走微信/抖音小程序，客户电脑网页只做取片和小程序预约引导 |
| 微信/抖音要各写一套页面 | 不需要，当前共用 `mobile-uniapp` |
| 抖音小程序处理发券/退款/SPI | 不处理，这些属于后端 `DOUYIN_LIFE` |
| `api.evanshine.me` 是小程序域名 | 它是统一后端 API 域名，小程序只是调用它 |
| 桌面 `微信小程序/yuyue-main` 是正式源码 | 不是，它是朋友项目参考，正式取片端仍是 `mobile-uniapp` |
