import { describe, expect, it } from 'vitest'
import type { Album, BookingOrder, ProductConfig, SelectionLink } from '../../shared/stores/appStore'
import { buildAlbumProductFulfillmentEvidence } from './albumProductFulfillmentEvidence'

const product = (overrides: Partial<ProductConfig> = {}): ProductConfig => ({
  backendId: 'p-101',
  id: 'album-101',
  bizCategory: 'ALBUM',
  name: '轻奢入册',
  image: '',
  spec: '轻奢相册',
  price: '299',
  unitPrice: '30',
  includedCount: 12,
  active: true,
  desc: '',
  ...overrides,
})

const order = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
  backendId: 'o-101',
  storeBackendId: 's-1',
  productBackendId: 'p-101',
  id: 'YY-101',
  customer: '陈女士',
  phone: '13800003333',
  store: '深圳旗舰店',
  service: '轻奢入册',
  source: '工作台',
  method: '到店',
  orderTime: '2026-06-24 10:00:00',
  orderDate: '2026-06-24',
  orderClock: '10:00',
  arrivalTime: '2026-06-24 14:00:00',
  status: '已完成',
  payment: '已支付',
  amount: 299,
  arrivalDate: '2026-06-24',
  arrivalClock: '14:00',
  ...overrides,
})

const album = (overrides: Partial<Album> = {}): Album => ({
  backendId: 'a-101',
  orderBackendId: 'o-101',
  id: 'ALB-101',
  orderId: 'YY-101',
  customer: '陈女士',
  service: '轻奢入册',
  date: '2026-06-24',
  photographer: '摄影组',
  status: '已交付',
  selectedCount: 12,
  totalCount: 30,
  negatives: [],
  ...overrides,
})

const selectionLink = (overrides: Partial<SelectionLink> = {}): SelectionLink => ({
  backendId: 'sl-101',
  orderBackendId: 'o-101',
  albumBackendId: 'a-101',
  token: 'token-101',
  id: 'SEL-101',
  orderId: 'YY-101',
  albumId: 'ALB-101',
  display: '陈女士选片',
  url: 'https://example.test/selection/token-101',
  customer: '陈女士',
  phone: '13800003333',
  product: '轻奢入册',
  selectedCount: 12,
  extraCount: 2,
  visits: 3,
  expire: '06-30',
  status: '已完成',
  ...overrides,
})

describe('album product fulfillment evidence', () => {
  it('summarizes completed order, selection, and delivery evidence', () => {
    const evidence = buildAlbumProductFulfillmentEvidence({
      product: product(),
      orders: [order()],
      albums: [album()],
      selectionLinks: [selectionLink()],
    })

    expect(evidence.summary).toBe('订单履约证据已闭环')
    expect(evidence.orderCount).toBe(1)
    expect(evidence.albumCount).toBe(1)
    expect(evidence.selectionLinkCount).toBe(1)
    expect(evidence.completedAlbumCount).toBe(1)
    expect(evidence.items.every(item => item.tone === 'ready')).toBe(true)
  })

  it('keeps unmatched products pending without inventing evidence', () => {
    const evidence = buildAlbumProductFulfillmentEvidence({
      product: product({ backendId: 'p-404' }),
      orders: [order()],
      albums: [album()],
      selectionLinks: [selectionLink()],
    })

    expect(evidence.summary).toBe('暂无订单履约证据')
    expect(evidence.orderCount).toBe(0)
    expect(evidence.items.map(item => item.tone)).toEqual(['pending', 'pending', 'pending'])
  })

  it('keeps selection and delivery pending when only order evidence exists', () => {
    const evidence = buildAlbumProductFulfillmentEvidence({
      product: product(),
      orders: [order()],
      albums: [],
      selectionLinks: [],
    })

    expect(evidence.summary).toBe('已有订单证据，还差 2 项履约证据')
    expect(evidence.orderCount).toBe(1)
    expect(evidence.albumCount).toBe(0)
    expect(evidence.selectionLinkCount).toBe(0)
    expect(evidence.completedAlbumCount).toBe(0)
    expect(evidence.items.map(item => item.tone)).toEqual(['ready', 'pending', 'pending'])
  })

  it('matches external product or sku ids for channel-created orders', () => {
    const evidence = buildAlbumProductFulfillmentEvidence({
      product: product({ backendId: 'p-102' }),
      orders: [order({ productBackendId: undefined, externalSkuId: 'p-102' })],
      albums: [album()],
      selectionLinks: [],
    })

    expect(evidence.orderCount).toBe(1)
    expect(evidence.albumCount).toBe(1)
    expect(evidence.summary).toBe('订单履约证据已闭环')
  })
})
