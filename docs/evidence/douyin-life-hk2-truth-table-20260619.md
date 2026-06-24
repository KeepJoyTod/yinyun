# HK2 DOUYIN_LIFE Truth Table 2026-06-19

生成时间：2026-06-19 18:06 CST

## 结果

状态：`DONE_WITH_CONCERNS`

结论：

| 项目 | 状态 | 证据 |
| --- | --- | --- |
| 香港2 Spring Boot 发布存活 | `VERIFIED` | `yingyue-admin.service` 为 `active (running)`；主进程 `java -Xms256m -Xmx768m -jar /opt/yingyue/backend/ruoyi-admin.jar`；服务自 `2026-06-19 07:07:43 CST` 持续运行 |
| 香港2 生产环境变量存在 | `VERIFIED` | `/opt/yingyue/backend/.env.production` 存在；真实账户只读探针确认 `DOUYIN_LIFE_CLIENT_KEY/CLIENT_SECRET/ACCOUNT_ID` 均存在 |
| 真实账户只读发现脚本执行 | `PARTIAL` | `tools/yingyue-douyin-real-account-discovery.ps1` 已执行，但内部远端汇总代码返回 `exit=1`；不是 SSH/环境缺失 |
| 香港2 真实账户主动查单 | `VERIFIED` | 只读回退探针：`client_token` 成功，订单查询成功，近 24 小时检测到 `5` 条订单 |
| 本机 current-order helper | `PARTIAL` | `tools/run-douyin-life-current-order.ps1` 本地能拿到 `client_token`，但查单返回 `IP不在白名单，请开通权限` |
| 公网 webhook challenge | `VERIFIED` | 香港2 远端 `curl` 到 `https://api.evanshine.me/api/douyin/life/webhook` 返回 `HTTP/2 200`，body 原样回显 `{"challenge":"codex-hk2-probe-20260619"}` |

## 执行的只读命令

```powershell
& 'D:/OtherProject/CameraApp/yingyue-cloud-repo/tools/invoke-hk2.ps1' -Command "hostname; whoami; date; systemctl is-active yingyue-admin.service 2>/dev/null || true; systemctl status yingyue-admin.service --no-pager -l 2>/dev/null | sed -n '1,12p'; test -f /opt/yingyue/backend/.env.production && echo ENV_OK || echo ENV_MISSING; test -d /opt/yingyue/backend && echo BACKEND_DIR_OK || echo BACKEND_DIR_MISSING; readlink -f /opt/yingyue || true; ls -ld /opt/yingyue /opt/yingyue/backend 2>/dev/null || true"

& 'D:/OtherProject/CameraApp/yingyue-cloud-repo/tools/yingyue-douyin-real-account-discovery.ps1' -RecentHours 24 -MaxPages 3 -PageSize 50

& 'D:/OtherProject/CameraApp/yingyue-cloud-repo/tools/run-douyin-life-current-order.ps1'

& 'D:/OtherProject/CameraApp/yingyue-cloud-repo/tools/invoke-hk2.ps1' -Command "<python3 只读回退探针：读取 /opt/yingyue/backend/.env.production，调用 /oauth/client_token/ 与 /goodlife/v1/trade/order/query/>"

& 'D:/OtherProject/CameraApp/yingyue-cloud-repo/tools/invoke-hk2.ps1' -Command "curl -sS -D - -H 'Content-Type: application/json' -X POST https://api.evanshine.me/api/douyin/life/webhook --data '{\"challenge\":\"codex-hk2-probe-20260619\"}'"
```

## 关键事实

### 1. 香港2 发布检查

```text
host: ser4594579490
user: root
remote time: Fri Jun 19 06:03:51 PM CST 2026
service: active
service started: Fri 2026-06-19 07:07:43 CST
jar: /opt/yingyue/backend/ruoyi-admin.jar
env: /opt/yingyue/backend/.env.production exists
backend dir: /opt/yingyue/backend exists
```

### 2. 真实账户只读发现脚本

脚本入口：

```text
tools/yingyue-douyin-real-account-discovery.ps1
```

实际结果：

```text
mode: read-only
timeRange: 2026-06-18 18:03:52 -> 2026-06-19 18:03:52
HK2 helper connected successfully
remote command failed: exit=1
```

判断：脚本确实执行到了香港2，但远端汇总逻辑异常退出；这不是密码、SSH、Python 缺失、环境文件缺失导致。

### 3. 香港2 只读回退探针

回退探针同样只读取 `/opt/yingyue/backend/.env.production`，只调用 `client_token` 与订单查询，不写库、不写平台库存。

```text
account_id: 7228763224957519924
env_poi_id: 7407304729216157722
client_token http: 200
client_token message: success
client_token logid: 20260619180544C501124B64C397185B89
order_query http: 200
order_query logid: 2026061918054590878C097A51D0A27BDC
orders_detected_24h: 5
top_poi_ids: 7228779175929186363, 7342410951733282851
top_product_ids: 1765136728900670, 1786524382942250, 1768849478367259
top_sku_ids: 1765136728900670, 1786524382942250, 1768849478367259
```

解读：

- 香港2 出口当前具备真实来客订单查询能力。
- 生产环境当前 `DOUYIN_LIFE_SKU_ID` / `DOUYIN_LIFE_SKU_OUT_ID` 均未在本次探针中观察到存在标记，后续如要做 SKU/库存写入前需要再单独确认。

### 4. 本机 current-order helper

```text
client_token: success
order query: IP不在白名单，请开通权限
```

解读：本机 helper 仍只能证明凭证有效，不能证明本机出口有查单权限；真实查单验收应继续以香港2 为准。

### 5. Webhook challenge

```text
HTTP/2 200
content-type: application/json; charset=utf-8
body: {"challenge":"codex-hk2-probe-20260619"}
```

结论：公网 challenge 回显链路当前正常，满足只读探针预期。

## 顾虑

1. `tools/yingyue-douyin-real-account-discovery.ps1` 当前存在脚本级故障，建议单独修复其远端 Python 汇总代码后再复跑正式 evidence。
2. 本次严格遵守只读边界，未执行 `orders/sync`、`orders/backfill`、`time-stock/save`、`stock/save`、`inventory-sku/upsert`。
3. 本次未打印 token、secret、完整手机号、open_id、原始私有 payload。
