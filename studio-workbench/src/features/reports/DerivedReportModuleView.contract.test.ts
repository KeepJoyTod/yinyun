import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import viewSource from './DerivedReportModuleView.vue?raw'

describe('derived report module pages contract', () => {
  const featureExpectations = {
    'report-store-daily': { component: 'derived-report-module', status: 'derived' },
    'report-store-monthly': { component: 'derived-report-module', status: 'derived' },
    'report-products': { component: 'derived-report-module', status: 'derived' },
    'report-employees': { component: 'derived-report-module', status: 'derived' },
    'report-retouch': { component: 'derived-report-module', status: 'derived' },
    'report-finance': { component: 'report-finance-reconciliation', status: 'building' },
    'report-customers': { component: 'derived-report-module', status: 'derived' },
    'report-reviews': { component: 'derived-report-module', status: 'partial' },
    'report-channels': { component: 'derived-report-module', status: 'derived' },
    'report-conversion': { component: 'derived-report-module', status: 'derived' },
    'report-order-analysis': { component: 'report-order-analysis', status: 'building' },
  } as const

  it('keeps derived reports on the shared route while allowing real report owners to break out', () => {
    expect(routerSource).toContain('DerivedReportModuleView.vue')
    expect(routerSource).toContain('ReportFinanceReconciliationView.vue')
    expect(routerSource).toContain('OrderAnalysisReportView.vue')
    for (const [key, expectation] of Object.entries(featureExpectations)) {
      expect(getWorkbenchFeature(key)?.component).toBe(expectation.component)
      expect(getWorkbenchFeature(key)?.status).toBe(expectation.status)
      expect(getWorkbenchFeature(key)?.permission).toBeTruthy()
    }
  })

  it('uses existing ledgers and report snapshots while keeping report pages read-only', () => {
    expect(viewSource).toContain('buildSnapshotAwareReportItems')
    expect(viewSource).toContain('appStore.reportOrders')
    expect(viewSource).toContain('appStore.reportSnapshots')
    expect(viewSource).toContain('appStore.customers')
    expect(viewSource).toContain('appStore.employees')
    expect(viewSource).toContain('appStore.albums')
    expect(viewSource).toContain('onMounted(loadModuleData)')
    expect(viewSource).toContain('appStore.ensureReportDataLoaded')
    expect(viewSource).toContain('yy_order')
    expect(viewSource).toContain('yy_report_snapshot')
    expect(viewSource).toContain('空态仍显示边界')
    expect(viewSource).not.toContain('saveReportSnapshot')
    expect(viewSource).not.toContain('createReview')
  })

  it('lists all report labels in the shared page contract', () => {
    for (const label of ['门店业绩日报', '门店业绩月报', '服务产品统计', '员工业绩统计', '修图量统计', '收支统计', '客户分析', '客户评价', '渠道收入统计', '订单转化分析']) {
      expect(viewSource).toContain(label)
    }
  })

  it('shows explicit reviews empty state with suggested API endpoints', () => {
    expect(viewSource).toContain("module.source === 'reviews'")
    expect(viewSource).toContain('/yy/customerReview/list')
    expect(viewSource).toContain('/yy/channelReview/list')
    expect(viewSource).toContain('后续接口规划')
  })

  it('never includes fake review scores or fake approval rates in the view', () => {
    expect(viewSource).not.toMatch(/4\.\d/)
    expect(viewSource).not.toMatch(/好评率/)
    expect(viewSource).not.toMatch(/\d+条评价/)
  })

  it('differentiates empty states: no data, no filter results, and API not connected', () => {
    expect(viewSource).toContain('当前筛选无结果')
    expect(viewSource).toContain('数据存在但不匹配当前筛选条件')
    expect(viewSource).toContain("module.source === 'reviews'")
  })

  it('uses the shared console visual primitives and semantic status colors', () => {
    expect(viewSource).toContain('yy-glass-panel yy-console-hero')
    expect(viewSource).toContain('yy-console-card')
    expect(viewSource).toContain('yy-console-table')
    expect(viewSource).toContain('var(--color-status-done-bg)')
    expect(viewSource).toContain('var(--color-status-danger-bg)')
    expect(viewSource).not.toContain('bg-[#EBF4ED]')
    expect(viewSource).not.toContain('bg-[#B8543B]/10')
  })
})
