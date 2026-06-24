# 门店工作台 Store 页占位 Scope 清理验证

日期：2026-06-11

## 变更

- `studio-workbench /store` 的“待服务单”操作卡 scope 从占位语义改为 `SERVICE`。
- `StoreView.contract.test.ts` 增加契约测试，防止门店页操作卡再次出现占位 scope。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run test -- StoreView.contract
npm run build
```

结果：

- `StoreView.contract`：4 tests passed。
- `studio-workbench build`：通过。
- Vite 仍有 Dashboard chunk > 500 kB 的既有 warning，不阻塞本次变更。

## 扫描

```powershell
rg "scope: 'TODO'|TODO" studio-workbench\src\features\stores\StoreView.vue studio-workbench\src\features\stores\StoreView.contract.test.ts -n
```

结果：无匹配。
