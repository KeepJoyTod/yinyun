# 朋友项目吸收优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把朋友交接的前端优化项目和小程序项目安全吸收到正式影约云，优先补齐在线选片、后台排障、小程序验收和平台联动。

**Architecture:** 正式代码只落在 `D:\OtherProject\CameraApp\yingyue-cloud-repo`。朋友项目作为只读参考，抽取页面结构、交互模型和字段设计；核心后端、主订单、主相册、OSS 权限仍由 Spring Boot + RuoYi 承载。

**Tech Stack:** RuoYi Vue Plus / Spring Boot / MyBatis Plus / Vue 3 / Element Plus / uni-app / 阿里云 OSS / 抖音生活服务 OpenAPI。

---

## File Structure

| 类型 | 文件 | 责任 |
| --- | --- | --- |
| 后台相册 | `admin-ui/src/views/yy/photo/index.vue` | 上传照片、相册列表、访问审计、取片入口、后续在线选片结果 |
| 后台照片工具 | `admin-ui/src/views/yy/utils/photoUpload.ts` | OSS 上传结果转 `yy_photo_asset` |
| 后台取片入口 | `admin-ui/src/views/yy/utils/photoPickupEntry.ts` | 取片链接、取片码、分享话术、二维码数据 |
| 后台订单 | `admin-ui/src/views/yy/order/index.vue` | 订单一屏排障、相册跳转、访问审计跳转 |
| 客户取片 API | `mobile-uniapp/src/api/clientPhoto.ts` | `/client/photo/*` 请求封装 |
| 客户取片类型 | `mobile-uniapp/src/types/clientPhoto.ts` | album/asset/token/selection 类型 |
| 客户相册详情 | `mobile-uniapp/src/pages/pickup/detail/index.vue` | 照片目录、选片勾选、提交 |
| 客户预览页 | `mobile-uniapp/src/pages/pickup/preview/index.vue` | 大图预览、保存、错误诊断 |
| 客户后端 Controller | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientPhotoController.java` | 客户取片接口 |
| 客户后端 Service | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPhotoServiceImpl.java` | 权限校验、相册、照片、签名 URL、选片提交 |
| 地图文档 | `docs/friend-project-handover-master-map-20260609-latest.md` | 当前交接总图 |

## Task 1: 稳定当前地图与边界

**Files:**
- Modify: `docs/friend-project-handover-master-map-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\README.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\前端优化\README.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\抖音小程序\README.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\wechatapp\README.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\douyinapp\README.md`

- [x] **Step 1: 明确源码唯一性**

写清：正式源码只在 `yingyue-cloud-repo`；`photoshop-master` 和 `yuyue-main` 都是参考资产。

- [x] **Step 2: 明确小程序导入路径**

微信导入 `mobile-uniapp\dist\build\mp-weixin`；抖音导入 `mobile-uniapp\dist\build\mp-toutiao`。

- [x] **Step 3: 明确平台边界**

`DOUYIN_LIFE` 负责生活服务 SPI；`DOUYIN_MINI_APP` 只负责客户取片。

- [x] **Step 4: 验证文档引用**

Run:

```powershell
rg "photoshop-master|yuyue-main|mobile-uniapp|api.evanshine.me" D:\OtherProject\CameraApp\yingyue-cloud-repo\docs C:\Users\Administrator\Desktop\yiyue
```

Expected: 能看到参考项目、正式项目、API 域名的统一说明。

Result: 2026-06-09 已验证，`README`、`latest-index`、总控执行图均能检索到 `photoshop-master`、`yuyue-main`、`mobile-uniapp`、`api.evanshine.me`、`mp-weixin`、`mp-toutiao`。

## Task 2: 在线选片最小模型

**Files:**
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientPhotoController.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPhotoServiceImpl.java`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyClientPhotoServiceImplTest.java`
- Modify: `mobile-uniapp/src/api/clientPhoto.ts`
- Modify: `mobile-uniapp/src/types/clientPhoto.ts`
- Modify: `mobile-uniapp/src/pages/pickup/detail/index.vue`

- [x] **Step 1: 后端测试先行**

新增测试：客户只能提交自己相册内 `visible=1` 且 `objectKey` 非空的照片 ID；越权 asset 必须失败。

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoServiceImplTest" test
```

Expected: 新测试先失败。

- [x] **Step 2: 增加提交接口**

新增：

```text
POST /client/photo/albums/{albumId}/selection
```

请求体：

```json
{
  "assetIds": ["2063173289800183809"]
}
```

规则：

- 用 `X-Client-Token` 校验身份。
- 校验相册归属、有效期、状态。
- 只允许当前相册可见照片。
- 选中的照片 `isSelected=1`，其他可见照片 `isSelected=0`。
- 相册 `selectionStatus` 更新为 `SUBMITTED`。

- [x] **Step 3: 移动端接接口**

`mobile-uniapp/src/api/clientPhoto.ts` 增加 `submitAlbumSelection(albumId, assetIds)`。

- [x] **Step 4: 详情页增加选择模式**

`detail/index.vue`：

- 图片卡片保留“预览”入口。
- 右上角或底部增加触控友好的选择按钮。
- 底部固定栏显示已选数量和“提交选片”。
- 提交成功后刷新详情。

- [x] **Step 5: 验证**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

Result: `YyClientPhotoServiceImplTest`、`npm test`、`npm run typecheck`、`npm run build:mp-weixin`、`npm run build:mp-toutiao` 已通过。

## Task 3: 后台选片结果展示

**Files:**
- Modify: `admin-ui/src/views/yy/photo/index.vue`
- Modify: `admin-ui/src/views/yy/utils/photoPageContract.test.ts`

- [x] **Step 1: 增加选片摘要**

相册行展示：

```text
选片状态：WAITING / SUBMITTED / COMPLETED
已选照片：N / 总可见照片
```

首版以“查看已选”快捷入口实现，不新增聚合接口；点击后按当前相册筛选已选且可见底片。

- [x] **Step 2: 底片表保留筛选**

底片列表支持按 `isSelected=1` 查看客户已选照片。

- [x] **Step 3: 增加确认操作**

后台可把 `selectionStatus` 从 `SUBMITTED` 确认到正式状态。当前系统已有 `COMPLETED` 选项，首选复用 `COMPLETED`，避免新增未落库/未约定的 `CONFIRMED` 状态；如果后续产品明确需要“确认”和“完成交付”分开，再新增 `CONFIRMED`。

落地结果：相册行新增“确认选片”按钮，仅对 `selectionStatus === 'SUBMITTED'` 显示，复用现有 `PUT /yy/photoAlbum` 将状态更新为 `COMPLETED`。

- [x] **Step 4: 验证**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

Expected: 测试和构建通过。

当前证据：`npm run test:yy` 已通过，5 个测试文件、26 个用例通过；`npm run build:dev` 已通过。

补充状态：后台相册“取片入口”已包含 H5 / 微信小程序 / 抖音小程序三端入口说明，客户分享话术会同时带三端入口，并通过测试保证不暴露后台、OSS、`/dev-api` 地址。

## Task 4: 小程序真机验收清单

**Files:**
- Modify: `docs/miniapp-preview-checklist-20260609.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\wechatapp\miniapp-preview-checklist-20260609.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\douyinapp\miniapp-preview-checklist-20260609.md`

- [ ] **Step 1: 微信开发者工具导入**

导入：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

AppID：

```text
wx2a1a34748f56a6c6
```

- [ ] **Step 2: 抖音开发者工具导入**

导入：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

AppID：

```text
tta3c8d5753dac3aae01
```

- [ ] **Step 3: 合法域名检查**

两端都配置：

```text
https://api.evanshine.me
```

用于 request、downloadFile、uploadFile。

- [ ] **Step 4: 客户取片验收**

验证：

- 手机号 + 取片码登录。
- 相册列表。
- 空相册状态。
- 有图相册预览。
- 保存图片权限提示。
- token 过期后重新登录。

## Task 4.5: 后台相册运营排障视图首版

**Files:**
- Modify: `admin-ui/src/views/yy/photo/index.vue`
- Create: `admin-ui/src/views/yy/utils/photoOperationsHealth.ts`
- Create: `admin-ui/src/views/yy/utils/photoOperationsHealth.test.ts`
- Modify: `admin-ui/src/views/yy/utils/photoPageContract.test.ts`

- [x] **Step 1: 增加纯函数测试**

覆盖相册是否可交付、缺手机号、缺取片码、无照片、缺 OSS Key、最近失败访问等判断。

- [x] **Step 2: 增加运营排障列**

相册列表新增 `运营排障` 列，显示：

```text
可交付 / 需确认 / 需处理
下一步建议
手机号状态
客户取片码状态
照片 visible/total
已选 selected
缺 Key missing
最近失败访问
```

- [x] **Step 3: 增加审计快捷入口**

排障列可直接触发当前相册的访问审计筛选。

- [x] **Step 4: 验证**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

Result: `test:yy` 31 条用例通过，`build:dev` 通过。

下一步：首版只使用当前页已加载的底片和审计日志，后续应补后端批量聚合接口，避免分页/筛选导致统计偏低。

## Task 5: 抖音生活服务和相册联动

**Files:**
- Modify: `docs/douyin-life-current-status.md`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/*`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientPhotoServiceImpl.java`

- [ ] **Step 1: 支付/预约成功后幂等关联相册**

当 `DOUYIN_LIFE` 订单有手机号、订单号、券码时，创建或复用相册：

```text
channel_type=DOUYIN_LIFE
customer_phone=订单手机号
douyin_order_id=抖音订单号
certificate_code=券码
selection_status=WAITING
```

- [ ] **Step 2: logid 排障保持**

所有 SPI 记录 `X-Bytedance-Logid`，OpenAPI 记录 `extra.logid` 或 `logid`。

- [ ] **Step 3: 验证**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

Expected: 能看到 client_token 状态、订单查询状态和最近 logid。

## Task 6: 朋友项目地图持续维护

**Files:**
- Modify: `docs/friend-project-takeover-and-optimization-master-plan-20260609.md`
- Modify: `docs/frontend-reference-takeover-map-20260609.md`
- Modify: `docs/douyin-miniapp-official-map-20260609.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\朋友项目接手与优化总规划-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\前端优化\前端优化-接手总图-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\抖音小程序\抖音小程序-接手总图-20260609-latest.md`

- [x] **Step 1: 明确朋友项目和正式项目边界**

写清：`photoshop-master`、`yuyue-main` 是参考资产；正式代码只在 `yingyue-cloud-repo`。

- [x] **Step 2: 明确正式抖音小程序来源**

写清：正式抖音小程序是 `mobile-uniapp` 的 `mp-toutiao` 构建产物，AppID 为 `tta3c8d5753dac3aae01`。

- [x] **Step 3: 明确前端优化吸收路线**

写清：相册运营、在线选片、二维码、选片规则、日程库存是吸收重点；不迁移 Demo 后端、MinIO、Tailwind/Radix。

- [ ] **Step 4: 验证地图可检索**

Run:

```powershell
rg "正式源码|photoshop-master|yuyue-main|mp-toutiao|api.evanshine.me" D:\OtherProject\CameraApp\yingyue-cloud-repo\docs C:\Users\Administrator\Desktop\yiyue
```

Expected: 能检索到 repo 和桌面两份地图。

## Task 7: 朋友项目深度扫描沉淀

**Files:**
- Modify: `docs/friend-project-handover-master-map-20260609-latest.md`
- Modify: `docs/friend-photoshop-master-code-map-20260609.md`
- Modify: `docs/friend-yuyue-main-code-map-20260609.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\朋友项目接手与优化总规划-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\前端优化\前端优化-代码地图-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\前端优化\前端优化-功能地图-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\前端优化\前端优化-优化计划-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\抖音小程序\抖音小程序-代码地图-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\抖音小程序\抖音小程序-优化计划-20260609-latest.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\wechatapp\latest-index.md`
- Modify: `C:\Users\Administrator\Desktop\yiyue\douyinapp\latest-index.md`

- [x] **Step 1: 标明参考项目副本关系**

写清：

```text
C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master
D:\OtherProject\CameraApp\photoshop-master
C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main
D:\OtherProject\CameraApp\yuyue-main
```

都是参考资产，不是正式生产源码。

- [x] **Step 2: 补齐 `photoshop-master` 深度地图**

记录：

- Vue 3 + Vite + TypeScript + Tailwind v4 + Radix Vue。
- 入口：`main.ts`、`App.vue`、`router/index.ts`。
- 重点页面：订单、日程、客片、在线选片、选片规则。
- 风险：`.env`、localhost 代理、MinIO、硬编码尺寸、Demo 数据。

- [x] **Step 3: 补齐 `yuyue-main` 深度地图**

记录：

- Taro 4.1.9 + React 18 + TypeScript + Zustand。
- 入口：`client/src/app.tsx`、`client/src/app.config.ts`。
- 重点页面：首页、服务、预约确认、订单、底片、我的、手机号登录。
- 风险：不迁移 Taro、Demo 后端、旧 project 配置、平台专有 API。

- [x] **Step 4: 补齐优化队列**

规划：

```text
P0 小程序真机验收、真实测试图闭环
P1 相册运营排障、手机号授权、抖音订单自动相册
P2 预约库存看板、加片统计、精修交付流
```

- [ ] **Step 5: 检索验证**

Run:

```powershell
rg "深度扫描|Taro 4.1.9|Tailwind v4|相册运营排障|DOUYIN_LIFE" D:\OtherProject\CameraApp\yingyue-cloud-repo\docs C:\Users\Administrator\Desktop\yiyue
```

Expected: repo docs 和桌面地图都能检索到最新结论。

## Final Verification

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest" test
```
