import { describe, expect, it } from 'vitest'
import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'
import { buildDerivedMarketingItems, getDerivedMarketingModule } from './derivedMarketingModules'

const order = (input: Partial<BookingOrder> = {}): BookingOrder => ({
  backendId: '9001',
  storeBackendId: '1',
  productBackendId: '101',
  id: 'YY202606140001',
  customer: '陈女士',
  phone: '13800003333',
  store: '影约云深圳旗舰店',
  service: '抖音团购证件照',
  source: '抖音来客',
  method: '到店拍摄',
  orderTime: '06-14 09:20',
  orderDate: '2026-06-14',
  orderClock: '09:20',
  arrivalTime: '06-14 14:00',
  status: '已确认',
  payment: '已支付',
  amount: 129,
  arrivalDate: '2026-06-14',
  arrivalClock: '14:00',
  ...input,
})

const customer = (input: Partial<CustomerInfo> = {}): CustomerInfo => ({
  backendId: '4101',
  name: '陈女士',
  mobile: '13800003333',
  gender: '女',
  birthday: '',
  source: '抖音来客',
  memberLevel: '金卡',
  totalOrderCount: 3,
  totalSpend: 1299,
  lastOrderTime: '2026-06-14 09:20:00',
  tags: ['高复购'],
  remark: '',
  ...input,
})

describe('derived marketing modules', () => {
  it('aggregates marketing center and campaign lists from unified order sources', () => {
    const orders = [
      order(),
      order({ id: 'wx-paid', source: '微信预约', service: '个人形象照套餐', amount: 399 }),
      order({ id: 'wx-pending', source: '微信预约', payment: '待支付', amount: 399 }),
    ]

    const center = buildDerivedMarketingItems(getDerivedMarketingModule('marketing-center'), orders, [customer()])
    const campaigns = buildDerivedMarketingItems(getDerivedMarketingModule('marketing-campaigns'), orders, [customer()])

    expect(center.map(item => item.title)).toEqual(['抖音来客营销承接', '微信预约营销承接'])
    expect(center[1].metricLabel).toContain('2 单')
    expect(campaigns[1].stage).toBe('待跟进')
    expect(campaigns[0].boundary).toContain('yy_order')
  })

  it('keeps coupon pages as order leads and does not fabricate coupon redemption data', () => {
    const items = buildDerivedMarketingItems(getDerivedMarketingModule('marketing-coupons'), [
      order(),
      order({ id: 'normal', source: '微信预约', service: '个人形象照套餐' }),
      order({ id: 'refund', source: '美团团购', service: '兑换券套餐', payment: '已退款' }),
    ], [])

    expect(items.map(item => item.order?.id)).toEqual(['YY202606140001', 'refund'])
    expect(items[0].stage).toBe('已转化')
    expect(items[1].stage).toBe('已退款')
    expect(items[0].boundary).toContain('不等于真实优惠券核销记录')
  })

  it('derives participation conversion states per order and links matching customers', () => {
    const items = buildDerivedMarketingItems(getDerivedMarketingModule('marketing-participations'), [
      order(),
      order({ id: 'pending', customer: '林先生', phone: '13900004444', source: '微信预约', payment: '待支付' }),
    ], [customer()])

    expect(items).toHaveLength(2)
    expect(items[0].customer?.backendId).toBe('4101')
    expect(items[0].stage).toBe('已转化')
    expect(items[1].stage).toBe('待转化')
    expect(items[0].actionPath).toContain('/order/appointment')
  })
})
