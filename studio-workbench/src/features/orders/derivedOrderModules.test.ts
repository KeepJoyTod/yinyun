import { describe, expect, it } from 'vitest'
import type { Album, BookingOrder } from '../../shared/stores/appStore'
import { buildDerivedOrderItems, getDerivedOrderModule } from './derivedOrderModules'

const order = (id: number, service: string, source = '微信预约', payment: BookingOrder['payment'] = '已支付'): BookingOrder => ({
  backendId: String(id),
  storeBackendId: '1',
  id: `YY-${id}`,
  customer: `客户${id}`,
  phone: id === 5 ? '' : `1380000000${id}`,
  store: '深圳旗舰店',
  service,
  source,
  method: '到店拍摄',
  orderTime: '06-13 09:00',
  orderDate: '2026-06-13',
  orderClock: '09:00',
  arrivalTime: '06-13 14:00',
  status: id === 5 ? '待确认' : '已确认',
  payment,
  amount: 199,
  arrivalDate: '2026-06-13',
  arrivalClock: '14:00',
})

const album = (orderBackendId: number): Album => ({
  backendId: String(orderBackendId + 7000),
  orderBackendId: String(orderBackendId),
  id: `ALB-${orderBackendId}`,
  orderId: `YY-${orderBackendId}`,
  customer: `客户${orderBackendId}`,
  service: '证件照套餐',
  date: '2026-06-13',
  photographer: '阿杰',
  status: '选片中',
  selectedCount: 2,
  totalCount: 8,
  negatives: [],
})

describe('derived order modules', () => {
  const orders = [
    order(1, '照片冲印加洗'),
    order(2, '企业团体证件照', '企业客户'),
    order(3, '会员年卡'),
    order(4, '抖音团购兑换券', '抖音来客'),
    order(5, '证件照套餐', '表单预约', '待支付'),
  ]

  it('classifies print, enterprise, card, coupon and form modules from unified orders', () => {
    expect(buildDerivedOrderItems(getDerivedOrderModule('order-print'), orders, [album(1)])).toHaveLength(1)
    expect(buildDerivedOrderItems(getDerivedOrderModule('order-enterprise'), orders, [])).toHaveLength(1)
    expect(buildDerivedOrderItems(getDerivedOrderModule('order-card'), orders, [])).toHaveLength(1)
    expect(buildDerivedOrderItems(getDerivedOrderModule('order-coupon'), orders, [])).toHaveLength(1)
    expect(buildDerivedOrderItems(getDerivedOrderModule('order-forms'), orders, [])).toHaveLength(1)
  })

  it('keeps every derived module item linked back to the unified order page', () => {
    const [item] = buildDerivedOrderItems(getDerivedOrderModule('order-coupon'), orders, [])

    expect(item.order.id).toBe('YY-4')
    expect(item.actionLabel).toBe('打开统一订单')
    expect(item.actionPath).toContain('/order/appointment')
    expect(item.actionPath).toContain('storeId=1')
    expect(item.boundary).toContain('统一订单表 yy_order')
  })

  it('does not treat a Douyin Life coupon order without appointment slot as a data issue', () => {
    const douyinLifeCoupon = order(6, '抖音团购兑换券', '抖音来客')
    douyinLifeCoupon.arrivalDate = ''
    douyinLifeCoupon.arrivalClock = ''
    douyinLifeCoupon.arrivalTime = ''

    const formItems = buildDerivedOrderItems(getDerivedOrderModule('order-forms'), [douyinLifeCoupon], [])
    const [couponItem] = buildDerivedOrderItems(getDerivedOrderModule('order-coupon'), [douyinLifeCoupon], [])

    expect(formItems).toHaveLength(0)
    expect(couponItem.stage).toBe('待核销')
    expect(couponItem.progressHint).toContain('未预约')
  })
})
