> owner: domestic-model-task-DM-API-003-backend-skeleton-contracts
> canonical_for: 国产模型补后端业务接口骨架时的边界、文件范围和验收规则
> upstream: docs/contracts/studio-workbench-api-contract-20260615.md, docs/api/studio-workbench-openapi-skeleton-20260615.yaml
> downstream: backend/ruoyi-modules/ruoyi-yy

# DM-API-003：后端业务接口骨架

## 目标

为工单、优惠券、会员、评价等 `SKELETON` 接口补后端最小骨架。一次只做一个业务域，并且必须 Codex review 后才能合并。

## 可选业务域

一次只选一个：

```text
workOrder
coupon
member
customerReview
```

2026-06-15 更新：`workOrder` 后端 CRUD、`POST /yy/workOrder/{id}/transition`、`GET /yy/workOrder/{id}/events`、`YyWorkOrderServiceImplTest`、前端 `backendApi.listWorkOrders/getWorkOrder/listWorkOrderEvents/transitionWorkOrder()` 和契约测试已由 Codex 补齐。后续不要重复生成 `YyWorkOrder*` 后端类或 `backend.ts` facade；如果选择 `workOrder`，只允许做权限菜单、页面切真表方案、smoke 证据和文档。

## 允许修改模板

按现有 RuoYi `yy` 模块风格创建：

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/Yy<Domain>.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/Yy<Domain>Bo.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/Yy<Domain>Vo.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/Yy<Domain>Mapper.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYy<Domain>Service.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/Yy<Domain>ServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/Yy<Domain>Controller.java
backend/ruoyi-modules/ruoyi-yy/src/main/resources/mapper/yy/Yy<Domain>Mapper.xml
backend/script/sql/postgres/<review-only-migration>.sql
docs/studio-workbench-api-route-map.md
docs/contracts/studio-workbench-api-contract-20260615.md
```

## 禁止

- 不直接执行数据库迁移。
- 不新增第二套订单账本。
- 不写假支付、假核销、假优惠券成功。
- 不碰 `DOUYIN_LIFE` 真实 SPI/OpenAPI 逻辑。
- 不复制密钥或生产配置。

## 实施步骤

1. 选一个业务域，并在回报里写明选择。
2. 按现有 `YyReportSnapshot` 或 `YyPhotoAccessLog` 风格补 domain/bo/vo/mapper/service/controller。
3. SQL 只写 review-only 迁移草稿，不执行。
4. Controller 只提供 list/get/add/edit/remove 或只读 list，按契约决定。
5. 权限码按 `yy:<domain>:list/query/add/edit/remove/export` 风格。
6. 补单元/契约测试；如果无法启动后端测试，至少做编译和文档校验。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-studio-api-contracts.ps1
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -am test -DskipITs
```

如果本机 Maven 环境不可用，必须回报具体错误，不可写“已通过”。

## 交给国产模型时复制

```text
你只做 DM-API-003：后端业务接口骨架。
一次只选一个业务域：coupon / member / customerReview。workOrder 已有后端和前端 facade，只能做权限菜单、页面切真表方案、smoke 或文档。
不执行数据库迁移，不碰密钥，不伪造支付/核销/优惠券成功，不改 DOUYIN_LIFE 真实 SPI。

先读：
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
docs/domestic-model-tasks/DM-API-003-backend-skeleton-contracts.md

完成后运行验证命令，按“结果 / 改动 / 验证 / 风险”回报。
```
