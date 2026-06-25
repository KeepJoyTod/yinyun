# 简约网对标地图

更新时间：2026-06-24

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
