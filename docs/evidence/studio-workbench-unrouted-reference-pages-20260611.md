# 门店工作台未路由参考页面确认

日期：2026-06-11

## 结论

以下 `studio-workbench` 文件目前只是参考项目迁入后的标题级占位，不是正式页面：

- `src/features/customers/CustomersView.vue`
- `src/features/finance/FinanceView.vue`
- `src/features/packages/PackagesView.vue`

当前正式路由仍以 `src/app/router/index.ts` 为准：

- `/`
- `/orders`
- `/schedule`
- `/store`
- `/config`
- `/photo-mgmt`
- `/online-selection`
- `/settings`
- `/login`

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
rg "CustomersView|FinanceView|PackagesView|features/customers|features/finance|features/packages" studio-workbench\src docs docs\yiyue\前端优化 -n
rg "RouteRecordRaw|path:|component:" studio-workbench\src\app\router\index.ts -n
```

验证结果：

- `CustomersView`、`FinanceView`、`PackagesView` 未出现在 `studio-workbench/src/app/router/index.ts`。
- 三个文件内容均为标题级占位，不作为当前门店工作台 P0/P1 验收入口。
- 现有正式入口继续看 `studio-workbench` 路由表和 `docs/studio-workbench-code-map-20260610.md`。
