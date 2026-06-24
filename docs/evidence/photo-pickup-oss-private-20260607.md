# 客户取片私有 OSS 验证 2026-06-07

## 结论

OSS 裸链不可公开访问，客户侧通过后端鉴权后的 stream 可以访问。

## 数据

相册：

```text
albumId: 903001
visible asset count: 2
```

对象：

```text
photo/2026/06/06/652587708ea3481486b4e3627227d767.png
photo/2026/06/06/04bbeffa1c2848ad851f2d8afdd12f4a.png
```

## 裸 OSS 链接

不带签名直接访问：

```text
https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo/2026/06/06/652587708ea3481486b4e3627227d767.png -> 403
https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo/2026/06/06/04bbeffa1c2848ad851f2d8afdd12f4a.png -> 403
```

## 后端访问

客户取片 smoke：

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success
stream: success status=200, contentType=image/png
```

脚本未记录完整 `clientToken` 或签名 URL。

