> owner: domestic-model-batch-prompt-20260615
> canonical_for: 让国产模型一口气执行可填代码任务的复制提示词、顺序、验证和回报格式
> upstream: docs/domestic-model-current-status-20260615.md, docs/domestic-model-tasks/README.md
> downstream: future domestic model run reports

# 国产模型批量执行提示词

日期：2026-06-15

## 使用方式

把下面整段复制给国产模型。它做完后，把它的“结果 / 改动 / 验证 / 风险”回报和 diff 交给 Codex 复查。

不要把密钥、服务器密码、`.env.local`、`APPSecret.txt`、OSS AccessKey 一起发给国产模型。

## 一口气执行提示词

```text
你是接手影约云 yingyue-cloud-repo 的代码执行模型。你需要按任务单顺序把“只剩填代码/接线/文档”的部分做完一轮，然后停下回报，不能部署、不能提交 GitHub、不能读取密钥。

工作目录：
D:\OtherProject\CameraApp\yingyue-cloud-repo

必须先读：
docs/domestic-model-current-status-20260615.md
docs/domestic-model-implementation-pack-20260615.md
docs/domestic-model-tasks/README.md
docs/studio-workbench-feature-code-map-20260615.md
docs/studio-workbench-optimization-map-20260615.md
docs/studio-workbench-api-route-map.md
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml

绝对禁止：
- 不读取、打印、复制、提交任何密钥、token、APPSecret、服务器密码、.env.local、OSS AccessKey。
- 不提交 GitHub，不部署服务器，不改 nginx/Caddy/Docker 生产配置。
- 不执行生产数据库迁移；SQL 只能 review-only。
- 不新增第二套订单、相册、客户、会员、优惠券、工单、报表账本。
- 不把 19 位业务 ID 转成 number，前端 ID 一律 string。
- 不让 API 模式失败后 fallback demo。
- 不伪造支付、退款、核销、发券、评价、收入、访问日志、logid。
- 不把 OSS 改 public-read，不暴露完整手机号/IP/签名 URL。
- 不混用 DOUYIN_LIFE 和 DOUYIN_MINI_APP。

执行顺序：
1. DM-SK-001：读取 docs/domestic-model-tasks/DM-SK-001-studio-acceptance-evidence-tool.md，只验证/完善 tools/new-studio-workbench-acceptance-evidence.ps1 的公开路由探针和输出，不登录、不写库。
2. DM-API-001/DM-API-002 已由 Codex 完成真实接线；只允许补线上权限 smoke、证据文档或非业务语义的边缘态，不要重复重构已接的 Store/API。
3. DM-RF-001：读取 docs/domestic-model-tasks/DM-RF-001-store-api-facade-split.md，只选一个只读 slice 继续小步拆分，保持 backendApi/appStore 外部导入兼容，不跨域重构。
4. DM-API-003：读取 docs/domestic-model-tasks/DM-API-003-backend-skeleton-contracts.md。如果前项都稳定，再从 coupon / member / customerReview 里只选一个业务域补 RuoYi 后端最小 CRUD 骨架和 review-only SQL。不要执行迁移。workOrder 已有 CRUD + transition + event list 后端骨架和前端 API facade，不要重复生成；若选 workOrder，只能做权限菜单、页面切真表方案、smoke 证据或文档。
5. DM-DOC-001：读取 docs/domestic-model-tasks/DM-DOC-001-feature-map-refresh.md，更新功能代码地图、优化地图、接口路由图和任务索引状态。

遇到以下情况立即停下并回报，不要猜：
- 需要密钥、token、服务器密码、生产数据库。
- 需要真实支付/退款/核销/发券。
- 需要平台真实 logid 或真实订单。
- 全量测试失败且无法用最小改动修复。
- 需要跨三个以上业务域重构。

每个任务完成后至少跑对应任务单的验证命令。最后统一跑：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-api-contracts.ps1
git diff --check

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build

如果改了 backend/ruoyi-modules/ruoyi-yy，再跑：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test

最终回报格式必须是：
结果：逐项说明完成/跳过/阻塞。
改动：列出文件路径和每个文件核心变化。
验证：列出实际执行的命令、通过数量或失败摘要。不要只写“已测试”。
风险：列出未接生产、未验收、需 Codex review、需负责人/平台处理的事项。

不要提交，不要部署。停在等待 Codex 复查。
```

## Codex 复查清单

国产模型回报后，Codex 需要检查：

| 检查 | 命令/动作 |
| --- | --- |
| 未泄露密钥 | `rg -n "APPSecret|AccessKey|password|密码|token=|client_secret" docs studio-workbench/src backend/ruoyi-modules/ruoyi-yy/src/main/java tools` |
| 前端测试 | `cd studio-workbench; npm test; npm run build` |
| 契约文档 | `powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-studio-api-contracts.ps1` |
| 后端 targeted | `cd backend; mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest,YyOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test` |
| 格式 | `git diff --check` |
| 业务边界 | 检查 `DOUYIN_LIFE` / `DOUYIN_MINI_APP` 未混用，支付/核销/发券无 fake success |

## 批量执行预期结果

一轮批量执行后，理想状态是：

- 工作台可见页面和 API facade 更接近真实后端。
- 客片访问日志和报表快照保持 Codex 已接真实加载的状态，并补齐 smoke 证据。
- 后续业务域至少有一个 review-only 后端骨架。
- 文档地图能让下一位模型快速定位文件。
- 仍不改变生产环境和最终交付状态。
