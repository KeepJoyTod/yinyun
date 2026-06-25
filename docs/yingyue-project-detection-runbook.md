# 影约云项目检测总入口

日期：2026-06-08

## 结论

项目检测分 5 条线：客户取片、后台构建、后端单测、抖音来客、生产预检。日常本地开发优先跑客户取片完整验收；该验收已默认包含移动端构建、平台 readiness、本后台 `test:yy` 和后台 `build:dev`。上线前再叠加生产预检、真实 OSS 图验收和抖音来客专项脚本。

## 快速入口

| 场景 | 命令 | 通过标准 |
| --- | --- | --- |
| 项目总交付状态 | `.\tools\get-yingyue-delivery-status.ps1 -SkipGithub` | 聚合前端构建产物、平台 readiness、客户取片发布状态和外部人工阻塞项；`BLOCKED` 不能发布，`READY_FOR_EXTERNAL_ACCEPTANCE` 代表代码/产物就绪但仍需平台后台或真机验收 |
| 项目总交付状态 JSON | `.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -AsJson` | 输出 `status`、`checks`、`externalBlockers`、`nextCommands`，阻塞时退出码为非 0，适合 CI/agent 读取 |
| 客户取片完整本地验收 | `.\tools\photo-pickup-local-acceptance.ps1` | 最终输出 `photo pickup local acceptance: passed`；默认包含 mobile typecheck/test/build、平台 readiness、后台 `test:yy`、后台 `build:dev`、后端 smoke、后端目标单测 |
| 客户取片后端 smoke | `.\tools\photo-pickup-smoke.ps1` | 登录、相册、详情、thumbnail-url、preview-url、download-url、stream 均成功；若 stream 失败，脚本需输出 JSON/HTML/空响应分类 |
| H5 自动浏览器验收 | `cd mobile-uniapp && npm run test:h5` | 输出 `ok: true`，截图生成到 `output/h5-browser-smoke` |
| 移动端类型检查 | `cd mobile-uniapp && npm run typecheck` | `vue-tsc --noEmit` 通过 |
| 移动端单测 | `cd mobile-uniapp && npm test` | 当前 32 条通过，覆盖取片状态、缩略图契约、H5 smoke 契约、预览状态、平台 readiness 契约、真实图证据生成契约 |
| H5 构建 | `cd mobile-uniapp && npm run build:h5` | `DONE Build complete` |
| 微信小程序构建 | `cd mobile-uniapp && npm run build:mp-weixin` | 产物在 `mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序构建 | `cd mobile-uniapp && npm run build:mp-toutiao` | 产物在 `mobile-uniapp\dist\build\mp-toutiao` |
| 后台 YY 单测 | `cd admin-ui && npm run test:yy` | 当前 49 条通过，覆盖相册上传、取片入口、运营排障、页面契约 |
| 后台构建 | `cd admin-ui && npm run build:dev` | Vite 构建成功 |
| 客户取片后端目标单测 | `cd backend && mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyClientPhotoServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test` | 7 个用例通过 |
| 访问审计后端目标单测 | `cd backend && mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyPhotoAccessLogServiceImplTest "-Dsurefire.failIfNoSpecifiedTests=false" test` | 1 个用例通过 |
| 生产预检 | `.\tools\yingyue-production-preflight.ps1` | API、配置、关键链路预检无阻塞错误 |
| 私有 OSS 生产预检 | `.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone <手机号> -AccessCode <取片码> -AlbumId <相册ID> -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"` | 裸 OSS 返回 `403`，签名 URL 和 `/stream` 可用 |
| 真实图片证据生成 | `.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone <手机号> -AccessCode <取片码> -AutoResolve` | 在 `docs/evidence` 生成一份带命令、导入目录、合法域名、H5/小程序/审计验收表的 Markdown 证据文件，并同步生成机器可读 JSON 摘要；`-AutoResolve` 会自动解析相册 ID、底片 ID、OSS 裸链和 objectKey；可加 `-RunPreflight` / `-RunLocalAcceptance` 自动采集脱敏输出并生成“命令结论”；最终结论优先用 `-AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit` 生成，命令通过且四项人工验收都确认时才为 `PASS` |
| 真实图片证据摘要校验 | `.\tools\verify-latest-photo-pickup-real-oss-summary.ps1` | 默认校验 `docs/evidence` 最新真实 OSS JSON 摘要；字段完整、结论枚举合法、OSS 裸链不含签名 query；最终发布前加 `-RequireFinalPass`；部署包或临时目录可加 `-EvidenceRoot <证据目录>` |
| 客户取片发布状态诊断 | `.\tools\get-photo-pickup-release-status.ps1` | 只读检查最新真实 OSS 摘要，输出 `READY/BLOCKED` 和缺失项：真实图、H5、微信、抖音、后台审计；可加 `-EvidenceRoot <证据目录>` |
| 客户取片发布总闸门 | `.\tools\verify-photo-pickup-release-gate.ps1` | 默认先跑本地客户取片完整验收，再强制要求最新真实 OSS 证据 `finalConclusion=PASS`；未完成真实图和人工小程序验收时会失败；可加 `-EvidenceRoot <证据目录>` 复验指定证据目录 |
| 部署包完整性校验 | `.\tools\verify-yingyue-deploy-package.ps1 -PackageDir .\dist\yingyue-api-deploy-check` | 检查 JAR、环境样例、SQL 迁移、真实 OSS 证据工具、发布闸门工具和 Runbook 是否都进入部署包，并实际执行包内发布总闸门 `-AsJson` 确认 JSON 可解析；可加 `-AsJson` 给 CI/agent 读取 |
| 抖音来客当前订单 | `.\tools\run-douyin-life-current-order.ps1` | client_token 成功；订单能力按当前平台状态返回 |
| 抖音 SPI 公网 smoke | `.\tools\run-douyin-life-spi-public-smoke.ps1` | SPI JSON 形态、challenge、logid 记录正常 |

## 交接项目入口

| 文档 | 用途 |
| --- | --- |
| `docs/friend-project-gap-audit-20260609.md` | 朋友项目和正式主项目的差距审计，说明哪些可借鉴、哪些不能迁移 |
| `docs\yiyue\handover-master-map.md` | 桌面交接总地图，适合非仓库视角快速查看 |
| `docs\yiyue\前端优化\photoshop-master-*.md` | `photoshop-master` 的代码、功能、UI、吸收计划 |
| `docs\yiyue\wechatapp\friend-yuyue-main-audit.md` | 朋友 Taro 项目对微信小程序的可借鉴点 |
| `docs\yiyue\douyinapp\friend-yuyue-main-audit.md` | 朋友 Taro 项目对抖音小程序的可借鉴点 |
| `docs/evidence/photo-pickup-real-oss-acceptance-template-20260609.md` | 真实 OSS 图、H5、小程序、审计的最终验收证据模板 |

交接项目默认只作为参考源。正式工程仍以 `admin-ui`、`mobile-uniapp`、Spring Boot 后端和私有 OSS 为准。

## 标准验收顺序

1. 本地代码改动后先跑：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-local-acceptance.ps1
```

2. 只想单独复核后台页面或上传/审计变更时，可以单跑：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

如果已经跑过 `.\tools\photo-pickup-local-acceptance.ps1` 且没有跳过后台检查，这两条已经包含在总验收里。需要加速时可临时使用：

```powershell
.\tools\photo-pickup-local-acceptance.ps1 -SkipAdminCheck
.\tools\photo-pickup-local-acceptance.ps1 -SkipAdminBuild
```

3. 抖音来客 SPI / OpenAPI 变更后追加：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
.\tools\run-douyin-life-spi-public-smoke.ps1
```

4. 上线前追加：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1
```

上传真实测试图后，必须追加私有 OSS 裸链预检：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone <手机号> -AccessCode <取片码> -AlbumId <相册ID> -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
```

如果这次验收要留档，先生成证据文件：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone <手机号> -AccessCode <取片码> -AutoResolve -RunPreflight -RunLocalAcceptance
```

H5、微信小程序、抖音小程序和后台审计都人工确认后，生成最终 PASS 证据也优先用自动解析：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone <手机号> -AccessCode <取片码> -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
```

如果自动解析找不到目标底片，或需要固定验收某一张图，再手填相册、底片和 OSS 裸链：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\new-photo-pickup-real-oss-evidence.ps1 -Phone <手机号> -AccessCode <取片码> -AlbumId <相册ID> -AssetId <底片ID> -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -ObjectKey <object-key> -ThumbnailObjectKey <thumb-object-key> -Operator <验收人>
```

需要自动跑预检和本地总验收时追加：

```powershell
-RunPreflight -RunLocalAcceptance
```

脚本会剥离 `BareOssUrl` 的签名查询参数，Markdown 证据和 JSON 摘要只保留 HTTPS 阿里云 OSS 裸对象 URL，格式必须类似 `https://<bucket>.oss-<region>.aliyuncs.com/<object-key>`。使用 `-AutoResolve` 时，脚本会先调用客户取片 API 登录、取相册目录、取 `preview-url`，再从签名 URL 中剥离出 OSS 裸链并反解 objectKey。JSON 摘要字段包含 `evidencePath`、`summaryJsonPath`、`commandConclusion`、`finalConclusion`、`preflightRan`、`localAcceptanceRan` 和本次输入 IDs，便于后续自动归档。

生成脚本会在 JSON 摘要所在目录同步写入 `photo-pickup-release-status.json`。默认目录是 `docs/evidence`；如果用 `-SummaryJsonPath` 指向部署包或临时目录，发布状态 JSON 也会写入同一个目录，便于整体打包交接。

摘要校验默认校验最新一份真实 OSS JSON 摘要：

```powershell
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1 -RequireFinalPass
```

上线交付前，先看项目总状态，再看客户取片状态诊断，最后跑总闸门：

```powershell
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -AsJson
.\tools\get-yingyue-delivery-status.ps1 -SkipGithub -OutputJsonPath ".\docs\evidence\yingyue-delivery-status.json"
.\tools\get-photo-pickup-release-status.ps1
.\tools\get-photo-pickup-release-status.ps1 -AsJson
.\tools\get-photo-pickup-release-status.ps1 -OutputJsonPath ".\docs\evidence\photo-pickup-release-status.json"
.\tools\verify-photo-pickup-release-gate.ps1
```

`get-yingyue-delivery-status.ps1` 是项目级总闸门诊断：它会检查 `admin-ui`、`client-web`、`studio-workbench`、H5、微信小程序、抖音小程序构建产物，调用平台 readiness 和客户取片发布状态，并列出必须人工或平台侧完成的外部阻塞项。它不会把微信/抖音后台合法域名、开发者工具/真机保存图片、抖音来客真实回调 logid 伪装成自动完成；这些项会进入 `externalBlockers`。`READY_FOR_EXTERNAL_ACCEPTANCE` 代表本地代码和产物可进入外部验收，不等于生产发布。

状态诊断只读输出 `READY/BLOCKED` 和缺失项；`nextCommands` 现在会直接给出可复制的下一步：上传真实私有 OSS 图片、运行 `-PrintRequiredInputs`、生成自动证据、生成带 H5/微信/抖音/后台审计确认的最终 PASS 证据、最后跑发布总闸门。旧版或残缺证据 JSON 如果没有 `manualChecks`，状态诊断会按缺少人工验收处理为 `BLOCKED`，不会因为严格模式直接中断；如果最新 summary JSON 损坏不可读，会报告缺少 `readable real OSS evidence summary` 并继续给出重新生成证据的命令链。`-AsJson` 输出机器可读的 `status`、`missing`、`nextCommands`、`latestSummaryJsonPath`、`preflightRan`、`localAcceptanceRan` 和人工验收 flags，适合 CI、部署包或其他 agent 读取；`-OutputJsonPath` 可把同一份 JSON 状态无 BOM 落盘为交接证据。总闸门默认不放行 `PENDING` 证据。只有本地客户取片完整验收通过，并且最新真实 OSS 证据最终 `PASS`，才会输出 `photo pickup release gate: passed`。

`verify-photo-pickup-release-gate.ps1` 默认会先读取 `get-photo-pickup-release-status.ps1 -AsJson`。如果状态已经是 `BLOCKED`，会先打印缺失项并停止，不再浪费时间跑本地验收。只有状态为 `READY` 时，才继续跑本地客户取片验收和真实 OSS final PASS。

自动化或交接脚本可以使用 `.\tools\verify-photo-pickup-release-gate.ps1 -AsJson`。它只输出 JSON，`status` 取值为 `BLOCKED`、`PARTIAL` 或 `PASSED`；阻塞时退出码仍为非 0，并带出 `missing`、`releaseStatus`、`partialOnly`、`skippedLocalAcceptance`、`skippedRealOssFinalPass` 等字段，便于 CI 或下一个 agent 判断是否真的可发布。

单独校验某个真实 OSS summary 时，`verify-photo-pickup-real-oss-summary.ps1` 会把坏 JSON 明确报成 `summary json is not readable`，把缺字段报成 `summary field missing: <字段名>`。最终发布前加 `-RequireFinalPass` 时，还会强制 `preflightRan=true` 和 `localAcceptanceRan=true`，避免手写 JSON 绕过预检、本地验收和真实 OSS 校验。状态诊断同样会检查证据 Markdown 是否存在、`summaryJsonPath` 是否指向当前检查文件、`bareOssUrl` 是否是不带 `?Signature` / `OSSAccessKeyId` 的 HTTPS 阿里云 OSS 裸对象 URL，并要求 `phone`、`accessCode`、`albumId`、`assetId` 四个真实输入字段非空；否则会分别标记 `real OSS evidence markdown file`、`summary path matches checked file`、`sanitized bare OSS URL`、`HTTPS Aliyun OSS bare object URL`、`real OSS evidence phone/access code/album id/asset id` 为缺失。summary 校验器和状态诊断的布尔闸门都只接受真实布尔 `true` 或字符串 `"true"`；字符串 `"false"`、空值或其它文本都会按未通过处理。看到这类错误时，不要手改证据 JSON，直接回到后台相册工作台复制参数并重新运行 `new-photo-pickup-real-oss-evidence.ps1`。

`verify-photo-pickup-release-gate.ps1` 只要使用任意跳过参数，例如 `-SkipLocalAcceptance` 或 `-SkipRealOssFinalPass`，都只适合本地/部署包诊断，会输出 `photo pickup release gate: partial only`，不能作为生产交付通过。最终上线交接必须不带任何跳过参数，并看到 `photo pickup release gate: passed`。

生成或收到部署包后，先校验包内交接材料完整性：

```powershell
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check"
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check" -AsJson
.\tools\verify-yingyue-deploy-package.ps1 -PackageDir ".\dist\yingyue-api-deploy-check" -OutputJsonPath ".\dist\yingyue-api-deploy-check\docs\evidence\yingyue-deploy-package-status.json"
```

该脚本只读检查部署包，确保 `backend/ruoyi-admin.jar`、PostgreSQL SQL、真实 OSS 证据脚本、发布状态/总闸门脚本、最终 Runbook 和 `DEPLOY_PACKAGE_README.md` 都在包内。它还会在子 PowerShell 进程中执行包内 `tools/verify-photo-pickup-release-gate.ps1 -AsJson`，确认返回的是可解析 JSON，并记录 `release-gate-json:self-check`。同时会记录 `secret-files:denylist`，阻止真实 `.env.production`、`.env.local`、`APPSecret`、`AccessKey` 或 Secret 命名文件误入包内，样例 `backend/.env.production.example` 允许存在。缺任意一项、JSON 不可解析或敏感文件命中都会失败，避免上线交接时才发现关键验收工具没被带上。

注意：部署包校验 `PASS` 只代表包结构和包内闸门工具可用；如果 `release-gate-json:self-check` 的 detail 是 `status=BLOCKED exit=1 stage=releaseStatus`，说明真实 OSS 证据仍未闭环，不能当成生产发布通过。

如果证据不在默认 `docs/evidence`，例如在部署包、临时目录或服务器回传目录，指定同一个 `-EvidenceRoot`：

```powershell
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence"
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence" -AsJson
.\tools\get-photo-pickup-release-status.ps1 -EvidenceRoot ".\docs\evidence" -OutputJsonPath ".\docs\evidence\photo-pickup-release-status.json"
.\tools\verify-latest-photo-pickup-real-oss-summary.ps1 -EvidenceRoot ".\docs\evidence" -RequireFinalPass
.\tools\verify-photo-pickup-release-gate.ps1 -EvidenceRoot ".\docs\evidence"
```

需要排查指定历史证据时，再手动传具体路径：

```powershell
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "docs/evidence/photo-pickup-real-oss-acceptance-<时间戳>.json"
```

结论规则：

- 命令结论：未跑完整命令为 `PENDING`；自动运行命令失败为 `FAIL`；生产预检和本地总验收都通过为 `PASS`。
- 最终结论：命令结论为 `FAIL` 时为 `FAIL`；人工验收未全部确认时保持 `PENDING`；只有命令结论为 `PASS` 且 H5、微信、抖音、后台审计四项都确认后才为 `PASS`。
- 结构化人工验收：JSON 摘要会写入 `manualChecks.h5Pickup`、`manualChecks.wechatMiniapp`、`manualChecks.douyinMiniapp`、`manualChecks.adminAudit`；最终发布前 `-RequireFinalPass` 会要求四项都为 `true`。可分别使用 `-ConfirmH5Pickup`、`-ConfirmWechatMiniapp`、`-ConfirmDouyinMiniapp`、`-ConfirmAdminAudit`；旧的 `-ConfirmManualAcceptance` 仍保留为一次性确认四项。

公网预览账号当前相册为空时，先跑基础链路：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount
```

该模式会输出 `photo smoke mode: preview-empty`，自动使用 `13900001111 / PREVIEW-20260608`，自动选择第一个相册，跳过图片流，并允许空相册通过。不要把它当成完整图片链路验收；上传测试图后仍要用真实相册跑完整预检。

## 失败摘要模板

每次失败记录到 `docs/evidence/` 时使用：

```text
时间：
命令：
环境：
失败阶段：
关键错误：
影响范围：
已确认不是：
下一步：
截图/日志：
```

## 当前已知边界

- 微信/抖音开发者工具导入和真机保存图片仍需要人工设备验证。
- 真实图片上传闭环依赖后台账号权限、OSS 私有配置和实际测试图片。
- 抖音来客能力状态以开放平台当前状态和最近 logid 为准，旧地图中的历史状态需要结合时间阅读。
- 客户取片 H5 smoke 当前会验证：预览页打开时不提前请求 `download-url`，点击“下载原图”后才请求 `download-url` 和 `/stream`。
- `tools/photo-pickup-smoke.ps1` 已补强 `thumbnail-url`、`download-url` 和 `/stream` 诊断：真实有图相册会先验证缩略图签名 URL，再验证原图预览/下载；`/stream` 能区分 JSON API 错误、HTML 反代页、空 500、非图片 Content-Type、空图片流。
- `tools/yingyue-production-preflight.ps1` 已透传 `-BareOssUrl` 和 `-VerifyBareOssBlocked` 到取片 smoke；真实有图验收必须证明裸 OSS 链接返回 `403`。
- 2026-06-08 本机复验显示：`preview-url` / `download-url` 正常，`/stream` 因本机访问阿里云 OSS 443 被 VPN/代理/TUN 影响返回 500；同样本机直连签名 URL 报 socket 权限错误。生产验收要在服务器侧复测 OSS 出口，不要把该现象归因到 H5 UI。
- 2026-06-09 `yingyue-production-preflight.ps1` 新增 `-PreviewAccount`，用于避免公网预检误用本地 demo 账号 `13800003333 / PICK-202606-001 / 903001`。

## 下一步检测建设

| 优先级 | 项 | 说明 |
| --- | --- | --- |
| P0 | 真实订单取片验收模板 | 把抖音订单 logid、相册 ID、上传 OSS Key、访问审计动作串到一张证据表 |
| P1 | 平台能力唯一状态表 | 对抖音能力记录最后验证时间、出口 IP、logid、当前阻塞、下一动作 |
| P1 | 后台排障卡 | 从外部订单号串联本地订单、相册、取片码、照片数、最近访问失败 |
| DONE | 审计权限拆分 | 已拆 `yy:photoAccessLog:list/export`；后续继续做手机号/IP 脱敏展示 |
| DONE | 后台上传防误关 | 上传中禁用关闭并展示待完成/成功/失败汇总，避免批量上传时误判状态 |
