# HK2 DOUYIN_LIFE Health 2026-06-19

生成时间：2026-06-19 18:06 CST

## 结果

状态：`DONE_WITH_CONCERNS`

当前健康判断：

| 维度 | 结论 |
| --- | --- |
| 香港2 服务在线 | 健康，Spring Boot 服务运行中 |
| 香港2 到抖音 OpenAPI 出口 | 健康，`client_token` 与订单查询均成功 |
| 本机到抖音 OpenAPI 出口 | 受限，仍被白名单拦截 |
| 公网 webhook challenge | 健康，200 + JSON challenge 回显 |
| 自动化发现脚本可用性 | 不健康，`yingyue-douyin-real-account-discovery.ps1` 本次执行失败，需要修脚本 |

## 健康摘要

```text
server_host: ser4594579490
service_name: yingyue-admin.service
service_status: active
service_started_at: 2026-06-19 07:07:43 CST
release_jar: /opt/yingyue/backend/ruoyi-admin.jar
remote_env_file: /opt/yingyue/backend/.env.production
remote_client_token_logid: 20260619180544C501124B64C397185B89
remote_order_query_logid: 2026061918054590878C097A51D0A27BDC
remote_order_count_24h: 5
local_current_order_result: IP不在白名单，请开通权限
webhook_probe_http: 200
webhook_probe_body: {"challenge":"codex-hk2-probe-20260619"}
```

## 事件明细

### A. 香港2 服务与发布面

- `systemctl is-active yingyue-admin.service` 返回 `active`。
- `systemctl status` 显示主进程为 Java，Jar 路径是 `/opt/yingyue/backend/ruoyi-admin.jar`。
- `/opt/yingyue/backend/.env.production` 存在，说明发布目录和配置文件均在位。

### B. 真实账户只读链路

- `client_token` 成功，logid：`20260619180544C501124B64C397185B89`。
- 订单查询成功，logid：`2026061918054590878C097A51D0A27BDC`。
- 近 24 小时读取到 `5` 条真实订单。
- 观测到的 POI 至少包含：
  - `7228779175929186363`
  - `7342410951733282851`

### C. 本机 helper 现状

- `tools/run-douyin-life-current-order.ps1` 在本机环境下：
  - `client_token` 成功；
  - 订单查询返回 `IP不在白名单，请开通权限`。

这说明：

- 凭证本身大概率有效；
- 生产验收不能依赖本机出口；
- 香港2 仍是当前真实查单的可信出口。

### D. Webhook challenge 探针

从香港2 远端 `curl` 到：

```text
https://api.evanshine.me/api/douyin/life/webhook
```

收到：

```text
HTTP/2 200
content-type: application/json; charset=utf-8
{"challenge":"codex-hk2-probe-20260619"}
```

说明 challenge 回显链路正常，公网入口可用。

## 阻塞与风险

1. `tools/yingyue-douyin-real-account-discovery.ps1` 本次失败，导致“标准化 discovery 证据”需要依赖只读回退探针补齐。
2. 本机出口不在白名单，开发机上直接跑 `current-order` 不能代表生产 OpenAPI 健康。
3. 本次未调用任何写接口，无法证明 `orders/sync`、库存写入、SKU upsert 等写链路健康；这些仍需单独、显式、受控验收。

## 建议下一步

1. 单独修复 `tools/yingyue-douyin-real-account-discovery.ps1`，优先排查远端 Python 汇总代码退出 `1` 的原因。
2. 修完后在香港2 复跑 discovery，补一份标准化 JSON/Markdown 证据。
3. 后续若要继续真链路验收，仍应坚持“先香港2 只读，再单独审批写接口”的顺序。
