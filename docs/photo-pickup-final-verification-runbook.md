# 影约云客户取片最终验证 Runbook

日期：2026-06-08

## 目标

把当前已经完成的 H5 主链路、UI 收口、构建验证、后台审计页，推进到“真实图片上传 + 小程序导入 + 真机保存 + 线上审计复验”四个最终验收点。

## 先决条件

- 本地后端已启动：`.\tools\start-yingyue-local.ps1 -SkipFrontend -SkipPrototype`
- H5 本地代理模式：`npm run dev:h5`
- H5 直连公网 API 模式：`npm run dev:h5:api`
- 微信小程序构建产物：`mobile-uniapp/dist/build/mp-weixin`
- 抖音小程序构建产物：`mobile-uniapp/dist/build/mp-toutiao`

## 1. 真实图片上传复验

### 目标

上传 1 张新的真实测试图，确认后台相册、缩略图、预览 URL、下载 URL、私有 OSS 裸链拦截和 `/stream` 都能闭环。

### 先打印字段清单

如果还没有拿到手机号、取片码、相册 ID、底片 ID 或 OSS 裸链，先运行：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs
```

该命令只打印准备清单，不生成证据文件。

上传真实图后，推荐先用自动解析模式：只填手机号和取片码，脚本会通过 `/client/photo/auth/verify`、`/client/photo/albums` 和 `preview-url` 自动解析相册 ID、底片 ID、OSS 裸链和 objectKey：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance
```

H5、微信小程序、抖音小程序和后台审计都人工确认后，最终 PASS 也优先使用自动解析模式：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
```

### 操作

1. 在后台相册管理页进入目标相册。
2. 点击“上传照片”。
3. 上传 1 张新的测试图。
4. 上传成功后后台会自动切到“底片列表”并按当前相册过滤。
5. 在上传结果表确认 `OSS Key` 有值，底片记录 `visible=1`、`isSelected=0`。
6. 刷新相册详情页，确认缩略图更新。
7. 打开预览页，确认新图可见。
8. 点击下载，确认下载成功。
9. 复制该底片对应的 OSS 裸对象 URL，不带签名 query，跑 smoke 脚本验证返回 `403`。

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001 -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
```

### 通过标准

- 相册列表能看到新图数量变化。
- 目录页缩略图能稳定加载。
- 预览页主图能显示新图。
- 下载按钮能触发真实下载。
- 裸 OSS 链接返回 `403`。
- `thumbnail-url`、`preview-url`、`download-url` 均返回短期 URL、文件名、内容类型和过期时间。
- `/stream` 返回 `200 image/*` 和 `Content-Disposition`；如果小程序合法域名限制 OSS 签名域名，则正式走 `/stream`。
- 后台 `npm run test:yy` 通过。
- 后台 `npm run build:dev` 通过。

## 2. H5 本地代理模式回归

### 目标

确认 `npm run dev:h5` 在本地代理模式下仍可完成真实客户闭环。

### 账号

```text
手机号：13800003333
取片码：PICK-202606-001
相册 ID：903001
```

### 操作

1. 启动本地代理模式：`npm run dev:h5`
2. 打开：`http://127.0.0.1:5174/#/pages/pickup/login/index`
3. 登录后进入相册页。
4. 打开相册详情。
5. 打开预览页。
6. 点击“下一张”。
7. 点击“下载原图”。

自动化回归：

```bash
npm test
npm run test:h5
```

后端目标单测：

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test
```

完整本地验收：

```powershell
.\tools\photo-pickup-local-acceptance.ps1
```

如果本机 VPN / 代理导致 `/stream` 拉 OSS 不稳定，可先做分层验收：

```powershell
.\tools\photo-pickup-local-acceptance.ps1 -SkipPhotoStream
```

该模式仍会验证移动端类型检查、单测、H5 冒烟、小程序构建，以及后端 `auth / albums / detail / preview-url / download-url`，只跳过后端代理流。

### 通过标准

- 登录成功后稳定进入详情页。
- 详情页显示真实图片缩略图。
- 预览页显示真实图片和序号。
- 预览页打开时不提前请求 `download-url`。
- 点击下载按钮后才请求 `download-url` 做权限校验，并通过 `/stream` 触发实际文件下载。
- token 保持在 `window.localStorage`，URL 不暴露 `client_token`。
- `npm run test:h5` 输出 `ok: true`，并生成 `output/h5-browser-smoke` 截图。
- 后端目标单测输出 `Tests run: 7, Failures: 0, Errors: 0, Skipped: 0`。
- `photo-pickup-local-acceptance.ps1` 最终输出 `photo pickup local acceptance: passed`。

## 3. H5 直连公网 API 模式边界

### 目标

确认 `npm run dev:h5:api` 主要用于线上域名和权限边界验证。

### 账号

```text
手机号：13900001111
取片码：PREVIEW-20260608
```

### 操作

1. 启动直连公网 API 模式：`npm run dev:h5:api`
2. 用预览账号访问真实相册。

### 通过标准

- 对真实相册返回权限失败或无权限提示时，页面按预期清 token 并留在入口页。
- 这类失败要记录为权限回退，不记录为路由 bug。

## 4. 微信小程序导入

### 目标

确认微信构建产物能导入开发者工具，并可完成登录、列表、详情、预览。

### 操作

1. 运行：`npm run build:mp-weixin`
2. 导入目录：`D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin`
3. 配置 `request/download/upload` 合法域名为 `https://api.evanshine.me`
4. 完成登录、列表、详情、预览验证。

### 通过标准

- 构建成功。
- 页面能正常打开。
- 图片能预览。

## 5. 抖音小程序导入

### 目标

确认抖音构建产物能导入开发者工具，并可完成登录、列表、详情、预览。

### 操作

1. 运行：`npm run build:mp-toutiao`
2. 导入目录：`D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao`
3. 配置合法域名。
4. 完成登录、列表、详情、预览验证。

### 通过标准

- 构建成功。
- 页面能正常打开。
- 图片能预览。

## 6. 真机保存图片

### 目标

验证微信和抖音真机上的保存权限和图片保存能力。

### 操作

1. 在真机打开预览页。
2. 点击“保存图片”或“下载原图”。
3. 如果失败，检查相册权限引导、合法域名和 `/stream` 返回。

### 通过标准

- 微信真机可保存到系统相册。
- 抖音真机可保存到系统相册。

## 7. 后台访问审计复验

### 目标

确认客户登录、相册详情、预览、下载、代理流日志可以在后台查到。

### 操作

1. 客户端完成一次登录、打开目录、打开预览、下载原图。
2. 后台进入“客片选片”。
3. 打开“访问审计”Tab。
4. 用相册 ID、底片 ID、手机号、平台、动作筛选。
5. 从相册行或底片行点击“查看审计”，确认可自动切换并过滤。

### 通过标准

- 可看到 `VERIFY`、`ALBUM_DETAIL`、`PREVIEW`、`DOWNLOAD`、`STREAM` 等动作。
- 成功状态、IP、备注字段可用于排障。
- `npm run build:dev` 通过。
- `YyPhotoAccessLogServiceImplTest` 通过。

## 8. 证据记录

每次验收至少保留：

- 浏览器截图
- 网络请求列表
- 控制台错误
- 运行命令输出

建议放入：

```text
docs/evidence/
output/playwright/
```

真实 OSS 验收证据可以直接生成。优先用自动解析模式：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance
```

人工完成 H5、微信小程序、抖音小程序和后台审计后，优先用自动解析生成最终 PASS 证据：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
```

如果自动解析找不到目标相册或你要指定某一张底片，再使用手填模式：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -ObjectKey "<object-key>" -RunPreflight -RunLocalAcceptance
```

脚本会同时生成：

- `docs/evidence/photo-pickup-real-oss-acceptance-*.md`：人工可读验收记录。
- `docs/evidence/photo-pickup-real-oss-acceptance-*.json`：机器可读摘要，包含证据文件路径、命令结论、最终结论、执行开关、手机号/取片码/相册 ID/底片 ID/objectKey、已剥离签名参数的 HTTPS 阿里云 OSS 裸对象 URL。
- `docs/evidence/photo-pickup-release-status.json`：最新发布状态。若 `-SummaryJsonPath` 指向其他目录，该文件会跟随写入同一目录。

生成脚本会自动校验 JSON 摘要。需要复核时，默认校验最新一份真实 OSS JSON 摘要：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1
```

最终发布前必须先看项目总状态，再加严客户取片状态：

```powershell
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -AsJson
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -OutputJsonPath ".\docs\evidence\yingyue-delivery-status.json"
.\tools\get-photo-pickup-release-status.ps1
.\tools\get-photo-pickup-release-status.ps1 -AsJson
.\tools\get-photo-pickup-release-status.ps1 -OutputJsonPath ".\docs\evidence\photo-pickup-release-status.json"
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1 -RequireFinalPass
.\tools\verify-photo-pickup-release-gate.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012"
```

`get-yingyue-delivery-status.ps1` 是项目级状态诊断，会聚合前端产物、平台 readiness、客户取片发布状态和外部人工阻塞项。它的 `READY_FOR_EXTERNAL_ACCEPTANCE` 只表示代码和构建产物可以进入微信/抖音后台、开发者工具、真机和抖音来客真实回调验收；只有没有失败项且 `externalBlockers` 为空时才会输出 `READY`。

`get-photo-pickup-release-status.ps1` 是只读诊断，会输出 `READY/BLOCKED` 和缺失项；`nextCommands` 会直接给出上传真实私有 OSS 图片、运行 `-PrintRequiredInputs`、生成自动证据、生成最终 PASS 证据、跑发布总闸门的可复制命令链。旧版或残缺证据 JSON 没有 `manualChecks` 时会被判为缺人工验收的 `BLOCKED`，不会打断诊断流程；最新 summary JSON 损坏不可读时，会报告缺少 `readable real OSS evidence summary` 并提示重新生成证据。`-AsJson` 输出机器可读状态，包含 `preflightRan` 和 `localAcceptanceRan`，适合 CI、部署包和自动化交接读取；`-OutputJsonPath` 可把同一份状态无 BOM 写入 JSON 文件。如果未加人工确认或自动命令未通过，`-RequireFinalPass` 会失败，不能作为最终验收通过。`verify-photo-pickup-release-gate.ps1` 是最终总闸门，默认会先跑本地客户取片验收，再要求最新真实 OSS 证据为最终 `PASS`。

自动化需要读取总闸门时，使用 `.\tools\verify-photo-pickup-release-gate.ps1 -AsJson -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012"`。该模式只输出 JSON，阻塞时退出码仍为非 0；`status=PASSED` 才能作为发布通过，`BLOCKED` 和 `PARTIAL` 都不能交付。若不传 `-BaseUrl`，总闸门会沿用本地验收默认地址 `http://127.0.0.1:8080`。

注意：任何跳过参数都只用于排查本地或部署包流程，包括 `-SkipLocalAcceptance` 和 `-SkipRealOssFinalPass`；只要用了跳过参数，总闸门会输出 `photo pickup release gate: partial only`。正式发布不能用这个输出作为通过依据，必须跑不带跳过参数的总闸门并看到 `photo pickup release gate: passed`。

如果单独运行 `verify-photo-pickup-real-oss-summary.ps1`，坏 JSON 会明确返回 `summary json is not readable`，字段残缺会返回 `summary field missing: <字段名>`。最终发布前加 `-RequireFinalPass` 时，summary 还必须证明 `preflightRan=true` 和 `localAcceptanceRan=true`，不能只靠手写 `PASS` 结论放行。状态诊断还会把不存在的证据 Markdown、错配的 `summaryJsonPath`、带签名参数或非 HTTPS 阿里云 OSS 对象域名的 `bareOssUrl`、缺少手机号/取片码/相册 ID/底片 ID 的输入判为 `BLOCKED`。summary 校验器和状态诊断的布尔闸门都只接受真实布尔 `true` 或字符串 `"true"`；字符串 `"false"` 不会被当作通过。这些错误都说明证据不能用于最终发布，正确处理方式是重新生成真实 OSS 证据，而不是手工补 JSON。

总闸门默认先做状态预检：如果 `get-photo-pickup-release-status.ps1 -AsJson` 返回 `BLOCKED`，会直接停止并打印缺失项，不再跑耗时的本地验收。先按 `nextCommands` 补真实 OSS 证据，再重新跑总闸门。

如果本次要交付部署包，生成或收到包后必须先验包：

```powershell
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check"
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check" -AsJson
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check" -OutputJsonPath ".\dist\yingyue-api-deploy-check\docs\evidence\yingyue-deploy-package-status.json"
```

该脚本只读检查部署包是否包含 JAR、环境样例、PostgreSQL SQL、真实 OSS 证据工具、发布状态/总闸门工具、最终 Runbook 和 README。它还会执行包内 `tools/verify-photo-pickup-release-gate.ps1 -AsJson`，确认总闸门 JSON 输出可解析，并在结果里记录 `release-gate-json:self-check`。同时会记录 `secret-files:denylist`，阻止真实 `.env.production`、`.env.local`、`APPSecret`、`AccessKey` 或 Secret 命名文件误入包内，样例 `backend/.env.production.example` 允许存在。缺项、JSON 不可解析或敏感文件命中会直接失败，不把缺工具或带密钥的包交给服务器或下一个接手人。

注意：部署包校验 `PASS` 不等于客户取片最终发布通过。若 `release-gate-json:self-check` 显示 `status=BLOCKED exit=1 stage=releaseStatus`，说明包没问题，但真实 OSS 证据还没完成，必须继续跑真实图验收直到总闸门 `status=PASSED`。

如果证据目录不在默认 `docs/evidence`，例如部署包或临时证据目录，三条命令都可以指定同一个 `-EvidenceRoot`：

```powershell
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence"
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence" -AsJson
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence" -OutputJsonPath ".\docs\evidence\photo-pickup-release-status.json"
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1 -EvidenceRoot ".\docs\evidence" -RequireFinalPass
.\tools\verify-photo-pickup-release-gate.ps1 -EvidenceRoot ".\docs\evidence"
```

人工验收可以拆分确认，也可以一次性确认。JSON 摘要会写入结构化人工验收结果：

- `manualChecks.h5Pickup`
- `manualChecks.wechatMiniapp`
- `manualChecks.douyinMiniapp`
- `manualChecks.adminAudit`

可分别使用 `-ConfirmH5Pickup`、`-ConfirmWechatMiniapp`、`-ConfirmDouyinMiniapp`、`-ConfirmAdminAudit`；旧的 `-ConfirmManualAcceptance` 仍保留为一次性确认四项。

最终发布前 `-RequireFinalPass` 会要求四项都为 `true`；如果缺少某一项，会输出类似 `manual check missing: wechatMiniapp` 的明确错误。

需要排查指定历史证据时，再手动传具体 JSON 路径：

```powershell
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "docs/evidence/photo-pickup-real-oss-acceptance-<时间戳>.json"
```

## 9. 已知边界

- `vue-router` 的 deprecation warning 来源于依赖链，可忽略。
- `dev:h5` 是本地代理模式，`dev:h5:api` 是直连公网 API 模式，不能混着测。
- 预览账号 `13900001111 / PREVIEW-20260608` 访问真实相册会返回无权限，这是预期回退。
- 客户 token 写入 `window.localStorage`，不是 `sessionStorage`。
- 后台访问审计已拆独立权限：查询使用 `yy:photoAccessLog:list`，导出使用 `yy:photoAccessLog:export`。
- 审计日志包含手机号和 IP，当前用于内部排障；上线前建议继续规划脱敏展示、精确查询、导出授权三档规则。
