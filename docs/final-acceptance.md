# 照相馆系统最终验收清单

日期：2026-05-31

## 结论

当前项目已完成 P0、P1、P2 和 P3 生产准备的主线开发，可进入服务器试部署和真实门店数据试用。唯一未实跑的是 Docker 容器启动和 Playwright 数据库 E2E，原因是本机 Docker Desktop Linux daemon 未启动。

## 功能验收

| 模块 | 状态 | 验收点 |
| --- | --- | --- |
| 登录与权限 | 通过 | 后台页面和核心 API 受会话保护；角色权限统一为 OWNER / MANAGER / STAFF / VIEWER。 |
| 首页看板 | 通过 | 支持日期、门店、服务组筛选；统计口径排除取消收入。 |
| 门店管理 | 通过 | 支持新增、编辑、启停、删除限制。 |
| 员工管理 | 通过 | 支持新增、编辑、启停、门店绑定；订单可分配员工。 |
| 服务组与排期 | 通过 | 支持服务组 CRUD、容量、时长、生成预约时段。 |
| 商品管理 | 通过 | 支持服务、团单、附加、冲印、抖音、美团产品类型和产品导入。 |
| 外部渠道插件 | 通过配置验收 | 当前支持抖音/美团产品类型、来源筛选和插件占位；抖音企业版主线按服务市场平台应用类服务接入，先做已购查询、购买明细和 `service_market_order` webhook，当前 Next MVP 不保存真实 token。 |
| 预约端 | 通过 | 支持手机 H5 预约、日期/门店/服务组/产品/时段联动、满员校验。 |
| 订单核心闭环 | 通过 | 支持筛选、详情、确认、开始服务、完成、取消原因、改期、员工分配和日志。 |
| 客户管理 | 通过 | 支持客户列表、预约历史、消费汇总和备注。 |
| 操作日志 | 通过 | 核心写操作记录审计日志，可后台查询。 |
| 导入导出 | 通过 | 支持订单 CSV、客户 CSV、营销/报表/业绩 CSV、产品 JSON 导入。 |
| 通知预留 | 通过 | 支持通知模板、dry-run 发送、发送记录。 |
| 报表与分析 | 通过 | 支持经营报表、客户/产品/评价分析、员工业绩、门店月报、营销统计。 |
| 客片选片 | 通过 | 支持相册、照片 URL/路径登记、发布、公开分享链接、选片结果保存。 |
| 生产部署 | 通过配置验收 | 支持 Docker Compose、PostgreSQL、Caddy HTTPS、健康检查、备份脚本。 |

## 自动化验证

| 命令 | 结果 |
| --- | --- |
| `npm run typecheck` | 通过 |
| `npm run lint` | 通过 |
| `npm test` | 通过，20 个测试文件、64 条用例 |
| `npx prisma validate` | 通过 |
| `npm run build` | 通过 |
| `docker compose -f docker-compose.prod.yml config` | 通过，使用 `.env.production.example` 临时验证 |

## 环境阻塞

| 项目 | 当前状态 | 处理方式 |
| --- | --- | --- |
| Docker 实际启动 | 未执行 | 本机 Docker daemon 未启动，报错 `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`。启动 Docker Desktop 后执行生产部署命令。 |
| Playwright 数据库 E2E | 未执行 | 需要 PostgreSQL 或 Docker 数据库服务先启动。当前已有 `tests/e2e/p0-smoke.spec.ts`，数据库就绪后运行 `npm run test:e2e`。 |
| 真实生产密钥 | 未配置 | `.env.production` 不应提交；上线前按 `.env.production.example` 复制并替换强密码、域名、邮箱。 |
| 抖音/美团真实接口联调 | 未执行 | 需要正式开放平台应用、服务市场授权、测试白名单和测试订单。抖音第一批接口按 `/aweme/v2/creator/service_market/user/service/status`、`/market/service/user/purchase/list/` 和 `service_market_order` webhook 设计，详见 `docs/channel-plugin-integration-plan.md`。 |

## 上线前命令

```bash
cp .env.production.example .env.production
# 修改 .env.production 中的 APP_DOMAIN、CADDY_EMAIL、AUTH_SECRET、NEXTAUTH_SECRET、POSTGRES_PASSWORD、ADMIN_PASSWORD
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec web npm run prisma:seed
curl -fsS https://你的域名/api/health
```

## 试运营建议

先用 1 个门店、2-3 个员工、5 个商品、1 周预约时段做灰度试运营。试运营第一周重点观察预约容量、订单状态流转、导出数据、客片分享链接和备份文件是否稳定。
