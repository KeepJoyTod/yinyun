# Studio Workbench 库存服务组筛选证据

日期：2026-06-15

## 结论

本切片收口 T02 的库存账本筛选：`/merchant/inventory` 现在可以按服务组筛选时段库存，并把筛选条件透传到后端 `/yy/bookingSlotInventory/list?serviceGroupId=...`。

保持的边界：

- `yy_booking_slot_inventory` 仍是本地全渠道真实库存账本。
- `yy_channel_inventory_slot` 仍只是抖音平台库存镜像。
- 本次不新增 Java 后端代码；后端查询已经支持 `serviceGroupId`。
- 摄影师筛选暂不实现，因为当前排期/库存数据源没有稳定摄影师字段，不能用员工或服务组做假映射。
- 不伪造库存、支付、核销、优惠券、评价或收入。

## 改动范围

- `studio-workbench/src/features/merchant/inventoryOperations.ts`
  - 新增 `getInventoryServiceGroupOptions(...)`，只展示 `ACTIVE` 服务组，并在选中门店时按门店收窄。
  - 新增 `buildInventoryCards(...)`，把库存统计卡片从页面内联计算移到纯函数。

- `studio-workbench/src/features/merchant/InventoryView.vue`
  - 新增“服务组”下拉筛选。
  - 门店切换后，如果当前服务组不属于该门店，自动回到“全部服务组”。
  - 日期、门店、服务组、冲突筛选变更后立即重新加载库存。

- `studio-workbench/src/shared/stores/appStore.ts`
  - `loadBookingInventory(...)` 新增 `serviceGroupBackendId`。
  - Demo 模式按 `serviceGroupBackendId` 本地过滤。
  - API 模式把 `serviceGroupBackendId` 映射为后端 `serviceGroupId`。

- `studio-workbench/src/shared/api/backend.ts`
  - `listBookingInventory(...)` query 增加 `serviceGroupId`，并显式构造后端 query。

- `studio-workbench/src/features/merchant/inventoryOperations.test.ts`
  - 覆盖服务组 options 的门店范围和 ACTIVE 过滤。
  - 覆盖库存卡片统计来自当前加载的 slot 集合。

- `studio-workbench/src/features/merchant/InventoryView.contract.test.ts`
  - 锁定页面必须保留服务组筛选和 `buildInventoryCards(...)`。

- `studio-workbench/src/shared/api/backend.contract.test.ts`
  - 锁定 `/yy/bookingSlotInventory/list` query 必须包含 `serviceGroupId` 映射。

## 后端依据

后端 `YyBookingSlotInventoryServiceImpl.buildQueryWrapper(...)` 已支持：

```text
serviceGroupId -> yy_booking_slot_inventory.service_group_id
storeId -> yy_booking_slot_inventory.store_id
bizDate / beginBizDate / endBizDate -> biz_date
conflictOnly -> conflict_count > 0
```

因此本切片只补前端 query 入口，不改后端 SQL。

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- inventoryOperations.test.ts InventoryView.contract.test.ts backend.contract.test.ts
```

结果：

```text
Test Files 3 failed (3)
Tests 3 failed | 11 passed (14)
失败点：缺 inventoryOperations；InventoryView 缺 serviceGroupFilter/buildInventoryCards；backend.ts 缺 serviceGroupId 映射。
```

### GREEN

命令：

```powershell
npm test -- inventoryOperations.test.ts InventoryView.contract.test.ts backend.contract.test.ts
```

结果：

```text
Test Files 3 passed (3)
Tests 16 passed (16)
```

### 全量测试

命令：

```powershell
npm test
```

结果：

```text
Test Files 68 passed (68)
Tests 360 passed (360)
```

### 构建

命令：

```powershell
npm run build
```

结果：

```text
vue-tsc -b && vite build
2829 modules transformed
✓ built in 2.49s
```

### 空白检查

命令：

```powershell
git diff --check
```

结果：

```text
exit 0
仅有 LF/CRLF 工作区提示，无 whitespace error
```

### 本地浏览器 smoke

目标：

```text
http://localhost:5190/merchant/inventory
```

结果：

```json
{
  "initial": {
    "serviceGroupOptions": ["全部服务组", "证件照快拍组", "形象照主棚", "交付与取片组"],
    "slotCount": 3
  },
  "afterServiceGroup": {
    "selectedText": "形象照主棚",
    "cards": {
      "时段总数": "1",
      "库存冲突": "1",
      "满载时段": "1",
      "总容量": "3"
    },
    "rows": ["影约云深圳旗舰店 / 形象照主棚"]
  },
  "afterStoreChange": {
    "storeSelectedText": "影约云香港交付点",
    "serviceSelectedText": "全部服务组",
    "serviceOptions": ["全部服务组", "交付与取片组"],
    "rows": ["影约云香港交付点 / 交付与取片组"]
  },
  "consoleErrors": 0
}
```

## 剩余风险

- 真实 API 模式下仍需要登录态验证 `/yy/bookingSlotInventory/list?serviceGroupId=...` 的生产返回。
- 摄影师筛选需要后端排期/库存源增加明确摄影师字段后再做，当前不应前端臆造。
