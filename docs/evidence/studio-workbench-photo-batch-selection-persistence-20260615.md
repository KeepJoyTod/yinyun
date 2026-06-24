# Studio Workbench 客片批量选片持久化证据

日期：2026-06-15

## 结论

本切片收口 T03 的客片整理缺口：`/service/photos` 的“批量标记已选 / 批量取消已选”不再只改前端 `selectedCount`，而是按单张底片写回 `yy_photo_asset.is_selected`。

保持的边界：

- `yy_photo_album` / `yy_photo_asset` 仍是客片主账本。
- 私有 OSS 不改 public-read，客户访问仍走后端鉴权 URL 或 stream。
- 本次不伪造客户访问次数、通知发送、客片确认、资料发送或收入。
- Demo 模式只改本地演示数据；API 模式走后端 `GET /yy/photoAsset/{id}` + `PUT /yy/photoAsset`。

## 改动范围

- `studio-workbench/src/features/albums/photoMgmtOperations.ts`
  - `buildPhotoItems(...)` 改为使用每张底片的真实 `selected` 字段，不再用 `selectedCount` 猜测前 N 张已选。
  - 新增 `buildPhotoSelectionUpdateTargets(...)`，只返回当前可见、被勾选、且状态确实需要变化的照片。

- `studio-workbench/src/features/albums/PhotoMgmtView.vue`
  - 批量标记按钮改为异步保存。
  - 保存中禁用批量按钮，并显示“保存中...”。
  - 保存失败时显示“选片状态保存失败”。
  - 保存成功后清空当前勾选。

- `studio-workbench/src/shared/stores/appStore.ts`
  - 新增 `markAlbumPhotosSelected(...)`。
  - Demo 模式更新本地底片 `selected` 字段并按真实字段重算 `selectedCount`。
  - API 模式调用 `backendApi.markAlbumPhotosSelected(...)` 后用返回 DTO 更新本地底片。

- `studio-workbench/src/shared/api/backend.ts`
  - 新增 `markAlbumPhotosSelected(...)`。
  - 每张底片先读取现有 `/yy/photoAsset/{id}`，再保留原字段并更新 `isSelected`，最后 `PUT /yy/photoAsset`。

- 测试：
  - `photoMgmtOperations.test.ts`
  - `PhotoMgmtView.contract.test.ts`
  - `backend.contract.test.ts`
  - `appStore.contract.test.ts`

## 验证

### RED

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- photoMgmtOperations.test.ts PhotoMgmtView.contract.test.ts backend.contract.test.ts appStore.contract.test.ts
```

结果：

```text
Test Files 4 failed (4)
Tests 5 failed | 38 passed (43)
失败点：buildPhotoItems 仍按 selectedCount 猜测；缺 buildPhotoSelectionUpdateTargets；页面/store/backend 缺批量选片持久化。
```

### GREEN

命令：

```powershell
npm test -- photoMgmtOperations.test.ts PhotoMgmtView.contract.test.ts backend.contract.test.ts appStore.contract.test.ts
```

结果：

```text
Test Files 4 passed (4)
Tests 43 passed (43)
```

### 全量测试

命令：

```powershell
npm test
```

结果：

```text
Test Files 68 passed (68)
Tests 365 passed (365)
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
✓ built in 2.51s
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
http://localhost:5190/service/photos
```

结果：

```json
{
  "initial": {
    "album": "ALB-20260610-001",
    "total": 8,
    "selected": 3
  },
  "afterBatchMark": {
    "clickedTile": "chen-04.jpg",
    "labels": ["Selected", "Selected", "Selected", "Selected", "Pending", "Pending", "Pending", "Pending"],
    "selectedSummary": "已上传 8 · 已选 4 · 待确认 4",
    "progressSummary": "4 of 8 Photos",
    "toolbarReset": true
  },
  "afterBatchUnmark": {
    "clickedTile": "chen-01.jpg",
    "labels": ["Pending", "Selected", "Selected", "Selected", "Pending", "Pending", "Pending", "Pending"],
    "selectedSummary": "已上传 8 · 已选 3 · 待确认 5",
    "progressSummary": "3 of 8 Photos",
    "toolbarReset": true
  },
  "consoleErrors": 0
}
```

## 剩余风险

- 真实 API 模式仍需要登录态和真实相册验证 `PUT /yy/photoAsset` 的生产写库结果。
- 客户访问统计、通知发送、客片确认、资料发送仍按预实现方案等待正式后端能力，不在本切片伪造。
