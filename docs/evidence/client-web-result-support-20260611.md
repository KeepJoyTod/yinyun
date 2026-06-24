# 客户电脑网页取片结果页门店协助验证

日期：2026-06-11

## 变更

- `client-web /customer/result` 新增处理建议区，按 `INVALID_CODE`、`NO_ACCESS`、`EXPIRED`、`SYSTEM_ERROR` 给出下一步。
- `client-web /customer/result` 新增门店协助卡片，展示拨打门店电话入口和来源位置。
- `customerResultPageContract.test.ts` 增加契约测试，锁定处理建议、门店协助和来源提示。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- customerResultPageContract
npm run build
```

结果：

- `customerResultPageContract`：4 tests passed。
- `client-web build`：通过。

## 浏览器实测

桌面地址：

```text
http://127.0.0.1:5200/customer/result?code=EXPIRED&reason=相册已过期&source=album-detail
```

结果：

- `customer-result-next-steps` 可见。
- `customer-result-support-card` 可见。
- 有 3 条处理建议。
- `scrollWidth == clientWidth`，无横向溢出。

移动地址：

```text
http://127.0.0.1:5200/customer/result?code=INVALID_CODE&reason=取片码不正确&source=login
```

结果：

- 视口约 `390x844`，页面内容宽度 `375`。
- 有 3 条处理建议。
- 来源提示显示 `来源：取片登录`。
- `scrollWidth == clientWidth`，无横向溢出。

控制台：

- error/warn 数量为 `0`。
