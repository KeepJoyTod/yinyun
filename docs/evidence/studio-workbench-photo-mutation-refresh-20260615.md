# Studio Workbench 客片删除/重命名刷新一致性证据

日期：2026-06-15

## 结论

本切片继续收口 T03 客片整理：`/service/photos` 的底片删除和重命名操作在 Store 层保持列表、总数、已选数一致。

保持的边界：

- `yy_photo_album` / `yy_photo_asset` 仍是客片主账本。
- Demo 模式只更新本地演示数据，不伪造后端写库。
- API 模式在 `renameAlbumPhoto` / `deleteAlbumPhoto` 成功后重载相册详情，使用后端权威相册覆盖本地列表和计数。
- 本切片不实现客户访问日志、通知发送、客片确认、资料发送、收入或加片金额。

## 改动范围

- `studio-workbench/src/shared/stores/appStore.ts`
  - `renameAlbumPhoto(...)` 支持按前端 id 或 backendId 找到底片。
  - API 模式重命名成功后调用 `loadAlbumDetails(album.id)`，避免只信任单条 PUT 返回。
  - `deleteAlbumPhoto(...)` 支持按前端 id 或 backendId 找到底片。
  - Demo 模式删除后按剩余 `negative.selected` 重算 `selectedCount`，并用剩余数量重算 `totalCount`。
  - API 模式删除成功后调用 `loadAlbumDetails(album.id)`，让列表、排序、总数、已选数来自后端权威状态。

- `studio-workbench/src/shared/stores/appStore.albumPhotos.test.ts`
  - 新增真实 `appStore` 行为测试。
  - 覆盖删除已选 demo 底片后的 `selectedCount` 重算。
  - 覆盖 API 模式重命名后调用 `backendApi.getAlbum(...)` 并采用后端返回文件名。
  - 覆盖 API 模式删除后重载相册总数、已选数和底片列表。

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- appStore.albumPhotos.test.ts
```

结果：

```text
Test Files 1 failed (1)
Tests 3 failed (3)
失败点：
- 删除已选 demo 底片后 selectedCount 仍为 2，预期 1。
- API 模式 rename 后 backendApi.getAlbum 调用次数为 0。
- API 模式 delete 后 backendApi.getAlbum 调用次数为 0。
```

### GREEN

命令：

```powershell
npm test -- appStore.albumPhotos.test.ts
```

结果：

```text
Test Files 1 passed (1)
Tests 3 passed (3)
```

### 定向回归

命令：

```powershell
npm test -- appStore.albumPhotos.test.ts appStore.contract.test.ts PhotoMgmtView.contract.test.ts photoMgmtOperations.test.ts
```

结果：

```text
Test Files 4 passed (4)
Tests 33 passed (33)
```

### 全量测试

命令：

```powershell
npm test
```

结果：

```text
Test Files 69 passed (69)
Tests 368 passed (368)
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
✓ built in 3.84s
```

### 本地浏览器 smoke

目标：

```text
http://localhost:5190/service/photos
```

结果：

```json
{
  "tileCount": 8,
  "selectedTiles": 3,
  "counters": ["2 / 2", "3/ 8", "0/ 4", "0 / 8"],
  "consoleErrors": 0
}
```

## 剩余风险

- 真实 API 模式仍需要登录态和真实相册验证 `PUT /yy/photoAsset`、`DELETE /yy/photoAsset/{id}`、`GET /yy/photoAlbum/{id}` 的生产闭环。
- 真实 OSS 浏览器验收仍需在生产相册上传实际图片后执行。
