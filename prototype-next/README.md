# 照相馆预约系统

基于 `照相馆需求文档PRD.docx` 的新系统重建版本。当前版本已落地首版核心闭环：登录、门店、服务组、产品、预约提交、订单状态、后台看板和基础权限规则。

## 技术栈

- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS
- Vitest
- Docker Compose

## 本地启动

```powershell
Copy-Item .env.local.example .env
npm ci
docker compose up -d
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

访问：

- 后台看板：`http://localhost:3000/dashboard`
- 登录页：`http://localhost:3000/login`
- 门店管理：`http://localhost:3000/stores`
- 服务组管理：`http://localhost:3000/service-groups`
- 产品管理：`http://localhost:3000/products`
- 订单管理：`http://localhost:3000/orders`
- 客户预约端：`http://localhost:3000/booking`

种子账号：

- 手机号：`17863026867`
- 密码：使用 `.env` 中的 `ADMIN_PASSWORD`

## 验证命令

```powershell
npm run prisma:generate
npm test
npm run typecheck
npx prisma validate
npm run build
```

如果只需要在没有本地 `.env` 的情况下验证构建，可临时设置进程环境变量：

```powershell
$env:DATABASE_URL='postgresql://camera:camera@localhost:5432/camera_studio?schema=public'
npm run build
```

## 当前已实现

- 登录会话：
  - 手机号/密码登录
  - HTTP-only Cookie 会话
  - 后台页面和服务组 API 登录保护
  - 开发环境数据库未启动时支持 `.env` 中的演示账号降级登录
- 领域规则：
  - 预约时段容量计算
  - 满员拦截
  - 订单状态流转
  - 角色权限判断
  - 预约订单草稿生成
- 数据模型：
  - 品牌、门店、后台用户、员工、客户
  - 服务组、产品、预约时段
  - 订单、订单项、支付预留、审计日志
- 页面：
  - 登录页
  - 后台看板
  - 门店管理
  - 服务组管理
  - 产品管理
  - 订单管理
  - 客户预约端：门店、服务组、产品、时段联动选择
- API：
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `GET /api/booking-options`
  - `POST /api/appointments`
  - `GET/POST /api/service-groups`
  - `PATCH/DELETE /api/service-groups/:id`
  - `POST /api/orders/:id/action`
  - `GET/POST /api/products`
  - `PATCH/DELETE /api/products/:id`

## 生产部署

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec web npm run prisma:seed
```

详见 `docs/deployment.md`。

## 后续优先级

1. 订单详情、改期、员工分配。
2. 统计报表按 PRD 的 P1/P2 页面继续补齐。
3. 预约端补日期日历、小程序样式和支付/核销入口。
4. 服务器部署 HTTPS、数据库备份、日志监控。
