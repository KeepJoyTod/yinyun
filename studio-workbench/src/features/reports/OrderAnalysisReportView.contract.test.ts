import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import reportViewSource from './OrderAnalysisReportView.vue?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('order analysis report scaffold contract', () => {
  it('registers order analysis as a dedicated report owner instead of the shared derived page', () => {
    expect(getWorkbenchFeature('report-order-analysis')?.path).toBe('/report/order-analysis')
    expect(getWorkbenchFeature('report-order-analysis')?.component).toBe('report-order-analysis')
    expect(getWorkbenchFeature('report-order-analysis')?.status).toBe('building')
    expect(getWorkbenchFeature('report-order-analysis')?.permission).toBe('yy:report:list')
    expect(routerSource).toContain('OrderAnalysisReportView.vue')
  })

  it('shows read-only ordering, channel and refund sections with explicit reload and boundary copy', () => {
    expect(reportViewSource).toContain('订购漏斗')
    expect(reportViewSource).toContain('渠道拆分')
    expect(reportViewSource).toContain('退款拆分')
    expect(reportViewSource).toContain('重新加载')
    expect(reportViewSource).toContain('数据边界')
    expect(reportViewSource).toContain('yy_order')
    expect(reportViewSource).toContain('yy_payment_record')
    expect(reportViewSource).toContain('data-testid="order-analysis-filter"')
    expect(reportViewSource).toContain('data-testid="order-analysis-summary"')
    expect(reportViewSource).toContain('data-testid="order-analysis-loading"')
    expect(reportViewSource).toContain('data-testid="order-analysis-content"')
    expect(reportViewSource).toContain('data-testid="order-analysis-empty"')
    expect(reportViewSource).toContain('data-testid="order-analysis-error"')
  })

  it('keeps the page read-only and avoids export or mutation actions', () => {
    expect(reportViewSource).not.toContain('瀵煎嚭')
    expect(reportViewSource).not.toContain('saveOrderAnalysis')
    expect(reportViewSource).not.toContain('updateOrderStatus')
  })
})
