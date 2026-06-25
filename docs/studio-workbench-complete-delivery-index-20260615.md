> owner: studio-workbench-complete-delivery-index-20260615
> canonical_for: 2026-06-15 门店工作台完整交付文档包入口
> upstream: docs/studio-workbench-complete-delivery-plan-20260615.md
> downstream: docs\yiyue\studio-workbench-complete-delivery-20260615

# 门店工作台完整交付文档包

日期：2026-06-15

## 读法

先读总计划，再按需要进入代码地图、优化地图、预实现方案和验收清单。

| 顺序 | 文档 | 用途 |
| --- | --- | --- |
| 1 | `docs/studio-workbench-complete-delivery-plan-20260615.md` | 完整交付计划、需求矩阵、任务优先级 |
| 2 | `docs/studio-workbench-feature-code-map-20260615.md` | 自然语言功能到代码、接口、测试的定位地图 |
| 3 | `docs/studio-workbench-optimization-map-20260615.md` | 优化路线、稳健重构、视觉规范和风险防线 |
| 4 | `docs/studio-workbench-preimplementation-solutions-20260615.md` | 缺失能力的表、API、前端接入和验收方案 |
| 5 | `docs/studio-workbench-acceptance-checklist-20260615.md` | 本地、浏览器、平台、部署验收清单 |
| 6 | `docs/studio-workbench-api-route-map.md` | 现有前端路由、页面、store、backendApi、后端接口映射 |
| 7 | `docs/studio-workbench-route-implementation-status.md` | 每个工作台路由的 READY / DERIVED / PARTIAL 状态 |
| 8 | `docs/studio-workbench-entry-map.md` | 快速入口索引 |
| 9 | `docs/studio-workbench-architecture-framework.md` | 工作台架构、账本边界和开发硬规则 |
| 10 | `docs/domestic-model-implementation-pack-20260615.md` | 国产模型可接手任务、禁止边界、任务单索引和项目剩余比例 |
| 11 | `docs/domestic-model-current-status-20260615.md` | 当前完成度、剩余比例、可派发和禁区 |
| 12 | `docs/domestic-model-batch-prompt-20260615.md` | 可直接复制给国产模型的一口气执行提示词 |
| 13 | `docs/domestic-model-tasks/README.md` | 单个国产模型任务单入口和状态索引 |
| 14 | `docs/contracts/studio-workbench-api-contract-20260615.md` | 工作台 API 契约、现有/待实现接口和账本边界 |
| 15 | `docs/api/studio-workbench-openapi-skeleton-20260615.yaml` | OpenAPI 骨架，供后续生成文档和实现任务 |
| 16 | `docs/superpowers/plans/2026-06-16-studio-order-dashboard-sync.md` | 预约订单、首页经营概况、今日预约、同步订单和状态分组的完成计划 |

## 桌面镜像

镜像目录：

```text
docs\yiyue\studio-workbench-complete-delivery-20260615
```

镜像规则：

- 仓库 `docs/` 是权威源。
- 桌面只放无密钥文档副本。
- 不复制 `APPSecret.txt`、密码、token、OSS AccessKey、服务器凭据。

## 当前执行入口

下一轮实现从 `docs/studio-workbench-complete-delivery-plan-20260615.md` 的 P0 任务开始：

1. 先读 `docs/superpowers/plans/2026-06-16-studio-order-dashboard-sync.md`。其中状态分组共享规则、订单页/首页共用逻辑和选定前端测试已完成；下一步从 API smoke、浏览器真实登录验收和部署证据继续。
2. T01 订单处理最终收口：重点补真实 API 下载 smoke、真实改期校验、同步订单后刷新链路浏览器验收。
3. T02 排期和库存收口：重点补 `/dashboard/today` 真实登录态下的排期/库存跳转证据。
4. T03 客片/选片闭环：重点补真实 OSS 上传/访问日志权限 smoke。
5. T05 日志/渠道排障闭环：重点补 DOUYIN_LIFE 同步健康、同步日志、平台 logid 可复查证据。

每个任务先读功能代码地图，再改对应页面/helper/API，并按验收清单跑测试和浏览器检查。
