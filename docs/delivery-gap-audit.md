# 照相馆系统 MVP 差距审计与交付计划

生成日期：2026-05-31

## 1. 结论

当前项目已经具备可继续开发的 Next 全栈 MVP，不需要重开项目。推荐按“先审计、再 P0 核心闭环、再 P1 运营管理、再 P2 统计营销、最后生产部署”的顺序推进。

本轮交付物是第一阶段审计结果，不改业务代码。后续开发应以本文档的任务顺序为准。

## 2. 审计来源

| 来源 | 路径 | 结论 |
| --- | --- | --- |
| 源需求文档 | `D:\OtherProject\CameraApp\照相馆需求文档PRD.docx` | 包含 20 个页面模块、52 个功能条目。正文未检测到可机器识别的红色字体或高亮标记，肉眼标红项需要开发前人工确认一次。 |
| 截图功能清单 | `D:\OtherProject\CameraApp\output\brand-prd\data\features.json` | P0 5 项、P1 25 项、P2 22 项。 |
| 当前代码 | `D:\OtherProject\CameraApp\src`、`D:\OtherProject\CameraApp\prisma` | 已实现登录、会话、看板、门店列表、服务组 CRUD、产品 CRUD、订单状态、预约端基础流程。 |
| 当前测试 | `D:\OtherProject\CameraApp\tests\domain` | 已覆盖 session、权限、预约容量、订单状态、产品草稿、预约订单草稿。缺 API、页面、E2E 测试。 |
| 部署文档 | `D:\OtherProject\CameraApp\docs\deployment.md` | 已有 Docker Compose 生产部署说明，但本机 Docker daemon 未确认可用。 |

## 3. 本地开源参考项目

| 项目 | 本地路径 | 可借鉴点 | 不采用点 |
| --- | --- | --- | --- |
| Cal.com | `D:\OtherProject\CameraApp\cal-com-main` | 预约排期、事件类型、可用时间、团队资源、白标预约页。 | 体量过大，不能照搬 monorepo、tRPC 和复杂集成。 |
| pretix | `D:\OtherProject\CameraApp\pretix-master` | 订单生命周期、容量控制、核销、支付插件、审计和稳定发布思路。 | Python/Django 技术栈不并入当前 Next 项目。 |
| Medusa | `D:\OtherProject\CameraApp\medusa-develop` | 商品、订单、支付、退款、模块化 commerce primitive。 | 不引入完整电商平台，避免系统过重。 |
| Saleor | `D:\OtherProject\CameraApp\saleor-main` | API-first、渠道、商品、订单、客户、后台扩展思想。 | 不改成 GraphQL-only，不拆成多服务。 |
| barber-booking-app | `D:\OtherProject\CameraApp\barber-booking-app-0.14_server_side` | 小型预约 H5 的页面组织和轻量流程。 | 代码质量和业务复杂度不足，只作低权重参考。 |

参考策略：只借鉴业务模式、信息架构和边界设计，不复制代码、素材、品牌视觉或闭源旧站资源。

## 4. Requirements Traceability Matrix

状态只使用 `DONE`、`PARTIAL`、`MISSING`、`UNTESTED`、`UNCLEAR`。

| ID | 需求 | 当前状态 | 相关证据 | 缺口 | 建议任务 |
| --- | --- | --- | --- | --- | --- |
| REQ-001 | 登录、会话、后台访问保护 | DONE | `src/server/auth.ts`、`src/lib/session.ts`、`src/proxy.ts`、`tests/domain/session.test.ts` | API 登录保护需继续扩展到所有新增接口。 | P0-T01 权限统一 |
| REQ-002 | 角色权限：OWNER/MANAGER/STAFF/VIEWER | DONE | `src/domain/auth.ts`、`tests/domain/auth.test.ts` | 数据库 `User.role` 仍是字符串，需 Prisma enum 化。 | P0-T01 权限统一 |
| REQ-003 | 首页仪表盘核心展示 | UNTESTED | `src/app/dashboard/page.tsx`、`src/server/backoffice.ts` | 缺日期/服务组筛选、导出、页面/API 测试。 | P0-T08 首页看板增强 |
| REQ-004 | 门店管理 | PARTIAL | `src/app/stores/page.tsx`、`prisma/schema.prisma` | 目前偏列表展示，缺新增、编辑、启停、删除 API 和测试。 | P0-T02 门店 CRUD |
| REQ-005 | 服务组管理 | UNTESTED | `src/components/service-group-manager.tsx`、`src/app/api/service-groups` | 已有 CRUD，但缺 API/页面测试和更完整排期规则。 | P0-T03 服务组与排期 |
| REQ-006 | 产品基础管理 | PARTIAL | `src/components/product-manager.tsx`、`src/app/api/products` | 已有通用产品 CRUD，缺团单/附加/冲印/抖音/美团细分字段和页面。 | P1-T01 产品体系 |
| REQ-007 | 客户 H5 预约端 | PARTIAL | `src/app/booking/page.tsx`、`src/server/appointments.ts`、`tests/domain/booking.test.ts` | 缺日期日历、提交成功页、失败重试、移动端深度验收。 | P0-T04 预约端增强 |
| REQ-008 | 订单列表与状态流转 | PARTIAL | `src/components/order-manager.tsx`、`src/app/api/orders/[id]/action`、`tests/domain/order.test.ts` | 缺订单详情、改期、员工分配、取消原因、筛选查询。 | P0-T05 订单核心闭环 |
| REQ-009 | 员工管理与业绩归属 | MISSING | `Staff` 模型存在 | 缺员工 CRUD、门店归属、订单分配、业绩统计输入。 | P0-T06 员工管理 |
| REQ-010 | 客户管理 | MISSING | `Customer` 模型存在，预约时 upsert | 缺客户列表、详情、预约历史、消费记录、备注。 | P1-T02 客户管理 |
| REQ-011 | 操作日志 | PARTIAL | `AuditLog` 模型、订单状态操作写日志 | 缺通用日志封装、查询页、产品/服务组/门店操作日志。 | P1-T03 操作日志 |
| REQ-012 | 导入导出 | MISSING | PRD 与 features 有导入导出需求 | 缺订单导出、客户导出、产品导入、导出权限。 | P1-T04 导入导出 |
| REQ-013 | 通知预留 | MISSING | 部署文档未含通知服务 | 缺通知模板、发送记录、短信/微信 provider 抽象。 | P1-T05 通知预留 |
| REQ-014 | 服务产品统计 | MISSING | `features.json` P1 | 缺页面、聚合服务、筛选、导出。 | P2-T01 报表一期 |
| REQ-015 | 收支统计 | MISSING | `Payment` 模型存在，页面未实现 | 缺收支口径、页面、导出。 | P2-T01 报表一期 |
| REQ-016 | 客户/产品/评价分析 | MISSING | `features.json` P1/P2 | 缺客户分析、产品分析、客户评价页面和数据口径。 | P2-T02 分析与评价 |
| REQ-017 | 员工业绩、门店月报 | MISSING | `Staff`、`Order.staffId` 存在 | 缺员工分配后续统计和月报页面。 | P2-T03 业绩统计 |
| REQ-018 | 权益核销、渠道收入、销售、订购分析 | MISSING | `features.json` P2 | 缺权益/渠道/核销数据模型和统计页。 | P2-T04 营销统计 |
| REQ-019 | 客片/在线选片 | MISSING | 当前无文件/相册模型 | 缺相册、照片、选片、文件存储、客户访问入口。 | P2-T05 客片选片 |
| REQ-020 | 生产部署、备份、HTTPS、监控 | PARTIAL | `Dockerfile`、`docker-compose.prod.yml`、`docs/deployment.md` | 缺 Caddy/Nginx、备份脚本、健康检查、上线验收脚本。 | P3-T01 生产上线 |

## 5. MVP 完成度摘要

已完成：

- 登录、HTTP-only cookie 会话、基础后台访问守卫。
- 角色权限领域规则。
- Prisma 核心模型：品牌、门店、员工、客户、服务组、产品、时段、订单、支付、审计日志。
- 基础预约容量、订单状态流转、预约订单草稿规则。

部分完成：

- 首页看板、门店管理、产品管理、预约端、订单管理、操作日志、生产部署。

未实现：

- 员工管理、客户管理、导入导出、通知预留、报表统计、营销统计、权益核销、客片选片。

已实现但测试不足：

- 服务组 CRUD、产品 CRUD、看板查询、订单 API、预约 API、后台页面交互。

不明确：

- PRD 里“标红优先项”未能从 docx XML 中机器识别，需要用户按肉眼截图/Word 再确认一次。默认先按 P0/P1/P2 执行。

## 6. 交付任务计划

| 顺序 | Task Slug | 标题 | 覆盖需求 | 依赖 | 验收标准 | 自动化测试要求 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P0-T01-auth-rbac | 权限统一与接口保护 | REQ-001, REQ-002 | 无 | 所有后台 API 都校验登录；角色权限固定为 OWNER/MANAGER/STAFF/VIEWER；无权限返回明确错误。 | domain + API integration | P0 |
| 2 | P0-T02-store-crud | 门店 CRUD | REQ-004 | P0-T01 | 门店可新增、编辑、启停、删除；订单关联门店时禁止误删或给出明确限制。 | API + page interaction | P0 |
| 3 | P0-T03-service-group-schedule | 服务组与排期规则 | REQ-005 | P0-T02 | 服务组支持门店绑定、容量、时长、启停；可生成/维护预约时段。 | domain + API | P0 |
| 4 | P0-T04-booking-h5 | 预约端增强 | REQ-007 | P0-T03 | 手机端可按日期、门店、服务组、产品选择时段；满员不可提交；提交成功页展示订单号。 | domain + E2E | P0 |
| 5 | P0-T05-order-core | 订单核心闭环 | REQ-008, REQ-011 | P0-T04 | 订单支持详情、筛选、确认、开始服务、完成、取消原因、改期、员工分配、日志记录。 | domain + API + E2E | P0 |
| 6 | P0-T06-staff-management | 员工管理 | REQ-009 | P0-T02 | 员工可新增、编辑、启停、绑定门店；订单可分配员工。 | API + page interaction | P0 |
| 7 | P0-T07-test-baseline | P0 测试基线 | REQ-001 至 REQ-009 | P0-T01 至 P0-T06 | 登录、预约、订单完成闭环 E2E 可稳定通过。 | Playwright smoke | P0 |
| 8 | P0-T08-dashboard-filters | 首页看板增强 | REQ-003 | P0-T05 | 看板支持日期/门店/服务组筛选，核心指标与订单状态一致。 | API + page interaction | P0 |
| 9 | P1-T01-product-system | 产品体系细分 | REQ-006 | P0-T03 | 团单、附加、冲印、抖音、美团产品有独立筛选和字段；统一落到 Product 模型或扩展详情模型。 | domain + API | P1 |
| 10 | P1-T02-customer-management | 客户管理 | REQ-010 | P0-T05 | 客户列表、详情、预约历史、消费记录、备注可用。 | API + page interaction | P1 |
| 11 | P1-T03-audit-log | 操作日志查询 | REQ-011 | P0-T05 | 核心写操作统一记录日志；后台可按人、对象、时间筛选。 | API | P1 |
| 12 | P1-T04-import-export | 导入导出 | REQ-012 | P1-T01, P1-T02 | 订单/客户导出，产品导入；失败明细可下载或展示。 | API + file assertions | P1 |
| 13 | P1-T05-notification-adapter | 通知预留 | REQ-013 | P0-T05 | 通知模板、发送记录、provider 接口完成；默认 dry-run 不发真实短信。 | domain + API | P1 |
| 14 | P2-T01-report-basic | 报表一期 | REQ-014, REQ-015 | P0-T05 | 服务产品统计、收支统计支持筛选和导出。 | aggregation unit + API | P2 |
| 15 | P2-T02-analysis-review | 分析与评价 | REQ-016 | P1-T02 | 客户分析、产品分析、客户评价页面可用。 | aggregation unit + page interaction | P2 |
| 16 | P2-T03-performance-report | 员工与门店业绩 | REQ-017 | P0-T06 | 员工业绩、门店服务业绩月报可查询和导出。 | aggregation unit + API | P2 |
| 17 | P2-T04-marketing-stats | 营销统计 | REQ-018 | P1-T01 | 权益核销、渠道收入、销售数据、订购分析完成基础统计。 | aggregation unit + API | P2 |
| 18 | P2-T05-photo-selection | 客片与选片 | REQ-019 | P1-T02 | 可创建相册、上传照片、客户查看并提交选片结果。 | API + file smoke + E2E | P2 |
| 19 | P3-T01-production-ready | 生产部署与运维 | REQ-020 | 所有 P0 | HTTPS、备份、健康检查、日志、上线检查命令完整。 | build + compose config + smoke | P3 |
| 20 | P3-T02-final-acceptance | 最终验收 | 全部需求 | 所有功能任务 | 按 PRD 页面逐项验收，截图、测试、部署证据齐全。 | full regression | P3 |

## 7. 测试矩阵

| 测试类型 | 覆盖范围 | 命令或方式 | 必须通过阶段 |
| --- | --- | --- | --- |
| Domain unit | 预约容量、订单状态、权限、产品规则、报表聚合 | `npm test` | 每个任务 |
| Type check | TypeScript 类型和 Next 编译前检查 | `npm run typecheck` | 每个任务 |
| Lint | ESLint 规则 | `npm run lint` | 每个任务 |
| Prisma schema | 数据模型合法性 | `npx prisma validate` | 涉及 schema 的任务 |
| API integration | 登录、预约、订单、门店、服务组、产品、员工、导入导出 | Vitest + route/service 测试 | P0/P1 |
| Playwright E2E | 登录后台、客户预约、后台确认、开始服务、完成订单 | `npx playwright test` 或脚本化 smoke | P0 完成后 |
| Build | Next 生产构建 | `npm run build` | 阶段完成 |
| Docker config | 生产 compose 配置 | `docker compose -f docker-compose.prod.yml config` | P3 |
| Manual acceptance | Word PRD 页面逐项对照 | 人工验收截图 | P3-T02 |

## 8. 执行默认值

- 不重开项目，继续在当前 Next.js 全栈项目上开发。
- PostgreSQL 作为唯一正式数据库。
- 支付先保留 `Payment` 模型和状态，不接真实支付渠道。
- 预约端先做手机 H5，不先做微信小程序原生版。
- 文件存储 V1 使用服务器本地挂载目录，后续再迁移到 S3/MinIO/OSS。
- 参考项目只作为设计参照，不作为依赖引入。
- 若用户未重新确认标红项，默认按本文档 P0、P1、P2 顺序执行。

## 9. 下一步可直接执行的 Goal

建议下一个执行 Goal 直接做 P0 第一组：

```text
基于 docs/delivery-gap-audit.md，实施 P0-T01 到 P0-T03：权限统一与接口保护、门店 CRUD、服务组与排期规则。每个任务必须补测试，完成后运行 npm run lint、npm run typecheck、npm test、npx prisma validate。不要改动参考开源仓库目录。
```

## 10. 实施进度记录

| 日期 | 已完成任务 | 验证证据 |
| --- | --- | --- |
| 2026-05-31 | P0-T01 权限统一与接口保护；P0-T02 门店 CRUD；P0-T03 服务组与排期规则；P0-T04 预约端增强 | `npm run lint`、`npm run typecheck`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 9 个文件、29 条用例通过。 |
| 2026-05-31 | P0-T05 订单核心闭环：订单筛选、详情展开、改期、员工分配、取消原因、订单操作日志 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate` 通过；当前测试 9 个文件、31 条用例通过。 |
| 2026-05-31 | P0-T06 员工管理：员工新增、编辑、启停、删除保护、门店绑定、后台导航入口 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate` 通过；当前测试 10 个文件、35 条用例通过。 |
| 2026-05-31 | P0-T07 测试基线：新增 Playwright 配置和 P0 主链路 smoke（登录、预约提交、订单确认/开始/完成） | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate` 通过；E2E 实跑命令为 `npm run test:e2e`，当前本机 Docker daemon 未启动且无本地 `psql`，真实数据库环境就绪后执行。 |
| 2026-05-31 | P0-T08 首页看板增强：日期、门店、服务组筛选；预约总数、状态数量、预计收入统一聚合口径 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 11 个文件、36 条用例通过。 |
| 2026-05-31 | P1-T01 产品体系细分：服务、团单、附加、冲印、抖音、美团产品类型；外部产品编码；商品页类型筛选 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 11 个文件、37 条用例通过。 |
| 2026-05-31 | P1-T02 客户管理：客户列表、搜索、详情、预约历史、消费汇总、客户备注维护 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 12 个文件、40 条用例通过。 |
| 2026-05-31 | P1-T03 操作日志查询：日志筛选页、日志查询 API、门店/产品/服务组/员工/客户写操作审计记录 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 13 个文件、42 条用例通过。 |
| 2026-05-31 | P1-T04 导入导出：订单 CSV 导出、客户 CSV 导出、产品 JSON 批量导入、导入审计日志 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 14 个文件、44 条用例通过。 |
| 2026-05-31 | P1-T05 通知预留：通知模板、dry-run 发送、发送记录、模板编辑、通知 API | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 15 个文件、47 条用例通过。 |
| 2026-05-31 | P2-T01 报表一期：服务组统计、产品统计、收支统计、报表筛选、报表 CSV 导出 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 16 个文件、49 条用例通过。 |
| 2026-05-31 | P2-T02 分析与评价：客户分析、产品分析、客户评价模型、评价概览与列表页 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 17 个文件、52 条用例通过。 |
| 2026-05-31 | P2-T03 员工与门店业绩：员工业绩月报、门店月报、CSV 导出、月份筛选 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 18 个文件、54 条用例通过。 |
| 2026-05-31 | P2-T04 营销统计：权益核销模型、渠道收入、销售数据、订购分析、营销 CSV 导出 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 19 个文件、56 条用例通过。 |
| 2026-05-31 | P2-T05 客片与选片：相册、照片 URL/路径登记、后台选片、公开分享选片页、选片结果保存 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build` 通过；当前测试 20 个文件、64 条用例通过。 |
| 2026-05-31 | P3-T01 生产部署与运维：健康检查 API、Caddy HTTPS 反代、生产 compose 补强、备份脚本、部署文档 | `npm run typecheck`、`npm run lint`、`npm test`、`npx prisma validate`、`npm run build`、`docker compose -f docker-compose.prod.yml config` 通过；Docker daemon 未启动，未执行 `up -d`。 |
| 2026-05-31 | P3-T02 最终验收：生成验收清单、复核公开选片访问保护、整理上线阻塞和试运营建议 | `docs/final-acceptance.md` 已生成；最终复跑 `npm run typecheck`、`npm run lint`、`npm test`、`npm run build` 通过；当前测试 20 个文件、64 条用例通过。 |
