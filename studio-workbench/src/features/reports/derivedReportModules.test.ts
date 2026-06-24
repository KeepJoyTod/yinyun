import { describe, expect, it } from 'vitest'
import type { Album, BookingOrder, CustomerInfo, EmployeeInfo } from '../../shared/stores/appStore'
import { buildDerivedReportItems, buildSnapshotAwareReportItems, getDerivedReportModule } from './derivedReportModules'

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

const employee = (input: Partial<EmployeeInfo> = {}): EmployeeInfo => ({
  backendId: '3101',
  storeBackendId: '1',
  storeName: '影约云深圳旗舰店',
  employeeNo: 'SZ-EMP-001',
  name: '阿杰',
  mobile: '13800001111',
  roleType: '摄影师',
  skillTags: ['证件照'],
  status: 'ACTIVE',
  sort: 10,
  remark: '',
  ...input,
})

const album = (input: Partial<Album> = {}): Album => ({
  backendId: '7001',
  orderBackendId: '9001',
  id: 'ALB-001',
  orderId: 'YY202606140001',
  customer: '陈女士',
  service: '证件照精修套餐',
  date: '2026-06-14',
  photographer: '阿杰',
  status: '选片中',
  selectedCount: 3,
  totalCount: 8,
  negatives: [],
  ...input,
})

describe('derived report modules', () => {
  const base = {
    orders: [
      order(),
      order({ id: 'YY2', source: '微信预约', service: '个人形象照套餐', amount: 399, payment: '待支付', status: '待确认' }),
    ],
    customers: [customer(), customer({ backendId: '4102', name: '林先生', mobile: '13900004444', source: '微信预约', totalSpend: 399 })],
    employees: [employee()],
    albums: [album()],
  }

  it('aggregates store daily, product and channel reports from unified orders', () => {
    const daily = buildDerivedReportItems(getDerivedReportModule('report-store-daily'), base)
    const products = buildDerivedReportItems(getDerivedReportModule('report-products'), base)
    const channels = buildDerivedReportItems(getDerivedReportModule('report-channels'), base)

    expect(daily).toHaveLength(1)
    expect(daily[0].metricLabel).toContain('2 单')
    expect(products.map(item => item.title)).toEqual(['证件照精修套餐', '个人形象照套餐'])
    expect(channels.map(item => item.title)).toEqual(['抖音来客', '微信预约'])
    expect(daily[0].boundary).toContain('yy_order')
    expect(daily[0].boundary).toContain('yy_report_snapshot')
  })

  it('derives employee and retouch workload from employees and albums', () => {
    const employees = buildDerivedReportItems(getDerivedReportModule('report-employees'), base)
    const retouch = buildDerivedReportItems(getDerivedReportModule('report-retouch'), base)

    expect(employees[0].title).toBe('阿杰')
    expect(employees[0].metricLabel).toBe('1 个相册')
    expect(retouch[0].metricLabel).toBe('8 张底片')
    expect(retouch[0].secondaryLabel).toBe('已选 3 张')
  })

  it('builds customer and conversion reports while keeping reviews as a true empty state', () => {
    const customers = buildDerivedReportItems(getDerivedReportModule('report-customers'), base)
    const conversion = buildDerivedReportItems(getDerivedReportModule('report-conversion'), base)
    const reviews = buildDerivedReportItems(getDerivedReportModule('report-reviews'), base)

    expect(customers.map(item => item.title)).toEqual(['抖音来客客户', '微信预约客户'])
    expect(conversion.map(item => item.title)).toEqual(['已下单', '已支付', '已确认服务', '已进入选片'])
    expect(conversion[1].metricLabel).toBe('1 单')
    expect(reviews).toEqual([])
    expect(getDerivedReportModule('report-reviews').emptyHint).toContain('评价表')
  })

  it('reviews module never contains fake ratings, fake counts, or fake approval rates', () => {
    const reviews = buildDerivedReportItems(getDerivedReportModule('report-reviews'), base)
    const module = getDerivedReportModule('report-reviews')

    expect(reviews).toHaveLength(0)
    expect(module.emptyTitle).not.toMatch(/\d+\.\d/)
    expect(module.emptyTitle).not.toMatch(/\d+分/)
    expect(module.emptyTitle).not.toMatch(/\d+条/)
    expect(module.description).not.toMatch(/\d+\.\d/)
    expect(module.description).not.toMatch(/\d+分/)
    expect(module.description).not.toMatch(/\d+条/)
    expect(module.description).not.toMatch(/\d+%/)
  })

  it('prefers matching backend report snapshots before real-time derived rows', () => {
    const items = buildSnapshotAwareReportItems(getDerivedReportModule('report-store-daily'), {
      ...base,
      snapshots: [
        {
          id: 'snap-1',
          storeId: '1',
          reportDate: '2026-06-14',
          reportType: 'store-daily',
          orderTotal: 2,
          arrivedTotal: 1,
          completedTotal: 1,
          revenueTotal: 528,
          selectionTotal: 89,
          sourceSummary: 'yy_order',
          remark: '日快照',
        },
        {
          id: 'snap-2',
          storeId: '1',
          reportDate: '2026-06-14',
          reportType: 'channels',
          orderTotal: 5,
          arrivedTotal: 4,
          completedTotal: 3,
          revenueTotal: 999,
          selectionTotal: 0,
          sourceSummary: 'yy_order',
          remark: '渠道快照',
        },
      ],
    })

    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('snapshot:snap-1')
    expect(items[0].ruleHint).toContain('yy_report_snapshot')
    expect(items[0].metricLabel).toContain('¥528')
  })
})
