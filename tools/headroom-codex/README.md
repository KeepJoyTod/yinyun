# Headroom for 影约云 Codex 长项目协作

> owner: headroom-codex-local-runner
> canonical_for: 本机用 Headroom 辅助 Codex/Claude 长项目协作的启动、诊断和安全边界
> upstream: `D:\OtherProject\CameraApp\headroom-main`, `AGENTS.md`, `docs\yiyue\*.md`
> downstream: `tools/headroom-codex/*.ps1`

## 结论

Headroom 不进入影约云业务代码、不部署到香港2、不影响 `studio-workbench` / `mobile-uniapp` 运行。

它只作为本机开发辅助层，用来：

- 压缩长日志、代码地图、API 地图和 smoke 证据；
- 给 Codex/Claude 长会话提供 memory / code graph / learn；
- 审计 Codex 读文件习惯，减少无效上下文；
- 从历史失败会话里提炼规则，写回 `AGENTS.md` 前必须人工 review。

## 推荐命令

先诊断：

```powershell
.\tools\headroom-codex\test-headroom-local.ps1
```

启动带 Headroom 的 Codex：

```powershell
.\tools\headroom-codex\start-codex-headroom.ps1
```

只启动 Headroom proxy：

```powershell
.\tools\headroom-codex\start-headroom-proxy.ps1
```

只预览学习建议，不写文件：

```powershell
.\tools\headroom-codex\learn-codex-project.ps1
```

审计 Codex 读文件习惯：

```powershell
.\tools\headroom-codex\audit-codex-reads.ps1
```

## 安全边界

- 默认不 `--apply`，不自动改 `AGENTS.md`。
- 默认不提交、不推送、不部署。
- 不输出 secrets，不读取 `APPSecret.txt`、`.env.local` 的明文。
- Headroom 源码版依赖较重，第一次启动可能慢；脚本有超时和诊断提示。

## 当前已知本机状态

- `uv` 可用。
- `codex` 可用。
- `headroom-main` 存在于 `D:\OtherProject\CameraApp\headroom-main`。
- `test-headroom-local.ps1` 已通过，Headroom CLI 可用。
- `start-headroom-proxy.ps1` 已能启动 `http://127.0.0.1:8787`。
- `headroom doctor` 已确认 `proxy=pass`、`codex=routed`。
- Codex MCP 的 `headroom` command 已改为本地 shim：`D:\OtherProject\CameraApp\headroom-main\headroom.cmd`，避免依赖全局命令。
- Claude 仍指向原有 Anthropic 代理，不通过 Headroom；当前只启用 Codex。

## 当前诊断结果

```text
headroom local diagnostics: PASS
doctor: proxy pass, codex routed, shell env unset, no savings yet
audit-reads: 1195 sessions, 11139 exec_command calls, 930.3MB shell output
```

`audit-reads` 显示过去 Codex 会话主要浪费来自大体量命令输出，而不是普通文件读取。后续长任务应优先：

- 少跑超宽 `git status` / 全目录列表；
- 用 `rg` 精确过滤；
- 大证据文件先摘要，不整包塞进上下文；
- 把长期事实写入 `docs\yiyue` 地图和仓库 README。

## 依赖修复命令

优先用项目锁文件：

```powershell
cd D:\OtherProject\CameraApp\headroom-main
uv sync --extra proxy --extra mcp
```

如果上面长时间卡住，可先补最小 CLI/import 依赖：

```powershell
cd D:\OtherProject\CameraApp\headroom-main
uv pip install tiktoken pydantic click rich opentelemetry-api ast-grep-cli
```

补完后重新跑：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\headroom-codex\test-headroom-local.ps1
```
