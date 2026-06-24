import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { CustomerInfo, BookingOrder } from './appStoreTypes'
import { mapCustomer, mapOrder } from './appStoreTransforms'
import { createDemoBackendId, splitTags } from './appStoreTransforms'
import type { CustomerPayload } from '../api/backend'
import type { StoreInfo } from './appStoreTypes'
import type { BackendId } from '../api/backendId'

const requireValue = (value: string, message: string) => {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(message)
  return trimmed
}

export const customersStore = reactive({
  customers: [] as CustomerInfo[],
  customerRecentOrders: {} as Record<BackendId, BookingOrder[]>,

  reset() {
    this.customers = []
    this.customerRecentOrders = {}
  },

  async refresh(keyword: string) {
    const customers = await backendApi.listCustomers({ keyword: keyword.trim() || undefined })
    this.customers = customers.map(mapCustomer)
    return this.customers
  },

  async refreshRecentOrders(customerBackendId: BackendId, limit: number, stores: StoreInfo[]) {
    const orders = (await backendApi.listCustomerRecentOrders(customerBackendId, limit))
      .map(order => mapOrder(order, stores))
    this.customerRecentOrders = {
      ...this.customerRecentOrders,
      [customerBackendId]: orders,
    }
    return orders
  },

  saveCustomerDemo(input: {
    id?: BackendId
    name: string
    mobile: string
    gender: string
    birthday: string
    source: string
    memberLevel: string
    tags: string
    remark: string
  }) {
    const current = this.customers.find(item => item.backendId === input.id)
    const next: CustomerInfo = {
      backendId: input.id ?? createDemoBackendId('customer'),
      name: requireValue(input.name, '请输入客户姓名'),
      mobile: requireValue(input.mobile, '请输入客户手机号'),
      gender: input.gender.trim() || '未设置',
      birthday: input.birthday,
      source: input.source.trim() || '未标记',
      memberLevel: input.memberLevel.trim() || '普通',
      totalOrderCount: current?.totalOrderCount ?? 0,
      totalSpend: current?.totalSpend ?? 0,
      lastOrderTime: current?.lastOrderTime ?? '',
      tags: splitTags(input.tags),
      remark: input.remark.trim(),
    }
    const idx = this.customers.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.customers = [next, ...this.customers]
    else this.customers[idx] = next
    return next
  },

  async saveCustomer(input: {
    id?: BackendId
    name: string
    mobile: string
    gender: string
    birthday: string
    source: string
    memberLevel: string
    tags: string
    remark: string
  }) {
    const payload: CustomerPayload = {
      id: input.id,
      customerName: requireValue(input.name, '请输入客户姓名'),
      mobile: requireValue(input.mobile, '请输入客户手机号'),
      gender: input.gender.trim(),
      birthday: input.birthday || undefined,
      source: input.source.trim(),
      memberLevel: input.memberLevel.trim(),
      tags: input.tags.trim(),
      remark: input.remark.trim(),
    }
    const dto = input.id
      ? await backendApi.updateCustomer(payload)
      : await backendApi.createCustomer(payload)
    const next = mapCustomer(dto)
    const idx = this.customers.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.customers = [next, ...this.customers]
    else this.customers[idx] = next
    return next
  },

  loadDemo(today: string, orders: BookingOrder[]) {
    this.customers = [
      {
        backendId: '4101',
        name: '陈女士',
        mobile: '13800003333',
        gender: '女',
        birthday: '',
        source: '抖音来客',
        memberLevel: '金卡',
        totalOrderCount: 3,
        totalSpend: 1299,
        lastOrderTime: `${today} 09:20:00`,
        tags: ['证件照', '高复购'],
        remark: '对加急交付敏感，优先短信提醒',
      },
      {
        backendId: '4102',
        name: '林先生',
        mobile: '13900004444',
        gender: '男',
        birthday: '',
        source: '微信预约',
        memberLevel: '普通',
        totalOrderCount: 1,
        totalSpend: 399,
        lastOrderTime: `${today} 10:40:00`,
        tags: ['形象照'],
        remark: '适合后续职业照回访',
      },
      {
        backendId: '4103',
        name: '周同学',
        mobile: '13700005555',
        gender: '未设置',
        birthday: '',
        source: '手工录入',
        memberLevel: '普通',
        totalOrderCount: 1,
        totalSpend: 129,
        lastOrderTime: `${today} 11:15:00`,
        tags: ['待确认'],
        remark: '待补支付和到店确认',
      },
    ]
    this.customerRecentOrders = {
      4101: orders.filter(order => order.phone === '13800003333'),
      4102: orders.filter(order => order.phone === '13900004444'),
      4103: orders.filter(order => order.phone === '13700005555'),
    }
  },

  loadDemoRecentOrders(customer: CustomerInfo, limit: number, orders: BookingOrder[]) {
    const recentOrders = orders
      .filter(order => order.phone === customer.mobile)
      .slice(0, limit)
    this.customerRecentOrders = {
      ...this.customerRecentOrders,
      [customer.backendId]: recentOrders,
    }
    return recentOrders
  },
})
