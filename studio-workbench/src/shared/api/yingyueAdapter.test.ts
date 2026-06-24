import { describe, expect, it } from 'vitest'
import {
  buildOrderStatusStats,
  buildScheduleItemsFromOrders,
  buildYyPhotoAssetFormFromOss,
  extractRuoyiRows,
  mapYyAlbum,
  mapYyOrder,
  mapYyPhotoAsset,
  mapYyProduct,
  mapYyStore,
  orderStatusValues,
  resolveNextAssetSort,
} from './yingyueAdapter'

describe('yingyueAdapter', () => {
  it('extracts rows from RuoYi table responses', () => {
    expect(extractRuoyiRows({ code: 200, rows: [{ id: '1' }], total: 1 })).toEqual([{ id: '1' }])
    expect(extractRuoyiRows([{ id: '2' }])).toEqual([{ id: '2' }])
  })

  it('maps store/product/order/album/asset into workbench DTO shape', () => {
    const store = mapYyStore({
      id: '101',
      storeCode: 'YY-SZ',
      storeName: '影约云深圳旗舰店',
      status: '0',
      phone: '0755-8888',
      address: '深圳南山',
      businessHours: '09:30-21:00',
      remark: '店长：阿杰',
    })
    expect(store).toMatchObject({
      id: '101',
      storeCode: 'YY-SZ',
      name: '影约云深圳旗舰店',
      status: '营业中',
      managerName: '阿杰',
      openTime: '09:30',
      closeTime: '21:00',
    })

    const product = mapYyProduct({
      id: '201',
      storeId: '101',
      productType: 'SERVICE',
      productName: '证件照精修套餐',
      price: 129,
      selectionPrice: 39,
      durationMinutes: 60,
      albumProductName: '精修底片',
      status: '0',
      remark: '含拍摄、精修、电子底片交付',
    })
    expect(product).toMatchObject({
      id: '201',
      productCode: 'YY_PRODUCT_201',
      name: '证件照精修套餐',
      priceCents: 12900,
      unitPriceCents: 3900,
      active: true,
    })

    const order = mapYyOrder(
      {
        id: '301',
        storeId: '101',
        orderNo: 'YY202606100001',
        customerName: '陈女士',
        customerPhone: '13800003333',
        source: 'DOUYIN_LIFE',
        bookingMethod: 'CHANNEL',
        orderTime: '2026-06-10 09:20:00',
        arrivalTime: '2026-06-10 14:00:00',
        status: 'CONFIRMED',
        workstationNo: 'A 棚',
        externalOrderId: 'DY-001',
      },
      [product],
      { productId: '201', serviceNameSnapshot: '证件照精修套餐' },
    )
    expect(order).toMatchObject({
      id: '301',
      storeId: '101',
      orderNo: 'YY202606100001',
      source: '抖音来客',
      serviceMethod: '渠道同步',
      status: '已确认',
      amountCents: 12900,
    })

    const slotFallbackOrder = mapYyOrder(
      {
        id: '302',
        storeId: '101',
        orderNo: 'DYL-202606170001',
        customerName: '王先生',
        customerPhone: '13900004444',
        source: 'DOUYIN_LIFE',
        bookingMethod: 'CHANNEL',
        orderTime: '2026-06-17 09:20:00',
        arrivalTime: '',
        status: 'PENDING',
        payStatus: 'PAID',
        externalSkuId: '1867049646914595',
        externalPoiId: '7228779175929186363',
        slotDate: '2026-06-17',
        slotStartTime: '10:30',
        slotEndTime: '11:00',
      },
      [product],
      { productId: '201', serviceNameSnapshot: '证件照精修套餐' },
    )
    expect(slotFallbackOrder).toMatchObject({
      id: '302',
      productId: '201',
      serviceNameSnapshot: '证件照精修套餐',
      arrivalAt: '2026-06-17 10:30:00',
      slotDate: '2026-06-17',
      slotStartTime: '10:30',
      slotEndTime: '11:00',
      externalPoiId: '7228779175929186363',
    })

    const asset = mapYyPhotoAsset({
      id: '501',
      storeId: '101',
      albumId: '401',
      fileName: 'chen-01.jpg',
      fileUrl: '/resource/oss/preview/501',
      objectKey: 'photos/chen-01.jpg',
      thumbnailObjectKey: '',
      sort: 3,
      isSelected: '1',
      visible: '1',
      createTime: '2026-06-10 15:00:00',
    })
    expect(asset).toMatchObject({
      id: '501',
      albumId: '401',
      displayName: 'chen-01.jpg',
      selected: true,
      sortOrder: 3,
    })

    const album = mapYyAlbum(
      {
        id: '401',
        storeId: '101',
        orderId: '301',
        albumName: '陈女士证件照',
        customerName: '陈女士',
        publicToken: 'token-401',
        accessCode: 'PICK-401',
        channelType: 'DOUYIN_LIFE',
        selectionStatus: 'SELECTING',
        expireTime: '2026-06-30 23:59:59',
      },
      [asset],
      [order],
    )
    expect(album).toMatchObject({
      id: '401',
      albumNo: 'ALB-401',
      orderId: '301',
      customerName: '陈女士',
      status: '选片中',
      selectedCount: 1,
      totalCount: 1,
    })

    const standaloneAlbum = mapYyAlbum(
      {
        id: '402',
        storeId: '101',
        orderId: '',
        albumName: '现场补拍相册',
        customerName: '现场客户',
        publicToken: 'token-402',
        accessCode: 'PICK-402',
        channelType: 'LOCAL',
        selectionStatus: 'WAITING',
        expireTime: '2026-06-30 23:59:59',
      },
      [],
      [order],
    )
    expect(standaloneAlbum).toMatchObject({
      id: '402',
      orderId: null,
      customerName: '现场客户',
      serviceName: '现场补拍相册',
    })
  })

  it('maps confirmed photo selections as still deliverable', () => {
    const album = mapYyAlbum(
      {
        id: '403',
        storeId: '101',
        orderId: '301',
        albumName: '确认后待交付相册',
        customerName: '测试客户',
        selectionStatus: 'CONFIRMED',
      },
      [
        {
          id: '503',
          albumId: '403',
          fileId: '503',
          originalName: 'picked.jpg',
          displayName: 'picked.jpg',
          sortOrder: 1,
          selected: true,
          url: 'https://example.com/picked.jpg',
          uploadedAt: '',
        },
      ],
      [],
    )

    expect(album.status).toBe('选片中')
    expect(album.selectedCount).toBe(1)
  })

  it('maps delivered photo selections as delivered albums', () => {
    const album = mapYyAlbum(
      {
        id: '404',
        storeId: '101',
        orderId: '301',
        albumName: '已交付相册',
        customerName: '测试客户',
        selectionStatus: 'DELIVERED',
      },
      [],
      [],
    )

    expect(album.status).toBe('已交付')
  })

  it('builds yy_photo_asset payload from resolved OSS metadata', () => {
    expect(
      resolveNextAssetSort([
        {
          id: '501',
          albumId: '401',
          fileId: '501',
          originalName: 'a.jpg',
          displayName: 'a.jpg',
          sortOrder: 0,
          selected: false,
          url: 'https://oss/a.jpg',
          uploadedAt: '',
        },
        {
          id: '502',
          albumId: '401',
          fileId: '502',
          originalName: 'b.jpg',
          displayName: 'b.jpg',
          sortOrder: 7,
          selected: false,
          url: 'https://oss/b.jpg',
          uploadedAt: '',
        },
      ]),
    ).toBe(8)

    expect(
      buildYyPhotoAssetFormFromOss(
        { id: '401', storeId: '101' },
        {
          ossId: '2063',
          fileName: 'photo/2026/06/10/chen-01.webp',
          originalName: '陈女士-精修-01.webp',
          url: 'https://private-bucket.oss-cn-beijing.aliyuncs.com/photo/2026/06/10/chen-01.webp',
        },
        'fallback.webp',
        8,
        '2063',
      ),
    ).toEqual({
      storeId: '101',
      albumId: '401',
      fileName: '陈女士-精修-01.webp',
      fileUrl: 'https://private-bucket.oss-cn-beijing.aliyuncs.com/photo/2026/06/10/chen-01.webp',
      objectKey: 'photo/2026/06/10/chen-01.webp',
      thumbnailObjectKey: '',
      sort: 8,
      isSelected: '0',
      visible: '1',
      remark: 'OSS ID: 2063',
    })

    expect(() =>
      buildYyPhotoAssetFormFromOss(
        { id: '401', storeId: '101' },
        { ossId: '2064', originalName: 'bad.webp', url: 'https://oss/bad.webp' },
        'bad.webp',
        9,
        '2064',
      ),
    ).toThrow('OSS Key 获取失败')
  })

  it('maps completed yy_order status to the completed workbench status label', () => {
    const order = mapYyOrder({
      id: '303',
      storeId: '101',
      orderNo: 'JY-202606170011',
      customerName: '张女士',
      customerPhone: '15300000000',
      source: 'DOUYIN_LIFE',
      bookingMethod: 'CHANNEL',
      orderTime: '2026-06-17 10:17:00',
      arrivalTime: '2026-06-17 11:00:00',
      status: 'COMPLETED',
      payStatus: 'PAID',
      workstationNo: 'A002号',
    })

    expect(order.status).toBe('已完成')
    expect(orderStatusValues.已完成).toBe('COMPLETED')
  })

  it('maps refunded yy_order status to the refunded workbench status label', () => {
    const order = mapYyOrder({
      id: '304',
      storeId: '101',
      orderNo: 'DYL-REFUND-304',
      customerName: '赵女士',
      customerPhone: '15300000001',
      source: 'DOUYIN_LIFE',
      bookingMethod: 'CHANNEL',
      orderTime: '2026-06-17 10:20:00',
      arrivalTime: '2026-06-17 11:30:00',
      status: 'REFUNDED',
      payStatus: 'REFUNDED',
      refundStatus: 'REFUNDED',
      refundAmountCent: 9900,
    })

    expect(order.status).toBe('已退单')
    expect(order.paymentStatus).toBe('已退款')
    expect(orderStatusValues.已退单).toBe('REFUNDED')
  })

  it('keeps the backend slot end time and only falls back to computed duration when it is missing', () => {
    const product = mapYyProduct({
      id: '901',
      productName: '轻写真',
      durationMinutes: 90,
      price: 299,
      selectionPrice: 0,
      status: '0',
    })

    const realEndTimeOrder = mapYyOrder({
      id: '4010',
      storeId: '101',
      orderNo: 'DYL-REAL-END',
      customerName: '周女士',
      source: 'DOUYIN_LIFE',
      bookingMethod: 'CHANNEL',
      slotDate: '2026-06-19',
      slotStartTime: '10:30',
      slotEndTime: '11:15',
      arrivalTime: '',
      status: 'CONFIRMED',
    }, [product], { productId: '901', serviceNameSnapshot: '轻写真' })

    const fallbackEndTimeOrder = mapYyOrder({
      id: '4011',
      storeId: '101',
      orderNo: 'DYL-FALLBACK-END',
      customerName: '钱女士',
      source: 'DOUYIN_LIFE',
      bookingMethod: 'CHANNEL',
      slotDate: '2026-06-19',
      slotStartTime: '10:30',
      slotEndTime: '',
      arrivalTime: '',
      status: 'CONFIRMED',
    }, [product], { productId: '901', serviceNameSnapshot: '轻写真' })

    expect(realEndTimeOrder.slotEndTime).toBe('11:15')
    expect(fallbackEndTimeOrder.slotEndTime).toBe('11:30')
  })

  it('builds schedule items from real slot fields when arrival time is absent', () => {
    const items = buildScheduleItemsFromOrders([
      {
        id: '9001',
        orderNo: 'JY-SLOT-ONLY',
        customerName: '王女士',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: '900000000001000035',
        serviceNameSnapshot: '证件照',
        channelType: 'DOUYIN_LIFE',
        source: '抖音来客',
        serviceMethod: '渠道同步',
        orderAt: '2026-06-18 09:00:00',
        arrivalAt: '',
        status: '已确认',
        paymentStatus: '已支付',
        amountCents: 9900,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '18:00',
        slotEndTime: '18:30',
        inventoryStatus: 'CONFIRMED',
        conflictReason: '',
        remark: '',
      },
    ], '2026-06-18', '900000000000000100')

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      orderNo: 'JY-SLOT-ONLY',
      startAt: '2026-06-18 18:00:00',
      endAt: '2026-06-18 18:30:00',
      storeId: '900000000000000100',
    })
  })

  it('does not treat operation remarks as service names for local staff orders', () => {
    const order = mapYyOrder({
      id: '501',
      storeId: '101',
      orderNo: 'YY-STAFF-501',
      customerName: '李女士',
      source: 'LOCAL',
      bookingMethod: 'STAFF_MANUAL',
      slotDate: '2026-06-19',
      slotStartTime: '19:00',
      slotEndTime: '19:30',
      arrivalTime: '',
      status: 'CANCELLED',
      payStatus: 'UNPAID',
      remark: '真实登录态验收：取消释放库存',
    })

    expect(order.serviceNameSnapshot).toBe('摄影服务')
    expect(order.remark).toBe('真实登录态验收：取消释放库存')
    expect(order.paymentStatus).toBe('待支付')
  })

  it('prefers real slot fields over arrival time when building schedule items', () => {
    const order = mapYyOrder({
      id: '910000000012138444',
      storeId: '900000000000000100',
      orderNo: 'JY-12138444',
      customerName: '王女士',
      source: 'JIANYUE',
      bookingMethod: 'JY_IMPORT',
      orderTime: '2026-06-18 10:00:00',
      arrivalTime: '2026-06-18 00:00:00',
      slotDate: '2026-06-18',
      slotStartTime: '18:00',
      slotEndTime: '18:30',
      status: 'PENDING',
      payStatus: 'PAID',
    })

    expect(order.arrivalAt).toBe('2026-06-18 18:00:00')

    const items = buildScheduleItemsFromOrders([order], '2026-06-18', '900000000000000100')

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      orderNo: 'JY-12138444',
      startAt: '2026-06-18 18:00:00',
      endAt: '2026-06-18 18:30:00',
    })
  })

  it('does not fabricate schedule items from Douyin ledger orders without real slot fields', () => {
    const items = buildScheduleItemsFromOrders([
      {
        id: '920000000012138445',
        orderNo: 'DYL-NO-SLOT-001',
        customerName: '抖音客户',
        customerPhone: '13800001111',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'DOUYIN_LIFE',
        source: '抖音来客',
        serviceMethod: '渠道同步',
        orderAt: '2026-06-18 09:00:00',
        arrivalAt: '2026-06-18 18:00:00',
        status: '待确认',
        paymentStatus: '已支付',
        amountCents: 9900,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '',
        slotStartTime: '',
        slotEndTime: '',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
    ], '2026-06-18', '900000000000000100')

    expect(items).toEqual([])
  })

  it('builds workbench status stats from the current grouped service flow instead of legacy labels', () => {
    const stats = buildOrderStatusStats([
      {
        id: 'pending-1',
        orderNo: 'P-1',
        customerName: '待确认客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'LOCAL',
        source: '本地',
        serviceMethod: '人工预约',
        orderAt: '2026-06-18 09:00:00',
        arrivalAt: '2026-06-18 10:00:00',
        status: '待确认',
        paymentStatus: '已支付',
        amountCents: 10000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '10:00',
        slotEndTime: '10:30',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
      {
        id: 'confirmed-1',
        orderNo: 'C-1',
        customerName: '服务中客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '形象照',
        channelType: 'LOCAL',
        source: '本地',
        serviceMethod: '人工预约',
        orderAt: '2026-06-18 09:10:00',
        arrivalAt: '2026-06-18 10:30:00',
        status: '已确认',
        paymentStatus: '已支付',
        amountCents: 20000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '10:30',
        slotEndTime: '11:00',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
      {
        id: 'shooting-1',
        orderNo: 'S-1',
        customerName: '旧服务中客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '写真',
        channelType: 'LOCAL',
        source: '本地',
        serviceMethod: '人工预约',
        orderAt: '2026-06-18 09:20:00',
        arrivalAt: '2026-06-18 11:00:00',
        status: '拍摄中',
        paymentStatus: '已支付',
        amountCents: 30000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '11:00',
        slotEndTime: '11:30',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
      {
        id: 'completed-1',
        orderNo: 'D-1',
        customerName: '完成客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'LOCAL',
        source: '本地',
        serviceMethod: '人工预约',
        orderAt: '2026-06-18 09:30:00',
        arrivalAt: '2026-06-18 11:30:00',
        status: '已完成',
        paymentStatus: '已支付',
        amountCents: 40000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '11:30',
        slotEndTime: '12:00',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
      {
        id: 'cancelled-1',
        orderNo: 'X-1',
        customerName: '取消客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'LOCAL',
        source: '本地',
        serviceMethod: '人工预约',
        orderAt: '2026-06-18 09:40:00',
        arrivalAt: '2026-06-18 12:00:00',
        status: '已取消',
        paymentStatus: '待支付',
        amountCents: 50000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '12:00',
        slotEndTime: '12:30',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
      {
        id: 'refunded-1',
        orderNo: 'R-1',
        customerName: '退款客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'DOUYIN_LIFE',
        source: '抖音来客',
        serviceMethod: '渠道同步',
        orderAt: '2026-06-18 09:50:00',
        arrivalAt: '2026-06-18 12:30:00',
        status: '已退单',
        paymentStatus: '已退款',
        amountCents: 60000,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '12:30',
        slotEndTime: '13:00',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
    ])

    expect(stats).toEqual([
      { status: '待服务', label: '待服务', count: 1, amountCents: 10000 },
      { status: '服务中', label: '服务中', count: 2, amountCents: 50000 },
      { status: '已完成', label: '已完成', count: 1, amountCents: 40000 },
      { status: '已取消', label: '已取消', count: 1, amountCents: 50000 },
      { status: '已退单', label: '已退单', count: 1, amountCents: 60000 },
    ])
  })

  it('keeps cancelled refunded orders in the cancelled bucket instead of double-counting them as refunded', () => {
    const stats = buildOrderStatusStats([
      {
        id: 'cancelled-refunded-1',
        orderNo: 'CR-1',
        customerName: '取消退款客户',
        customerPhone: '',
        storeId: '900000000000000100',
        productId: null,
        serviceGroupId: null,
        inventorySlotId: null,
        serviceNameSnapshot: '证件照',
        channelType: 'DOUYIN_LIFE',
        source: '抖音来客',
        serviceMethod: '渠道同步',
        orderAt: '2026-06-18 10:00:00',
        arrivalAt: '2026-06-18 13:00:00',
        status: '已取消',
        paymentStatus: '已退款',
        amountCents: 18800,
        externalProductId: '',
        externalSkuId: '',
        externalPoiId: '',
        slotDate: '2026-06-18',
        slotStartTime: '13:00',
        slotEndTime: '13:30',
        inventoryStatus: '',
        conflictReason: '',
        remark: '',
      },
    ])

    expect(stats).toEqual([
      { status: '待服务', label: '待服务', count: 0, amountCents: 0 },
      { status: '服务中', label: '服务中', count: 0, amountCents: 0 },
      { status: '已完成', label: '已完成', count: 0, amountCents: 0 },
      { status: '已取消', label: '已取消', count: 1, amountCents: 18800 },
      { status: '已退单', label: '已退单', count: 0, amountCents: 0 },
    ])
  })
})
