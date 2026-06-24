# P0 验证记录

日期：2026-06-09

## 结论

本轮验证覆盖后台 `yy` 契约、后台构建、客户取片移动端单测/类型检查/微信小程序构建/抖音小程序构建，以及后端取片与访问审计相关测试。

## 后台验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
```

结果：

```text
Test Files 4 passed
Tests 16 passed
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

结果：

```text
vite v7.3.2 building client environment for development...
3210 modules transformed.
built in 54.41s
```

## 移动端验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
```

结果：

```text
tests 9
pass 9
fail 0
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
```

结果：`vue-tsc --noEmit` 退出码为 `0`。

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-weixin
```

结果：

```text
DONE Build complete.
导入 dist\build\mp-weixin
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-toutiao
```

结果：

```text
DONE Build complete.
导入 dist\build\mp-toutiao
```

DCloud 提示有新版本发布，不影响本轮构建。

## 后端验证

第一次直接跑 `ruoyi-yy` 单模块时，Maven 尝试从远程拉取内部 `ruoyi-common-*` 包并遇到镜像 TLS handshake 失败；改用 `-am` 带上依赖模块后，又需要设置 `surefire.failIfNoSpecifiedTests=false` 让依赖模块跳过指定测试类。

最终验证命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest" test
```

结果：

```text
Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

覆盖：

- `YyClientPhotoControllerTest`
- `YyClientPhotoServiceImplTest`
- `YyPhotoAccessLogServiceImplTest`

## 当前仍需人工/真机验证

| 项 | 原因 |
| --- | --- |
| 微信开发者工具预览 | 需要导入 `mobile-uniapp\dist\build\mp-weixin` 并配置小程序合法域名 |
| 抖音开发者工具预览 | 需要导入 `mobile-uniapp\dist\build\mp-toutiao` 并配置合法域名 |
| 真机保存图片 | `downloadFile` / 相册权限 / 平台图片域名必须用真机确认 |
| 公网预览相册真实图 | 当前预览相册可见照片为 `0`，要验证图片预览和保存需先上传测试图 |
