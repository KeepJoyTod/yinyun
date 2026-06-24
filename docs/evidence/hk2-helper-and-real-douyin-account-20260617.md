# HK2 Helper And Real Douyin Account Evidence 2026-06-17

## Result

Created a local HK2 helper script and verified that Hong Kong 2 production is configured for the real Douyin Life account.

## Helper

```text
script: tools/invoke-hk2.ps1
password source: C:\Users\Administrator\Desktop\服务器\香港2.txt
secret handling: script reads password at runtime and does not save or print it
```

Smoke:

```text
command: .\tools\invoke-hk2.ps1
host: 103.24.216.8
remote hostname: ser4594579490
remote user: root
yingyue-admin.service: active
```

## Production Douyin Life Env

```text
DOUYIN_LIFE_ACCOUNT_ID: 7228763224957519924
DOUYIN_LIFE_POI_ID: 7407304729216157722
DOUYIN_LIFE_SKU_ID: <empty>
DOUYIN_LIFE_SKU_OUT_ID: <empty>
DOUYIN_LIFE_CLIENT_KEY: present, length=16
DOUYIN_LIFE_CLIENT_SECRET: present, length=32
```

No secret values were printed.

## Real OpenAPI Smoke

```text
command: .\tools\yingyue-douyin-openapi-remote-order-query.ps1 -SshPasswordFile "C:\Users\Administrator\Desktop\服务器\香港2.txt" -StartTime "2026-06-17 00:00:00" -EndTime "2026-06-17 23:59:59" -PageSize 10
server: 103.24.216.8
token status: 200
token success: true
order query status: 200
err_no: 0
order_count_detected: 4
order query logid: 20260617134642AAC9113753E437AD9CC8
```

Observed real order fields from redacted raw response:

```text
poi_id values: 7342410951733282851, 7228779175929186363
product_id / sku_id values include: 1772297209231363, 1768121210918952, 1867489036547136, 1765136728900670
product_name: present
order_status: present
pay_time/create_order_time/update_order_time: present
amount fields: present
certificate item_status: present
buyer_reserve_info: empty array for the checked orders
```

## Interpretation

The real account can provide enough OpenAPI data for order, product/SKU, POI, payment, amount, and certificate-status synchronization.

The checked orders still do not contain appointment slots in `buyer_reserve_info`, so daily schedule slots must come from real reservation SPI/webhook payloads or another reservation-detail API if available. We should not fabricate schedule slots from these order-query rows.
