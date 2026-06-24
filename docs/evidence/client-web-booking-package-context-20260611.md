# 客户电脑网页预约页套餐承接验证

日期：2026-06-11

## 变更

- `client-web /booking` 新增选中套餐说明，随服务项目展示适用场景、交付方式和门店确认事项。
- `client-web /booking` 新增“到店前准备”面板。
- `client-web /booking` 新增门店联系方式卡片，保留预约表单提交链路不变。
- `bookingSuccessPageContract.test.ts` 增加契约测试，锁定预约页套餐承接、到店准备和联系方式。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- bookingSuccessPageContract
npm run build
```

结果：

- `bookingSuccessPageContract`：4 tests passed。
- `client-web build`：通过。

## 浏览器实测

本地地址：

```text
http://127.0.0.1:5200/booking
```

桌面宽度：

- 视口约 `1280x720`。
- `booking-package-preview` 可见。
- `booking-prep-panel` 可见。
- `booking-contact-card` 可见。
- `scrollWidth == clientWidth`，无横向溢出。

移动宽度：

- 视口约 `390x844`，页面内容宽度 `375`。
- 表单宽度约 `319`，套餐说明宽度约 `319`。
- `booking-prep-panel` 有 3 条准备事项。
- `scrollWidth == clientWidth`，无横向溢出。

控制台：

- error/warn 数量为 `0`。
