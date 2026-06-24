import { describe, expect, it } from 'vitest'
import logsSource from './LogsView.vue?raw'
import logsOperationsSource from './logsOperations.ts?raw'
import routerSource from '../../app/router/index.ts?raw'
import backendAuditSource from '../../shared/api/backendAuditApi.ts?raw'
import storeSource from '../../shared/stores/appStore.ts?raw'
import channelStoreSource from '../../shared/stores/channelStore.ts?raw'
import operationLogStoreSource from '../../shared/stores/operationLogStore.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

const logsStoreSource = [storeSource, channelStoreSource, operationLogStoreSource].join('\n')

describe('system logs page contract', () => {
  it('replaces the system logs placeholder with a real route', () => {
    expect(routerSource).toContain('LogsView.vue')
    expect(getWorkbenchFeature('settings-logs')?.component).toBe('logs')
    expect(getWorkbenchFeature('settings-logs')?.status).toBe('partial')
    expect(getWorkbenchFeature('settings-logs')?.permission).toBe('yy:channel:list')
  })

  it('loads operation logs and channel sync logs from the existing backend APIs', () => {
    expect(backendAuditSource).toContain('/monitor/operlog/list')
    expect(backendAuditSource).toContain('/yy/channelSyncLog/list')
    expect(storeSource).toContain('loadOperationLogs')
    expect(storeSource).toContain('loadChannelSyncLogs')
  })

  it('surfaces logid, retryable failures, and partial-load handling for operations', () => {
    expect(logsSource).toContain('requestId / logid')
    expect(logsSource).toContain('Promise.allSettled')
    expect(logsSource).toContain('buildUnifiedLogEvents')
    expect(logsSource).toContain('filterUnifiedLogEvents')
    expect(logsSource).toContain('buildLogHeroCards')
    expect(logsSource).toContain('buildLogSummaryCards')
  })

  it('syncs log filters to the url for shareable troubleshooting links', () => {
    expect(logsSource).toContain('useRouteQueryFilters')
    expect(logsSource).toContain('applyFromQuery')
    expect(logsSource).toContain('syncToUrl')
    expect(logsSource).toContain('validLogFilters')
    expect(logsSource).toContain('resetLogFilter')
  })

  it('offers a copy-error-detail action for failed log entries', () => {
    expect(logsSource).toContain('copyErrorDetail')
    expect(logsSource).toContain("selectedEvent.status === 'FAILED'")
    expect(logsOperationsSource).toContain('[日志排障]')
  })

  it('uses the shared notice banner instead of inline markup', () => {
    expect(logsSource).toContain('NoticeBanner')
  })

  it('keeps a useful demo dataset for local staff-workbench presentation', () => {
    expect(logsStoreSource).toContain('douyin-logid-20260613-001')
    expect(logsStoreSource).toContain('goodlife/v1/trade/order/query')
  })
})
