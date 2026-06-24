# 影约云门店工作台完整功能融合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留影约云现有视觉和统一后端的前提下，完成参考系统能力融合、真实数据接入、权限隔离和生产部署。

**Architecture:** 前端以集中式功能注册表驱动路由、侧栏、面包屑和建设状态；已有业务复用 `/yy/*` 接口，新增工单、会员和营销能力进入 `ruoyi-yy` 模块。所有业务数据继续由 PostgreSQL 统一持久化，工作台不建立独立账本。

**Tech Stack:** Vue 3、Vue Router、Tailwind CSS、Vitest、Spring Boot、RuoYi-Vue-Plus、MyBatis-Plus、PostgreSQL、Redis、阿里云 OSS。

---

### Task 1: 工作台功能注册表与完整菜单

- [x] 先写路由和菜单契约测试，锁定 12 个分组、完整入口、权限元数据、建设状态和旧路由重定向。
- [x] 新增集中式功能注册表和统一建设中页面。
- [x] 改造侧栏为可折叠分组，增加菜单搜索、状态和数量提示。
- [x] 运行 `npm test` 和 `npm run build`。

### Task 2: 工作台 bootstrap 与权限

- [x] 先写 bootstrap 服务和 Controller 测试。
- [x] 返回员工身份、门店范围、权限、功能开关和待办数量，ID 使用字符串。
- [x] 前端登录后加载 bootstrap，并按权限过滤菜单和门店数据。
- [x] 运行后端模块测试和前端测试。

### Task 3: 订单与排期闭环

- [x] 先写并通过订单状态机、expectedStatus 并发保护和改期库存服务测试。
- [x] 新增工作台订单状态流转和改期接口，状态流转不再走通用 PUT。
- [x] 前端增加 URL 筛选同步、详情抽屉和专用状态流转调用。
- [x] 补前端改期 UI、冲突提示和并发占位端到端验收。

### Task 4: 已有运营模块接入

- [ ] 接入服务组、库存、商品分类、客户、员工、客片、选片和通知真实接口。
- [x] 服务组管理页替换为真实页面，并接入 `/yy/serviceGroup/*`。
- [x] 时段库存页替换为真实页面，并接入 `/yy/bookingSlotInventory/*`。
- [x] 员工管理页替换为真实页面，并接入 `/yy/employee/*`。
- [x] 客户档案页替换为真实页面，并接入 `/yy/customer/*` 与最近订单接口。
- [x] 通知模板页替换为真实页面，并接入 `/yy/notificationTemplate/*` 与 `/yy/notificationLog/*`。
- [ ] 替换标题级占位页面。
- [ ] 为每个页面补加载、空态、错误和权限状态契约测试。

### Task 5: 工单协作

- [ ] 新增工单、环节和事件表及幂等迁移。
- [ ] 实现拍摄、初修、精修、选片、排版、交付状态机。
- [ ] 实现分配、流转、超时统计和数据导出页面。

### Task 6: 会员与营销

- [ ] 新增会员账户、卡项、券模板、券实例、核销、活动、参与、表单和提交表。
- [ ] 实现对应 CRUD、核销幂等和门店数据范围。
- [ ] 实现会员、卡券、活动和表单工作台页面。

### Task 7: 报表、财务与日志

- [ ] 新增日报、月报、商品、员工、修图、渠道、客户和转化实时聚合接口。
- [ ] 收支统计统一读取订单、支付和退款数据。
- [ ] 复用系统操作日志并串联订单、工单和渠道同步日志。

### Task 8: 文档、回归与部署

- [ ] 更新代码、功能、API、数据库、权限和部署地图。
- [ ] 运行前端、后端、小程序全量测试与构建。
- [ ] 使用 Playwright 检查关键视口和三类员工权限。
- [ ] 部署 `studio.evanshine.me`，保留旧路由和回滚包。
