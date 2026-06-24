# 客户电脑网页相册列表交付提醒验收证据

日期：2026-06-11

## 范围

- 页面：`client-web /customer/albums`
- 文件：
  - `client-web/src/views/CustomerAlbumsView.vue`
  - `client-web/src/styles.css`
  - `client-web/src/shared/customerAlbumsPageContract.test.ts`

## 本轮结果

- 相册列表新增 `album-service-panel`。
- 页面展示“交付提醒”，包含打开相册、预览确认、保存原图三步说明。
- 页面展示“联系门店”协助卡，说明延期或重新授权时找门店处理。
- 空相册状态展示换手机号登录、预约拍摄、拨打门店电话三个恢复动作。
- 相册详情照片未上传状态展示刷新照片目录、返回相册列表、拨打门店电话三个恢复动作。
- 不改后端接口，不改 token 逻辑，不暴露 OSS 长期直链。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- customerAlbumsPageContract
npm test
npm run build
```

结果：

- `customerAlbumsPageContract`：1 个测试文件，4 个测试通过。
- `customerAlbumDetailPageContract`：1 个测试文件，4 个测试通过。
- `npm test`：9 个测试文件，30 个测试通过。
- `npm run build`：通过。

## 浏览器检查

测试账号：

```text
手机号：13900001111
取片码：PREVIEW-20260608
```

检查结果：

- API 返回相册 `990202606080001`，照片数 `4`。
- 桌面 `1280` 宽：`/customer/albums` 可见交付提醒、联系门店卡、相册卡；无横向溢出；控制台无 error。
- 移动 `390` 宽：交付提醒和步骤自动单列；无横向溢出；控制台无 error。
- 详情页 `/customer/albums/990202606080001`：桌面和移动宽度均可见 4 张照片、交付说明和照片目录工具条；无横向溢出；控制台无 error。
- 真实 token 必须绑定至少一个授权相册，空列表通常只发生在 token 发出后相册被停用、过期或删除；空状态按钮由契约测试覆盖。
