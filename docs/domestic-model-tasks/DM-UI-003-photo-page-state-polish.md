> owner: domestic-model-task-DM-UI-003-photo-page-state-polish
> canonical_for: 国产模型精修客片管理页空态、错误态和批量操作反馈的单任务边界
> upstream: docs/studio-workbench-feature-code-map-20260615.md, docs/studio-workbench-optimization-map-20260615.md
> downstream: studio-workbench/src/features/albums/PhotoMgmtView.vue

# DM-UI-003：客片页空态和错误态精修

## 目标

优化 `/service/photos` 的上传、相册详情、缩略图失败、批量选择、删除/重命名刷新提示。只做前端状态和反馈，不改 OSS 权限。

## 允许修改

```text
studio-workbench/src/features/albums/PhotoMgmtView.vue
studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts
studio-workbench/src/features/albums/photoMgmtOperations.ts
studio-workbench/src/features/albums/photoMgmtOperations.test.ts
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不把 OSS 桶改 public-read。
- 不暴露长期 OSS 直链。
- 不绕过后端鉴权下载或预览。
- 不伪造访问量、下载量、客户已看。
- 不改 `yy_photo_album` / `yy_photo_asset` 账本语义。

## 实施要点

1. 空相册要告诉店员下一步是上传照片，不要展示假照片。
2. 上传失败要显示文件名、接口阶段、错误摘要和复制按钮。
3. 缩略图失败要区分对象缺失、无权限、网络失败的展示文案；不能泄露签名 URL。
4. 批量选择成功后提示已写回已选状态；失败时提示重试。
5. 删除/重命名后说明页面会以服务端权威相册刷新。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- PhotoMgmtView
npm test -- photoMgmtOperations
npm test
npm run build
```

验收标准：

- 空态、失败态、批量操作态都能让店员知道下一步。
- 页面不出现裸 OSS 签名参数。
- API 模式失败不回退 demo。

## 交给国产模型时复制

```text
你只做 DM-UI-003：客片管理页空态和错误态精修。
不改 OSS 权限、不暴露签名 URL、不伪造访问日志、不部署。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
docs/domestic-model-tasks/DM-UI-003-photo-page-state-polish.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- PhotoMgmtView
npm test -- photoMgmtOperations
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
