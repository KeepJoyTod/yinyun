import { describe, expect, it } from 'vitest'
import logsSource from './LogsView.vue?raw'
import logsOperationsSource from './logsOperations.ts?raw'
import routerSource from '../../app/router/index.ts?raw'
import backendSource from '../../shared/api/backend.ts?raw'
import storeSource from '../../shared/stores/appStore.ts?raw'
import channelStoreSource from '../../shared/stores/channelStore.ts?raw'
import operationLogStoreSource from '../../shared/stores/operationLogStore.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

const logsStoreSource = [storeSource, channelStoreSource, operationLogStoreSource].join('\n')

describe('system logs page contract', () => {
  it('replaces the system logs placeholder with a real route', () => {
    expect(routerSource).toContain('LogsView.vue')
    expect(getWorkbenchFeature('settings-logs')?.component).toBe('logs')
    expect(getWorkbenchFeature('settings-logs')?.status).toBe('ready')
    expect(getWorkbenchFeature('settings-logs')?.permission).toBe('yy:channel:list')
  })

  it('loads operation logs and channel sync logs from the existing backend APIs', () => {
    expect(backendSource).toContain('/monitor/operlog/list')
    expect(backendSource).toContain('/yy/channelSyncLog/list')
    expect(storeSource).toContain('loadOperationLogs')
    expect(storeSource).toContain('loadChannelSyncLogs')
  })

  it('surfaces logid, retryable failures, and partial-load handling for operations', () => {
    expect(logsSource).toContain('requestId / logid')
    expect(logsSource).toContain('可重试')
    expect(logsSource).toContain('Promise.allSettled')
    expect(logsSource).toContain('抖音 logid')
    expect(logsSource).toContain('复制')
    expect(logsSource).toContain('buildUnifiedLogEvents')
    expect(logsSource).toContain('filterUnifiedLogEvents')
    expect(logsSource).toContain('buildLogHeroCards')
    expect(logsSource).toContain('buildLogSummaryCards')
  })

  it('aligns visible log filters and table columns with the yuyue123 reference', () => {
    expect(logsSource).toContain('请输入处理内容搜索')
    expect(logsSource).toContain('请输入处理人')
    expect(logsSource).toContain('请输入手机号')
    expect(logsSource).toContain('处理场景')
    expect(logsSource).toContain('处理人')
    expect(logsSource).toContain('处理结果')
    expect(logsSource).toContain('处理时间')
    expect(logsSource).toContain('处理内容')
  })

  it('has a dedicated logid/requestId filter input for targeted searching', () => {
    expect(logsSource).toContain('按 requestId / logid 定位搜索')
    expect(logsSource).toContain('logIdFilter')
    expect(logsSource).toContain('filterUnifiedLogEvents(allEvents.value')
  })

  it('syncs log filters to the url for shareable troubleshooting links', () => {
    expect(logsSource).toContain('useRouteQueryFilters')
    expect(logsSource).toContain('applyFromQuery')
    expect(logsSource).toContain('syncToUrl')
    expect(logsSource).toContain('validLogFilters')
    expect(logsSource).toContain('resetLogFilter')
    expect(logsSource).toContain('重置筛选')
  })

  it('keeps all-store log filtering admin-only and normalizes staff to concrete stores', () => {
    expect(logsSource).toContain('studioAccessStore')
    expect(logsSource).toContain('canUseGlobalStoreScope')
    expect(logsSource).toContain('visibleLogStoreOptions')
    expect(logsSource).toContain('normalizeStoreFilter')
    expect(logsSource).toContain('<option v-if="canUseGlobalStoreScope" value="all">全部门店</option>')
    expect(logsSource).toContain("if (!canUseGlobalStoreScope.value && storeFilter.value === 'all')")
    expect(logsSource).toContain("storeFilter.value = normalizeStoreFilter()")
  })

  it('offers a copy-error-detail action for failed log entries', () => {
    expect(logsSource).toContain('copyErrorDetail')
    expect(logsSource).toContain('复制错误详情')
    expect(logsSource).toContain('selectedEvent.status === \'FAILED\'')
    expect(logsOperationsSource).toContain('[日志排障]')
    expect(logsOperationsSource).toContain('requestId/logid：')
  })

  it('uses the shared notice banner instead of inline markup', () => {
    expect(logsSource).toContain('NoticeBanner')
  })

  it('renders logs as a troubleshooting console with premium surfaces', () => {
    expect(logsSource).toContain('logs-hero')
    expect(logsSource).toContain('排障控制台')
    expect(logsSource).toContain('系统日志面板')
    expect(logsSource).toContain('yy-glass-panel')
    expect(logsSource).toContain('rounded-[24px]')
    expect(logsSource).toContain('bg-white/58')
  })

  it('keeps a useful demo dataset for local staff-workbench presentation', () => {
    expect(logsStoreSource).toContain('douyin-logid-20260613-001')
    expect(logsStoreSource).toContain('goodlife/v1/trade/order/query')
    expect(logsStoreSource).toContain('缺少 monitor:operlog:list 权限')
  })
})
