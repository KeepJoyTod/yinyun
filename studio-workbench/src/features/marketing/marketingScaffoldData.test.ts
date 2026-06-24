import { describe, expect, it } from 'vitest'
import { buildFallbackCampaignScaffold, buildFallbackCouponScaffold, buildFallbackMarketingDashboard } from './marketingScaffoldData'
import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'

const order = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
  id: 'order-1',
  backendId: '1',
  storeBackendId: '1001',
  customer: '张三',
  phone: '13800138000',
  service: '抖音团购兑换券',
  source: '抖音来客',
  method: 'H5预约',
  orderTime: '2026-06-24 10:00',
  orderDate: '2026-06-24',
  orderClock: '10:00',
  arrivalTime: '2026-06-24 11:00',
  arrivalDate: '2026-06-24',
  arrivalClock: '11:00',
  status: '已确认',
  payment: '已支付',
  amount: 199,
  store: '滨州万达店',
  productBackendId: '501',
  ...overrides,
})

const customer = (overrides: Partial<CustomerInfo> = {}): CustomerInfo => ({
  backendId: '1',
  name: '张三',
  mobile: '13800138000',
  gender: '',
  birthday: '',
  source: 'LOCAL',
  memberLevel: 'VIP',
  totalOrderCount: 0,
  totalSpend: 0,
  lastOrderTime: '',
  tags: [],
  remark: '',
  ...overrides,
})

describe('marketing scaffold data', () => {
  it('builds dashboard metrics from campaign related orders', () => {
    const dashboard = buildFallbackMarketingDashboard([order(), order({ id: 'order-2', payment: '待支付' })])
    expect(dashboard.metrics[0]?.value).toBe('2')
    expect(dashboard.channels[0]?.sourceLabel).toBe('抖音来客')
  })

  it('builds coupon and campaign scaffolds', () => {
    const coupons = buildFallbackCouponScaffold([order()], [customer()])
    const campaigns = buildFallbackCampaignScaffold([order()])
    expect(coupons.templates.length).toBeGreaterThan(0)
    expect(campaigns.campaigns.length).toBeGreaterThan(0)
  })
})
