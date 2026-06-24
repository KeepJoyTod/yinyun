# 客户电脑网页端门店联系入口统一证据

日期：2026-06-11

## 范围

- `client-web/src/shared/customerSupport.ts`
- `client-web/src/views/CustomerLoginView.vue`
- `client-web/src/views/CustomerResultView.vue`
- `client-web/src/views/CustomerAlbumsView.vue`
- `client-web/src/views/CustomerAlbumDetailView.vue`

## 本轮结果

- 新增 `CUSTOMER_SUPPORT`，集中维护：
  - `phoneDisplay`
  - `telHref`
  - `pickupHelpCopy`
- 客户取片登录页、结果页、相册列表页、相册详情页不再直接写死 `tel:075588882026`。
- 后续更换真实门店电话或接客服二维码时，先改 `customerSupport.ts`，再扩展 UI。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- customerSupportContract
npm test
npm run build
```

结果：

- `customerSupportContract`：1 个测试通过。
- `npm test`：10 个测试文件，31 个测试通过。
- `npm run build`：通过。

## 浏览器检查

- `/customer/login`：电话链接 `tel:075588882026` 可见，无横向溢出。
- `/customer/result?code=NO_ACCESS&source=login`：电话链接和展示号码 `0755-8888-2026` 可见，无横向溢出。
- `/customer/albums`：真实账号登录后相册列表正常，联系卡展示 `0755-8888-2026`。
- `/customer/albums/990202606080001`：桌面和 `390` 移动宽度下电话按钮不溢出，控制台无 error。
