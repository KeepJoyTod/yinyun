# 简约式预约工作台验收记录 2026-06-17

## 结论

本轮已完成预约工作台核心链路的增量对齐：

- 排期页：上午/下午/晚上固定分组，时段点击进入预约订单筛选，不再直接从空时段创建订单。
- 店员新增订单：前端表单已支持客户信息、门店、服务组、产品、档期模式、通知、保存/保存并接待。
- 后端 `/yy/order/staff-booking`：支持 `scheduleMode=UNDECIDED` 不占库存，`submitMode=SAVE_AND_RECEIVE` 进入 `SERVING`。
- 订单页：补齐简约式筛选标签和入口，包括 `关键字`、`选择门店`、`下单来源`、`下单方式`、`高级查询`、`预约看板`、`新增订单`。
- 状态分组：保留 `全部有效订单`、`待服务`、`服务中`、`已完成`、`待支付`、`已取消`、`已退单`。

## 验证命令

```powershell
npm --prefix studio-workbench run test -- JianyueSlotGrid.contract.test.ts ScheduleView.contract.test.ts
```

结果：2 个文件通过，14 个用例通过。

```powershell
npm --prefix studio-workbench run test -- StaffBookingModal.contract.test.ts appStore.contract.test.ts backend.contract.test.ts
```

结果：3 个文件通过，32 个用例通过。

```powershell
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am '-Dtest=YyOrderServiceImplTest' '-Dsurefire.failIfNoSpecifiedTests=false' '-DskipTests=false' '-Dmaven.test.skip=false' test
```

结果：`YyOrderServiceImplTest` 29 个用例通过。

```powershell
npm --prefix studio-workbench run test -- OrdersView.contract.test.ts orderOperations.test.ts
```

结果：4 个文件通过，60 个用例通过。

```powershell
npm --prefix studio-workbench run test
```

结果：86 个文件通过，480 个用例通过。

```powershell
npm --prefix studio-workbench run build
```

结果：`vue-tsc -b && vite build` 通过。存在既有 Vite chunk size warning。

```powershell
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile
```

结果：BUILD SUCCESS。

## 浏览器冒烟

本地 `http://localhost:5191/order/appointment` 被 API 模式登录拦截到：

```text
http://localhost:5191/login?redirect=/order/appointment
```

尝试 demo 登录仍停留在登录页，说明当前本地服务不是 demo 免后端模式。未使用真实账号密码做本地浏览器登录，避免在本地测试中传输或记录凭据。

## 已知边界

- `productId/customerId/gender/email/notifyEnabled` 当前后端 BO 兼容接收，但 `yy_order` 没有对应列，本轮不扩表。
- 历史 `DOUYIN_LIFE` 订单没有真实预约时段，仍不写 `yy_booking_slot_inventory`。
- 真正浏览器验收需要使用已登录 API 模式或部署后线上登录态打开 `/order/appointment` 和 `/dashboard/today`。
