# 客户取片 H5 浏览器回归 2026-06-07

## 结论

H5 客户取片主流程在本地通过。

## 环境

```text
H5: http://127.0.0.1:5174
API: http://127.0.0.1:8080
albumId: 903001
```

## 验证结果

| 步骤 | 结果 |
| --- | --- |
| 登录页 | 手机号 + 取片码可输入 |
| 登录 | 成功跳转到 `/pages/pickup/albums/index` |
| 相册列表 | 显示 `王女士亲子套系选片` |
| 相册详情 | 跳转到 `/pages/pickup/detail/index?albumId=903001` |
| 底片数量 | 显示 `共 2 张底片`，未复现旧的 4 张坏图问题 |
| 预览页 | 跳转到 `/pages/pickup/preview/index?albumId=903001&assetId=2063173233076416514` |
| 图片加载 | 图片自然尺寸 `1500x2272`，说明签名 URL 加载成功 |
| 下载原图 | 点击后页面提示 `下载已开始` |
| token 暴露 | 页面 URL 未包含 `client_token` |

## 浏览器日志

仅发现 DCloud/uni-app 依赖的 Vue Router deprecation warning：

```text
[vue-router]: importing from 'vue-router/dist/vue-router.esm-bundler.js' is deprecated. Use 'vue-router' directly.
```

未发现图片加载错误、401/403、下载接口错误。

