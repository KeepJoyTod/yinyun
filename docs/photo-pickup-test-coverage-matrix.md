# 影约云客户取片测试覆盖矩阵

日期：2026-06-08

## 覆盖目标

把当前客户取片端的需求、UI 改动和环境差异映射到可执行测试，避免“代码已改、证据没跟上”。

## Test Coverage Matrix

| Requirement ID | 测试类型 | 测试文件 / 入口 | 测试用例 | 当前状态 | 缺口 |
| --- | --- | --- | --- | --- | --- |
| REQ-H5-001 | smoke | `tools/photo-pickup-smoke.ps1` | `13800003333 / PICK-202606-001` 能完成登录、相册、详情、缩略图签名、预览、stream | PARTIAL | 当前本机 `/stream` 返回 500，需在服务器侧复验 OSS 直连 |
| REQ-H5-002 | manual | `docs/evidence/photo-pickup-h5-browser-20260608.md` | 浏览器登录页、列表页、空态、真实图片目录都能完整展示 | DONE | 无 |
| REQ-H5-003 | smoke | `tools/photo-pickup-smoke.ps1` | `thumbnail-url` / `preview-url` / `stream` 都返回 200 且能加载真实图片 | PARTIAL | `thumbnail-url` 和 `preview-url` 已纳入脚本；`stream` 当前受本机到 OSS 网络/TLS 影响 |
| REQ-H5-004 | manual | H5 预览页 | `上一张/下一张`、`1 / 2`、`2 / 2`、下载按钮状态可见 | DONE | 无 |
| REQ-H5-005 | manual | H5 浏览器存储检查 | token 写入 `window.localStorage`，URL 不暴露 `client_token` | DONE | 无 |
| REQ-H5-006 | manual | `mobile-uniapp/README.md` | `dev:h5` 和 `dev:h5:api` 两种模式说明清晰，避免环境混测 | DONE | 无 |
| REQ-H5-007 | automated browser | `mobile-uniapp/tests/h5-browser-smoke.cjs` / `npm run test:h5` | 三视口自动登录、断言相册客户文案、进入详情、进入预览、断言无技术状态和无遮挡提示 | DONE | 无 |
| REQ-H5-009 | automated browser | `mobile-uniapp/tests/h5-browser-smoke.cjs` / `npm run test:h5` | 断言详情页有“点击照片进入预览”和明确资产动作，预览页有“安全查看” | DONE | 无 |
| REQ-H5-010 | automated browser | `mobile-uniapp/tests/h5-browser-smoke.cjs` / `npm run test:h5` | 预览页打开时不得提前请求 `download-url`；可预览时点击下载再请求；不可预览时下载禁用 | DONE | 无 |
| REQ-H5-011 | automated browser | `mobile-uniapp/tests/h5-browser-smoke.cjs` / `npm run test:h5` | `/stream` URL 不暴露 `client_token`；`stream` 200 时必须是 `image/*`；失败时页面有明确错误态 | DONE | 生产服务器需单独验证 `/stream` 到 OSS 的网络稳定性 |
| REQ-H5-012 | smoke | `tools/photo-pickup-smoke.ps1` | 后端 smoke 同时验证 `thumbnail-url`、`preview-url`、`download-url`、`/stream` 响应类型；失败时输出 JSON/HTML/empty 分类 | DONE | 当前本机因 VPN/代理影响 OSS 443，`/stream` 仍需服务器侧复验 |
| REQ-H5-013 | contract | `mobile-uniapp/tests/photo-pickup-smoke-contract.test.cjs` / `npm test` | 防止后端 smoke 回退漏测 `thumbnail-url` | DONE | 无 |
| REQ-H5-008 | unit | `mobile-uniapp/tests/preview-state.test.cjs` / `npm test` | 预览图加载成功/失败、下载禁用、详情失败态、深链返回 | DONE | 无 |
| REQ-BE-001 | unit | `YyClientPhotoServiceImplTest` | 相册 ID 字符串、可见资产过滤、封面字段、签名 URL 元数据 | DONE | 无 |
| REQ-BE-002 | unit | `YyPhotoAccessLogServiceImplTest` | 访问审计按相册、底片、手机号、平台、动作、成功状态筛选并分页 | DONE | 无 |
| REQ-BE-003 | security | `YyClientPhotoServiceImplTest` | 客户 token 绑定登录时匹配到的相册集合；相同手机号不同取片码不能跨相册访问 | DONE | 后续补真实租户插件集成测试 |
| REQ-BE-005 | unit | `YyClientPhotoControllerTest` | `/stream` 设置图片头；OSS 读取失败时返回 JSON 错误体而不是空 500 | DONE | 无 |
| REQ-BE-004 | data quality | `YyPhotoAccessLogServiceImplTest` | 加密手机号审计筛选可用，查询同时覆盖明文手机号和 `ENC_...` 加密手机号 | DONE | 无 |
| REQ-ADMIN-001 | unit | `admin-ui/src/views/yy/utils/photoUpload.test.ts` / `npm run test:yy` | 后台上传排序按 `max(sort)+1`，上传后底片列表查询参数锁定当前相册 | DONE | 无 |
| REQ-ADMIN-001B | unit | `admin-ui/src/views/yy/utils/photoUpload.test.ts` / `npm run test:yy` | 原图和缩略图上传成功但创建底片失败时，重试创建底片必须保留 `thumbnailObjectKey` | DONE | 无 |
| REQ-ADMIN-002 | build | `admin-ui/src/views/yy/photo/index.vue` / `npm run build:dev` | 客片选片增加“访问审计”Tab，并支持从相册/底片行一键过滤日志 | DONE | 无 |
| REQ-ADMIN-003 | build | `admin-ui/src/views/yy/photo/index.vue` / `npm run build:dev` | 访问审计 Tab 懒加载；多图上传成功后保留上传结果清单，不自动跳转打断操作 | DONE | 后续补 UI e2e 更稳 |
| REQ-ADMIN-004 | build | `admin-ui/src/views/yy/photo/index.vue` / `npm run build:dev` | 上传中防误关闭、上传汇总、相册行查看底片、审计失败红色标签 | DONE | 后续补后台 Playwright e2e |
| REQ-ACC-001 | acceptance | `tools/photo-pickup-local-acceptance.ps1` | 一键串起 mobile typecheck、unit、H5 browser smoke、三端构建、平台 readiness local checks、后台 `test:yy`、后台 `build:dev`、后端 smoke、后端目标单测 | DONE | 快速路径 `-SkipH5Browser -SkipBackendSmoke -SkipBackendUnit` 已通过；默认已包含后台检查，可用 `-SkipAdminCheck` / `-SkipAdminBuild` 跳过 |
| REQ-MP-001 | build | `npm run build:mp-weixin` | 微信小程序产物可构建并导入开发者工具 | DONE | 还需人工导入确认 |
| REQ-MP-002 | build | `npm run build:mp-toutiao` | 抖音小程序产物可构建并导入开发者工具 | DONE | 还需人工导入确认 |
| REQ-MP-004 | acceptance | `tools/yingyue-platform-readiness.ps1` | 输出微信/抖音开发者工具导入目录和 request/upload/download 合法域名填写值 | DONE | 无 |
| REQ-MP-003 | manual | 微信 / 抖音开发者工具 | 登录、相册、详情、预览、保存图片 | MISSING | 需导入开发者工具和真机侧验证 |
| REQ-OPS-003 | evidence | `tools/new-photo-pickup-real-oss-evidence.ps1` | 真实图片验收前生成包含生产预检、本地总验收、小程序导入、合法域名、H5/小程序/审计表的证据文件；支持 `-RunPreflight` / `-RunLocalAcceptance` 自动采集脱敏输出；自动剥离 OSS 签名查询参数；分离“命令结论”和“最终结论”，最终 `PASS` 需要 `-ConfirmManualAcceptance` | DONE | 等上传真实图后填写实际结果 |
| REQ-OPS-001 | manual | 后台相册管理 | 上传真实测试图后，目录缩略图和预览链路复验 | PARTIAL | 需要实际上传一张新图 |
| REQ-OPS-002 | manual | 后台审计日志 | 访问、预览、下载日志可在后台“访问审计”Tab 查询 | DONE | 线上账号需具备 `yy:photoAccessLog:list` 权限；导出需 `yy:photoAccessLog:export` |

## 已有自动化

- `npm run typecheck`
- `npm test`（当前 32 passed）
- `npm run test:h5`
- `npm run build:h5`
- `npm run build:mp-weixin`
- `npm run build:mp-toutiao`
- `tools/photo-pickup-smoke.ps1`（已覆盖 thumbnail-url；当前 stream 环境项待复验）
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoControllerTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `tools/yingyue-production-preflight.ps1`
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `tools/photo-pickup-local-acceptance.ps1`（已接入平台 readiness local checks、后台 `test:yy`、后台 `build:dev`）
- `tools/new-photo-pickup-real-oss-evidence.ps1`（真实图片验收证据生成）
- `admin-ui`: `npm run test:yy`（当前 49 passed）
- `admin-ui`: `npm run build:dev`
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyPhotoAccessLogServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest,YyPhotoAlbumServiceImplTest,ClientPhotoMiniAppPhoneAuthProviderTest" test`（当前 25 passed）
- `docs/yingyue-project-detection-runbook.md`

## 下一步测试计划

1. 在生产/准生产服务器复验 `/client/photo/assets/{assetId}/stream` 到 OSS 的网络稳定性；本机 VPN/代理/TUN 会导致 OSS 443 连接被拒或中途关闭。
2. 上传真实摄影大图，复验目录、预览、下载和上传大小限制。
3. 导入微信开发者工具，验证小程序端真实页面。
4. 导入抖音开发者工具，验证小程序端真实页面。
5. 做微信/抖音真机保存图片。
6. 补后台 UI e2e，覆盖访问审计 Tab、相册/底片行过滤和审计导出按钮权限。
7. 补真实租户插件集成测试，验证 token scope 与数据库租户隔离同时生效。
