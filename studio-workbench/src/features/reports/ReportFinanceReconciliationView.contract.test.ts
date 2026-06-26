import { describe, expect, it } from 'vitest'
import routerSource from '../../app/router/index.ts?raw'
import reportViewSource from './ReportFinanceReconciliationView.vue?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('finance reconciliation report contract', () => {
  it('upgrades report-finance to a dedicated reconciliation owner', () => {
    expect(getWorkbenchFeature('report-finance')?.path).toBe('/report/finance')
    expect(getWorkbenchFeature('report-finance')?.component).toBe('report-finance-reconciliation')
    expect(getWorkbenchFeature('report-finance')?.status).toBe('building')
    expect(routerSource).toContain('ReportFinanceReconciliationView.vue')
  })

  it('shows order view, fund view, differences and async export task sections', () => {
    expect(reportViewSource).toContain('data-testid="report-finance-filter"')
    expect(reportViewSource).toContain('data-testid="report-finance-summary"')
    expect(reportViewSource).toContain('订单视角')
    expect(reportViewSource).toContain('资金流水视角')
    expect(reportViewSource).toContain('差异与待关注')
    expect(reportViewSource).toContain('data-testid="report-finance-export"')
    expect(reportViewSource).toContain('data-testid="report-finance-export-tasks"')
    expect(reportViewSource).toContain('下载文件')
    expect(reportViewSource).toContain('yy_order')
    expect(reportViewSource).toContain('yy_payment_record')
  })

  it('keeps external platform settlement out of this local reconciliation package', () => {
    expect(reportViewSource).toContain('权益预占')
    expect(reportViewSource).not.toContain('callWechatPay')
    expect(reportViewSource).not.toContain('callDouyinPay')
    expect(reportViewSource).not.toContain('callMeituanPay')
  })
})
