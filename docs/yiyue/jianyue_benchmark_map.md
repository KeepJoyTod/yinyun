# 简约网对标地图

更新时间：2026-06-24

## 2026-06-25 product-function-gap-plan

### 对标结论
- 已只读观察简约网参考后台首页、菜单、应用商城、抖音产品、美团产品、会员储值、费用中心、收支明细、平台对接、预约设置和权益核销统计。
- 当前项目不是全部完善；`docs/product-function-gap-plan-20260625.md` 已记录未完善功能和完善计划。
- 重点差距：参考站可见应用商城购买/试用、抖音/美团/会员充值未开通提示、费用中心和收支明细页面、预约退改规则、权益核销统计；当前项目对应能力多为脚手架、只读或待验收。

### 后续验收要求
- 简约网入口只作为需求基线；任何当前项目完成判断必须继续回到本仓库 owner/API/表结构/测试和生产 smoke 证据。
- 抖音、美团、支付、短信、会员储值、提现、退款等能力必须按插件授权、合规、审计和目标环境白名单边界单独验收。

## 2026-06-24 full-product-closed-loop-phase234-scaffold

### 当前状态
- 样片作品入口已从旧兼容路径拆出正式 owner：`/tools/sample-works`。
- 旧 `tools/photo/sample` 保留为兼容跳转，避免历史收藏路径失效。
- `平台设置 / 账号中心 / 费用中心` 已进入一级导航，后续对标简约网后台时可以逐项补真实入口与交互。

## 2026-06-24 docs-yiyue-integration

### 当前状态
- 本文件随 `docs\yiyue` 目录整合补齐，用作简约网对标交互的长期入口。
- 原桌面目录中未发现同名文件；已有差异记录暂仍分散在 `docs\yiyue\optimization_map.md` 和相关合同、证据文档中。

### 后续登记规则
- 改预约、排期、今日预约、时段格子、订单详情、改期、取消、到店、服务中、完成等简约网对标交互时，更新本文件。
- 每条记录至少写明用户入口、后端 API、读写表、空态/加载/失败/权限状态和验证命令。

## 2026-06-24 internal-collaboration-work-order-stage-sla

### 对标点
- 简约网后台可见内部协作、岗位执行、工单导出和环节统计类入口；影约云本轮把对应工单主链收口到真实 `yy_work_order`。
- 用户入口：`/collaboration/work-orders`、`/collaboration/execution-overview`、`/collaboration/export`、`/collaboration/statistics`。
- 后端 API：`GET /yy/workOrder/list`、`POST /yy/workOrder/{id}/transition`。
- 读写表：`yy_work_order`、`yy_work_order_event`。

### 状态要求
- 空态：无工单时展示空工单提示。
- 加载态：读取真实工单列表时展示 loading。
- 失败态：后端失败时展示错误卡片，不伪造派生工单。
- 权限态：沿用 `yy:workOrder:list/edit/export` 后端权限码。

### 验证命令
- `npm --prefix studio-workbench run test -- src/features/collaboration/workOrderRuntime.test.ts`
- `mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dtest=YyWorkOrderServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" test`
## 2026-06-24 phase3-center-api-owner

### 对标说明
- 简约网可见的工具、账号、费用入口，在本仓库已先落到后端 API owner：
  - 工具中心：样片作品、精准投放
  - 账号中心：个人资料、我的品牌、帮助中心
  - 费用中心：费用概览、收支明细
- 本包不代表真实参考站点已完成保存、充值、发布、品牌切换等写操作验收。

## 2026-06-25 order-card-batch-scaffold

### 对标说明
- 参考站 `B-043` 当前仍表现为未开通/未授权。
- 当前项目已把这条能力提升为可访问脚手架：`/order/card-batch`。

### 验收边界
- 当前只验 owner、接口和审批账本，不验真实批量发卡。
- 判断完成度时，必须同时检查 `yy_risk_approval`、工作台路由和目标测试。
