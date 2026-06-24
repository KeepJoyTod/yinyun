# 客户电脑网页首页套餐与交付展示验证

日期：2026-06-11

## 变更

- `client-web /` 新增 `PHOTO PACKAGES` 套餐选择区：证件照精修、形象照拍摄、家庭纪念照。
- `client-web /` 新增 `PRIVATE DELIVERY` 样片交付区：照片私有存储、手机号和取片码校验、短期预览链接、原图下载授权。
- `src/shared/homePageContract.test.ts` 增加契约测试，锁定套餐选择和样片交付展示。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
npm run test -- homePageContract
npm run build
```

结果：

- `homePageContract`：4 tests passed。
- `client-web build`：通过。

## 浏览器实测

本地地址：

```text
http://127.0.0.1:5200/
```

桌面宽度：

- 视口约 `1280x720`。
- `home-service-menu` 可见。
- `home-delivery-showcase` 可见。
- `scrollWidth == clientWidth`，无横向溢出。

移动宽度：

- 视口约 `390x844`，页面内容宽度 `375`。
- `home-service-card` 数量为 `3`。
- `home-delivery-proof` 数量为 `3`。
- `scrollWidth == clientWidth`，无横向溢出。

控制台：

- error/warn 数量为 `0`。
