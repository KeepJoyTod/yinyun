# 客户电脑网页端预约联系入口统一证据

日期：2026-06-11

## 范围

- `client-web/src/views/BookingView.vue`
- `client-web/src/views/BookingSuccessView.vue`
- `client-web/src/shared/customerSupport.ts`
- `client-web/src/shared/customerSupportContract.test.ts`

## 本轮结果

- `/booking` 门店名展示改为 `CUSTOMER_SUPPORT.storeName`。
- `/booking` 门店电话展示改为 `CUSTOMER_SUPPORT.phoneDisplay`。
- `/booking` 门店电话入口改为 `CUSTOMER_SUPPORT.telHref`，客户可直接拨打门店电话。
- `/booking/success` 增加“联系门店”动作，展示号码和电话链接同样来自 `CUSTOMER_SUPPORT`。
- 契约测试覆盖预约页和预约成功页，防止再次写死 `深圳南山门店`、`0755-8888-2026` 或 `tel:075588882026`。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- customerSupportContract
npm test
npm run build
```

结果：

- `customerSupportContract`：3 个测试通过。
- `npm test`：10 个测试文件，33 个测试通过。
- `npm run build`：通过。

## 浏览器检查

- `/booking`：桌面宽度和 `390px` 移动宽度均显示 `深圳南山门店` 和 `0755-8888-2026`，电话链接为 `tel:075588882026`，无横向溢出。
- `/booking/success?orderNo=YYWEB-DEMO...`：桌面宽度和 `390px` 移动宽度均显示“联系门店 0755-8888-2026”，电话链接为 `tel:075588882026`，无横向溢出。
- 控制台 `error`：0 条。
