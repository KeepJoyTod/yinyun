# 影约云取片与抖音生活服务回归证据 2026-06-07

## 后端测试

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest,YyClientPhotoServiceImplTest,YyClientPhotoControllerTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

结果：

```text
BUILD SUCCESS
Tests run: 39, Failures: 0, Errors: 0, Skipped: 0
```

## 管理后台构建

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

结果：

```text
vite build --mode development
✓ built
```

## 后端打包

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

结果：

```text
BUILD SUCCESS
ruoyi-admin SUCCESS
```

打包前需要停掉本地运行中的 `ruoyi-admin.jar`，否则 Windows 会锁住 jar 文件。打包完成后已重新执行：

```powershell
.\tools\start-yingyue-local.ps1 -SkipFrontend -SkipPrototype
```

并再次通过本地客户取片 smoke：

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success
stream: success status=200, contentType=image/png
```

## 移动端构建

见：

```text
docs/evidence/photo-pickup-mobile-builds-20260607.md
```
