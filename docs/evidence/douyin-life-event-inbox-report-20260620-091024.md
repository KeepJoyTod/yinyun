# DOUYIN_LIFE Event Inbox Read-only Report

- generatedAt: `2026-06-20 01:10:26 +00:00`
- channel: `DOUYIN_LIFE`
- readOnly: `True`
- staleDays: `3`
- status: `STALE_SIGNATURE_NO_CURRENT_BLOCKER`
- recommendation: Keep as stale signature evidence or archive with a dedicated cleanup; do not retry blindly.

## Summary

| total | done | retryable | failed | retry | dead | staleFailures | staleXLifeSignFailures | latestEventTime |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | 0 | 2 | 2 | 0 | 0 | 2 | 2 | 2026-06-13 16:52:53 |

## Failure Buckets

| status | reasonKey | count | latestTime |
| --- | --- | ---: | --- |
| FAILED | missing_x_life_sign | 2 | 2026-06-13 16:52:53 |

## Stale Failures

| id | eventType | status | signatureValid | retryCount | createTime | errorCategory | errorMessage |
| ---: | --- | --- | --- | ---: | --- | --- | --- |
| 2065719041290297346 | LIFE_ORDER_QUERY | FAILED | 0 | 0 | 2026-06-13 16:52:53 | missing_x_life_sign | 缺少 x-life-sign，无法通过抖音生活服务 SPI 验签 |
| 2065718453756387329 | LIFE_ORDER_QUERY | FAILED | 0 | 0 | 2026-06-13 16:50:33 | missing_x_life_sign | 缺少 x-life-sign，无法通过抖音生活服务 SPI 验签 |

Boundary: this report does not retry events, does not write database rows, does not call Douyin OpenAPI, and does not persist raw payloads.
