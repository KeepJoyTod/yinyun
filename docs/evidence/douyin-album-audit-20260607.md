# 抖音订单取片相册生产审计 2026-06-07

## 结论

已新增只读审计脚本：

```powershell
.\tools\yingyue-douyin-album-audit.ps1
```

该脚本用于在触发真实抖音回调或订单同步后，检查生产库中：

- 最近 `DOUYIN_LIFE` SPI/OpenAPI 日志；
- 最近自动创建的 `yy_photo_album` 相册占位；
- 每个相册已有照片数量和客户可见照片数量。

脚本不会打印 SSH 密码，也不会打印手机号明文；手机号字段只显示是否存在记录。

## 首次生产审计

命令：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -DbUser yingyue -RecentHours 48 -RecentLimit 10
```

结果：

| 项 | 结果 |
| --- | --- |
| SSH 登录香港2 | 成功 |
| PostgreSQL 容器查询 | 成功 |
| `DOUYIN_LIFE` 相册总数 | `0` |
| 最近 48 小时 `DOUYIN_LIFE` 相册数 | `0` |
| 最近 48 小时 `reservation_stock_query` 日志 | `43` |
| 最近 48 小时 `life_order_query` 日志 | `18` |
| 最近 48 小时 `life_event_webhook` 日志 | `11` |

判断：生产 Spring Boot 已收到抖音相关探针/库存/订单查询日志，但当时生产库还没有真实抖音订单或预约回调成功创建取片相册占位。

## 指定订单同步后复审

随后通过香港2加白出口远程查询抖音订单，并用指定订单号触发生产同步。同步后再次审计：

| 项 | 结果 |
| --- | --- |
| OpenAPI 远程查单 logid | `20260607211535C87A5FBA80DF285ABD5A` |
| 生产同步 logid | `202606072150269EF6B8106858BB7611D2` |
| 同步结果 | `SyncStatus=SYNCED`、`Total=1`、`Created=1`、`Failed=0` |
| `DOUYIN_LIFE` 相册总数 | `1` |
| 最近 48 小时 `DOUYIN_LIFE` 相册数 | `1` |
| 相册 ID | `2063619596662734850` |
| 本地订单 ID | `2063619596503351297` |
| 抖音订单号 | `8000010230007933698` |
| 相册状态 | `ACTIVE` |
| 选片状态 | `WAITING` |
| 手机号记录 | 存在，未打印明文 |

结论：订单同步到取片相册占位链路已在生产跑通。下一步是后台向该相册上传客片，并用客户 H5 / 小程序取片链路验证手机号 + 取片码访问。

## 使用说明

生产远程审计：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -Mode SshDocker -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -RecentHours 48 -RecentLimit 10
```

本机 Docker 审计：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -Mode LocalDocker -DbUser postgres
```

只看 SQL：

```powershell
.\tools\yingyue-douyin-album-audit.ps1 -DryRun
```
