# 抖音真实订单客户取片 Smoke 证据 2026-06-07

## 结论

已新增远程只读验收脚本：

```powershell
.\tools\yingyue-douyin-photo-pickup-remote-smoke.ps1
```

该脚本从香港2服务器执行，读取生产环境变量后：

1. 调抖音 OpenAPI 查询指定真实订单。
2. 从订单响应中提取客户手机号，但只输出脱敏手机号。
3. 查询生产库中该订单对应的 `DOUYIN_LIFE` 相册和取片码。
4. 调 `https://api.evanshine.me/client/photo/auth/verify` 完成客户取片登录。
5. 调 `/client/photo/albums` 和 `/client/photo/albums/{albumId}` 验证客户可访问相册。
6. 如果相册已有客户可见照片，再验证 `preview-url` 和 `/stream`。

脚本不打印 SSH 密码、抖音 token、client secret、客户手机号明文、客户取片码、客户取片 token、签名 URL。

## 运行命令

```powershell
.\tools\yingyue-douyin-photo-pickup-remote-smoke.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -DouyinOrderId 8000010230007933698
```

## 运行结果

| 项 | 结果 |
| --- | --- |
| SSH 登录香港2 | 成功 |
| API 域名 | `https://api.evanshine.me` |
| 抖音订单号 | `8000***3698` |
| 客户手机号 | `182****5429` |
| OpenAPI `client_token` | `200` |
| OpenAPI 订单查询 | `200` |
| OpenAPI 订单查询 logid | `20260607222728124502DF358CD51BDB71` |
| 检测到订单数 | `1` |
| 相册 ID | `2063619596662734850` |
| 相册状态 | `ACTIVE` |
| 选片状态 | `WAITING` |
| 相册取片码 | 存在，未打印明文 |
| 客户取片登录 | `200`，成功 |
| 客户相册列表 | 返回 `1` 个相册 |
| 客户相册详情 | `200`，成功 |
| 详情照片数 | `0` |
| 预览/下载验证 | 跳过，原因：当前真实相册还没有客户可见照片 |

## 判断

真实抖音订单到客户取片入口已经跑通：

```text
抖音真实订单 -> 生产相册占位 -> 手机号 + 取片码登录 -> 相册列表 -> 相册详情
```

当前没有继续验证图片预览和下载，不是接口失败，而是该真实 `DOUYIN_LIFE` 相册尚未上传照片，`yy_photo_asset` 数量为 `0`。

下一步需要在后台给该相册上传客片，再重新运行脚本验证：

- `preview-url` 能返回短期签名 URL；
- `/client/photo/assets/{assetId}/stream` 能返回正确 `Content-Type` 和 `Content-Disposition`；
- 小程序端在合法域名限制下可用 `/stream` 兜底预览/保存。

