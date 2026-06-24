import { describe, expect, it } from 'vitest'
import customersSource from './CustomersView.vue?raw'

describe('customers page contract', () => {
  it('shows a customer operations board before the archive list', () => {
    expect(customersSource).toContain('customer-ops-board')
    expect(customersSource).toContain('客户档案')
    expect(customersSource).toContain('高净值客户')
    expect(customersSource).toContain('本月新客')
    expect(customersSource).toContain('可回访客户')
  })

  it('offers quick archive filters and customer detail drawers', () => {
    expect(customersSource).toContain('quickCustomerFilters')
    expect(customersSource).toContain('全部客户')
    expect(customersSource).toContain('待跟进')
    expect(customersSource).toContain('查看详情')
    expect(customersSource).toContain('最近订单')
    expect(customersSource).toContain('客户备注')
  })

  it('uses customer store apis with loading, empty and retry feedback', () => {
    expect(customersSource).toContain('appStore.loadCustomers')
    expect(customersSource).toContain('appStore.loadCustomerRecentOrders')
    expect(customersSource).toContain('loading')
    expect(customersSource).toContain('客户加载失败')
    expect(customersSource).toContain('当前筛选下没有客户')
  })

  it('links customer detail to unified order page with search query', () => {
    expect(customersSource).toContain('goToOrders')
    expect(customersSource).toContain('/order/appointment')
    expect(customersSource).toContain('keyword')
    expect(customersSource).toContain("query: { q: keyword, quick: 'all' }")
    expect(customersSource).toContain('查看订单')
  })
})
