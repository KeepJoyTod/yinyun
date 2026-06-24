import { describe, expect, it } from 'vitest'
import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'
import { buildDerivedMemberItems, getDerivedMemberModule } from './derivedMemberModules'

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
  tags: ['证件照', '高复购'],
  remark: '对加急交付敏感，优先短信提醒',
  ...input,
})

const order = (input: Partial<BookingOrder> = {}): BookingOrder => ({
  backendId: '9001',
  storeBackendId: '1',
  productBackendId: '101',
  id: 'YY202606140001',
  customer: '陈女士',
  phone: '13800003333',
  store: '影约云深圳旗舰店',
  service: '证件照精修套餐',
  source: '抖音来客',
  method: '到店拍摄',
  orderTime: '06-14 09:20',
  orderDate: '2026-06-14',
  orderClock: '09:20',
  arrivalTime: '06-14 14:00',
  status: '已确认',
  payment: '已支付',
  amount: 399,
  arrivalDate: '2026-06-14',
  arrivalClock: '14:00',
  ...input,
})

describe('derived member modules', () => {
  it('derives member accounts from customer totals without a second member ledger', () => {
    const module = getDerivedMemberModule('member-accounts')
    const items = buildDerivedMemberItems(module, [
      customer(),
      customer({ backendId: '4102', name: '林先生', mobile: '13900004444', memberLevel: '普通', totalSpend: 399, totalOrderCount: 1, tags: ['形象照'] }),
    ], [order()])

    expect(items).toHaveLength(2)
    expect(items[0].title).toBe('陈女士')
    expect(items[0].stage).toBe('高价值')
    expect(items[0].metricLabel).toContain('¥1,299')
    expect(items[0].boundary).toContain('yy_customer')
  })

  it('derives customer tags as grouped segments and keeps tag operations read-only', () => {
    const module = getDerivedMemberModule('member-tags')
    const items = buildDerivedMemberItems(module, [
      customer(),
      customer({ backendId: '4102', name: '林先生', mobile: '13900004444', tags: ['形象照'], totalSpend: 399 }),
      customer({ backendId: '4103', name: '周同学', mobile: '13700005555', tags: [], totalSpend: 129 }),
    ], [])

    expect(items.map(item => item.title)).toEqual(['证件照', '高复购', '形象照'])
    expect(items[0].metricLabel).toBe('1 人')
    expect(items[0].nextAction).toContain('客户档案')
    expect(items[0].boundary).toContain('不在工作台创建第二套标签账本')
  })

  it('derives consumption records from unified orders and payment state', () => {
    const module = getDerivedMemberModule('member-consumption')
    const items = buildDerivedMemberItems(module, [customer()], [
      order({ id: 'paid', payment: '已支付', amount: 399 }),
      order({ id: 'refund', payment: '已退款', amount: 129 }),
      order({ id: 'pending', payment: '待支付', amount: 599 }),
    ])

    expect(items.map(item => item.id)).toEqual([
      'member-consumption:paid',
      'member-consumption:refund',
      'member-consumption:pending',
    ])
    expect(items[0].stage).toBe('已入账')
    expect(items[1].stage).toBe('已退款')
    expect(items[2].stage).toBe('待支付')
    expect(items[0].boundary).toContain('yy_order')
  })
})
