LANG: zh-CN. 输出简洁、直接、可执行；先结论后细节。

PERSONA: 务实工程师。默认直接执行，少空话。

TOOLS:
- 常用命令已在 PATH：`nvm`、`node`、`npm`、`pwsh`、`rg`、`codex`、`uv`、`gh`、`jq`、`fd`、`fzf`、`bat`、`delta`、`just`、`yq`、`sg`、`ast-grep`、`tokei`、`hyperfine`。
- GitHub 操作优先用 `gh`。
- JSON 处理优先用 `jq`。
- YAML/TOML/XML 处理优先用 `yq`。
- 文件内容检索优先用 `rg` / `rg --files`。
- 文件名/路径查找可用 `fd`。
- 交互式选择可用 `fzf`。
- 查看文件可用 `bat`。
- 查看 Git diff 可用 `delta`。
- 项目常用任务入口优先用 `just`。
- 结构化代码搜索/批量改造可用 `sg` / `ast-grep`。
- 代码规模统计可用 `tokei`。
- 命令性能对比可用 `hyperfine`。
- 若命令不可用，先用 `Get-Command <name>` 检查 PATH。

PATHS:
- `nvm_home=C:\Users\Administrator\AppData\Local\nvm`
- `nvm_symlink=C:\nvm4w\nodejs`
- `node=C:\nvm4w\nodejs\node.exe`
- `npm=C:\nvm4w\nodejs\npm.cmd`
- `pwsh=C:\Program Files\PowerShell\7\pwsh.exe`
- `uv=C:\Users\Administrator\.local\bin\uv.exe`

MUST:
- 先读上下文再改动；做最小必要修改，不做无关重构。
- 输出可复制命令，并反馈关键结果：版本号、成功失败、错误摘要。
- 每次改动后至少执行一条验证命令。

SAFETY:
- 禁止 `git reset --hard`、`git checkout --`、递归删除未知路径。
- 未明确要求，不做破坏性操作：强制覆盖、历史改写、批量删除。
- 发现工作区已有无关改动，不回滚，先说明再继续。

STYLE:
- 默认中文。
- 简单任务 1-3 行直接给结论。
- 复杂任务按：`结果`、`改动`、`验证` 三段输出。
- 路径、命令、变量使用反引号标注。

NODE:
- Node 版本管理优先使用 `nvm`。
- 默认使用 LTS；涉及版本时同时给“当前版本 + 目标版本”。
- 若命令不可用，先检查 PATH 与 `Get-Command` 结果。

PYTHON:
- Python 项目优先使用 `uv`。
- 主项目优先执行 `uv sync` / `uv run ...`，不要随意污染全局 Python。
- 涉及 Python 版本时同时反馈“当前版本 + 目标版本”。
- 项目存在 `.python-version` / `pyproject.toml` / `uv.lock` 时，优先按项目配置执行。

# 影约云项目规则

适用范围：本仓库全部代码，尤其是 `studio-workbench`、`backend/ruoyi-modules/ruoyi-yy`、抖音来客 DOUYIN_LIFE、预约订单、今日预约、排期、客片交付。

## 必用上下文

涉及预约、排期、订单、抖音来客、简约网对标时，先读取相关地图：

- `docs\yiyue\code_map.md`
- `docs\yiyue\api_map.md`
- `docs\yiyue\liucheng_map.md`
- `docs\yiyue\callback_map.md`
- `docs\yiyue\open_platform_setting_map.md`

涉及功能、接口、产品、优化规划时，更新：

- `docs\yiyue\function_map.md`
- `docs\yiyue\optimization_map.md`
- `docs\yiyue\jianyue_benchmark_map.md`

## 三层楼架构和规格驱动开工

项目默认按三层楼架构推进，长期规则见：

- `docs\architecture\three-layer-standard.md`
- `docs\architecture\naming-standard.md`
- `docs\contracts\contract-template.md`
- `docs\flows\flow-template.md`
- `docs\adr\0001-three-layer-spec-driven-architecture.md`

三层定义：

- 第一层：表现层。负责前端 UI、页面、按钮、抽屉、动画、空态、加载态、失败态。
- 第二层：控制逻辑层。负责 composable、store、API module、后端 controller/service/adapter、状态机、校验、权限、第三方平台适配。
- 第三层：持久数据层。负责数据库表、Mapper、SQL、对象存储、第三方真实 payload 和证据。

非平凡功能开工前，先输出并确认：

1. 用户路径：谁从哪个页面点哪里，成功和失败分别看到什么。
2. Mermaid 数据流图：按三层楼标明谁传什么字段、返回什么结果、失败路径怎么走。
3. 接口/对象契约：请求字段、响应字段、状态机、错误码/错误文案、权限、幂等性、读写表。
4. 执行计划：分几步做、每步改哪些文件、影响哪些模块、跑哪些验证命令。

用户明确说“先不要写代码 / 先画数据流 / 先拆模块 / 先定对接规范”时，不得直接实现。先按 `docs\flows\flow-template.md` 和 `docs\contracts\contract-template.md` 产出路线图和契约。

可直接复用的开工命令：

```text
我要做这个功能，但先不要写代码。请先按三层楼架构画 Mermaid 数据流图：第一层表现层有哪些页面/按钮/交互；第二层控制逻辑层有哪些 composable/store/api/backend service；第三层持久数据层读写哪些表；标清楚谁传什么字段、返回什么结果、失败怎么处理。
```

```text
先不要写代码。请告诉我你打算分几步做：每步改哪些文件；影响哪些模块；涉及哪些接口契约；读写哪些库表；需要跑哪些测试；哪些地方不能动。我确认后再开始实现。
```

结构性重构规则：

- 先定契约，再移动代码。
- 先拆纯函数，再拆页面，再拆 API facade，再拆 store facade。
- `backendApi`、`appStore` 这类历史 facade 在迁移期必须保持兼容外观。
- 任何新模块必须能归入表现层、控制逻辑层、持久数据层之一；归不进去时先补架构说明。
- 重大计划、数据库、权限、支付、抖音来客写入链路变更，优先用 `grill-me-codex` / `codex-review` 类流程做只读计划拷问，再实施。

## 文件体积、任务包和工作树规则

文件体积上限以 `docs\architecture\naming-standard.md` 为准，自动开工时按以下硬规则执行：

- Vue 页面目标 `<=500` 行，迁移期上限 `<=800` 行。
- Vue 叶子组件目标 `<=350` 行，迁移期上限 `<=500` 行。
- TS helper/composable 目标 `<=500` 行，迁移期上限 `<=800` 行。
- Store 目标 `<=600` 行，迁移期上限 `<=900` 行。
- API module 目标 `<=500` 行，迁移期上限 `<=800` 行。
- Contract test 目标 `<=800` 行，迁移期上限 `<=1000` 行。

当目标文件已经超过迁移期上限时，不允许继续往里面堆功能；必须先拆 owner 或把本次改动放到新 owner 文件，并在执行计划中说明迁移路径。

任务包必须写明：

- 本次允许修改的文件/目录；
- 本次禁止触碰的文件/目录；
- 是否允许写库、调用抖音、部署香港2；
- 需要更新的地图区域：`code_map.md`、`function_map.md`、`api_map.md`、`optimization_map.md`；
- 验证命令和预期结果。

工作树规则：

- 当前主工作树可以做小修、文档、验证和紧急生产修复。
- 大拆分优先新建独立 worktree 或明确任务包，避免和当前未提交生产修复混在一起。
- 工作区存在大量 `docs/evidence`、临时 release id、线上 smoke 证据时，禁止 `git add .`；只能显式 add 本任务文件。
- 发现无关改动时不回滚、不清理；只在总结里标明“非本任务改动仍存在”。
- 交给国产模型或其他 AI 时，默认只给一个任务包，不给全仓无限写权限。

## GitHub 多电脑协作规则

长期协作入口：

- `CONTRIBUTING.md`
- `docs\github-multi-computer-workflow.md`
- `.github\pull_request_template.md`
- `.github\CODEOWNERS`
- `.github\workflows\studio-ci.yml`

默认分支模型：

- `main`：稳定主线，不直接开发。
- `yingyue-closed-loop-optimization-20260603`：当前集成分支。
- `feat/<owner>-<topic>-<yyyymmdd>`：新功能。
- `fix/<owner>-<topic>-<yyyymmdd>`：普通修复。
- `refactor/<owner>-<topic>-<yyyymmdd>`：结构拆分。
- `docs/<owner>-<topic>-<yyyymmdd>`：文档/地图/规则。
- `hotfix/<owner>-<topic>-<yyyymmdd>`：线上紧急修复。

多人/多 AI 协作时：

- 不要两台电脑同时直接推同一个任务分支。
- 一个 PR 只做一个任务域：工作台预约、客片交付、客户侧/小程序、抖音来客、商户运营、架构治理。
- 开工前从集成分支 `git pull --ff-only`，再开任务分支。
- 提交前只 `git add <明确文件路径>`，禁止 `git add .`。
- PR 必须填写改动范围、验证命令、数据边界、HK2/抖音边界和残留风险。
- 合并前以 GitHub Actions、目标测试、PR diff 和必要 smoke 证据为准，不以 AI 自述为准。

网络和抖音验收边界：

- 当前本机网络如果没加抖音白名单，不得用本机 OpenAPI 失败判断代码错误。
- `SPI/Webhook/challenge`、生产订单同步、库存平台写入和 logid 标准证据统一走香港2 `103.24.216.8`。
- 本机主要负责代码、UI、本地测试和不触碰真实平台的 smoke。

## Headroom 长项目协作

Headroom 是本机 AI 协作辅助层，不是影约云业务运行时：

- 不部署到香港2；
- 不进入 `studio-workbench`、`mobile-uniapp`、后端业务运行链路；
- 不提交 `.headroom/` 缓存；
- 不用它绕过项目验证、真实登录态验收或数据边界。

长任务开始前优先执行：

```powershell
.\tools\headroom-codex\test-headroom-local.ps1
.\tools\headroom-codex\start-headroom-proxy.ps1
```

需要诊断时执行：

```powershell
cd D:\OtherProject\CameraApp\headroom-main
uv run --no-sync headroom doctor
```

使用方式：

- 用 Headroom 压缩长日志、证据文件、历史会话和代码地图，减少重复读取；
- 业务事实仍以仓库代码、数据库、接口响应、`docs\yiyue\*.md` 地图和 smoke 证据为准；
- 遇到大量未跟踪 `docs/evidence` 时，先摘要和筛选，不要 `git add .`；
- Headroom helper 文件位于 `tools/headroom-codex/`，可作为独立工具提交；`.headroom/` 必须保持本地忽略。

## 数据边界

- `yy_order` 是唯一订单/预约账本。
- `yy_booking_slot_inventory` 是真实时段和容量账本。
- 历史 `DOUYIN_LIFE` 订单没有真实 `slot_date/slot_start_time/slot_end_time` 时，不得写入每日排期。
- 只有店员手动预约、简约真实时段、未来抖音 SPI/Webhook/OpenAPI payload 带真实时段的数据，才能进入排期库存。
- `DOUYIN_LIFE` 不等于 `DOUYIN_MINI_APP`，不要混用接口、渠道和支付回调。
- 不记录、不提交、不输出 AppSecret、token、完整手机号、openid、raw 私密 payload。

## 简约网对标完成定义

不能只做视觉。一个预约/排期交互完成，必须同时说明：

- 用户入口和点击路径；
- 使用的后端 API；
- 读写的数据表；
- URL 参数和门店范围，优先真实 `storeId=<yy_store.id>`；
- 空态、加载、失败、权限不足的状态；
- 至少一条目标验证命令。

时段格子必须支持：

- 上午/下午/晚上分组；
- 容量、已约、剩余、满员/冲突状态；
- 空时段点开新增预约；
- 非空时段点进该时段订单；
- 订单详情、改期、取消、到店、服务中、完成等状态流转逐步接真实 API。

## 推荐 skill

- `yingyue-three-layer-spec-runner`：三层楼架构、规格驱动、Mermaid 数据流、接口契约和模块拆分计划。
- `yiyue-jianyue-workbench-runner`：影约云简约工作台对标和验收。
- `yingyue-douyin-life-runner`：抖音来客、SPI/Webhook、订单同步、库存和 logid。
- `website-ui-replica`：复刻简约网页面、截图、DOM 和交互。
- `feature-mapper`：更新功能地图、代码地图、接口地图。
- `ui-ux-pro-max`：业务链路正确后再做 UI/UX 优化。
- `verification-before-completion`：完成、提交、部署前必须验证。

## 验证口径

优先跑目标测试，避免无意义全量慢测：

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

后端共享逻辑、抖音同步、库存、订单服务有改动时，再跑对应 Maven 目标测试。

## 部署口径

生产前端部署到香港2：

- 站点：`/var/www/studio.evanshine.me`
- helper：`tools\invoke-hk2.ps1`
- 必须设置 `VITE_STUDIO_DEMO=false`、`VITE_API_BASE_URL=https://api.evanshine.me`、`VITE_STUDIO_RELEASE_ID=<release>`
- 部署后至少 smoke 首页、今日预约、预约订单、库存页，并确认 release marker。
