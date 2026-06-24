import { describe, expect, it } from 'vitest'
import { buildWorkbenchStoreNames, mapAlbum, mapOperationLog, mapOrder, mapProduct, productPayload } from './appStoreTransforms'

describe('appStoreTransforms helpers', () => {
  it('builds unique store names without duplicating 全部门店', () => {
    expect(buildWorkbenchStoreNames([
      { name: '全部门店' },
      { name: '滨州万达店' },
      { name: '滨州万达店' },
      { name: ' ' },
      { name: '威海智慧谷店' },
    ])).toEqual(['全部门店', '滨州万达店', '威海智慧谷店'])
  })

  it('falls back to slotDate and slotStartTime when arrivalAt is missing', () => {
    const order = mapOrder({
      id: '2065344370686517250',
      orderNo: 'DYL-20260612-4852',
      customerName: '测试客户',
      customerPhone: '15200007555',
      storeId: '900000000000000200',
      productId: null,
      serviceNameSnapshot: '证件照套餐',
      source: '抖音来客',
      serviceMethod: '渠道同步',
      orderAt: '2026-06-12 16:04:04',
      arrivalAt: '',
      status: '待确认',
      paymentStatus: '已支付',
      amountCents: 1900,
      channelType: 'DOUYIN_LIFE',
      externalProductId: '1867049893048363',
      externalSkuId: '1867049646914595',
      externalPoiId: '7647419894213445642',
      slotDate: '2026-06-17',
      slotStartTime: '10:30',
      slotEndTime: '11:00',
      remark: '订单同步备注',
    }, [
      {
        backendId: '900000000000000200',
        id: 'BZ-WUYUE',
        name: '滨州吾悦店',
        status: '营业中',
        manager: '主管 · 门店账号',
        monthlyOrders: '0',
        pendingOrders: '0',
        address: '',
        phone: '',
        hours: '09:00 - 21:00',
      },
    ])

    expect(order.store).toBe('滨州吾悦店')
    expect(order.arrivalDate).toBe('2026-06-17')
    expect(order.arrivalClock).toBe('10:30')
    expect(order.arrivalTime).toBe('06-17 10:30')
    expect(order.channelType).toBe('DOUYIN_LIFE')
    expect(order.externalProductId).toBe('1867049893048363')
    expect(order.externalSkuId).toBe('1867049646914595')
    expect(order.externalPoiId).toBe('7647419894213445642')
    expect(order.remark).toBe('订单同步备注')
  })

  it('prefers slotDate and slotStartTime over arrivalAt for scheduled appointments', () => {
    const order = mapOrder({
      id: '910000000012138444',
      orderNo: 'JY-12138444',
      customerName: '测试客户',
      customerPhone: '',
      storeId: '900000000000000100',
      productId: null,
      serviceNameSnapshot: '证件照套餐',
      source: '简约网',
      serviceMethod: '导入预约',
      orderAt: '2026-06-18 10:00:00',
      arrivalAt: '2026-06-18 00:00:00',
      status: '待确认',
      paymentStatus: '已支付',
      amountCents: 1900,
      channelType: 'JIANYUE',
      slotDate: '2026-06-18',
      slotStartTime: '18:00',
      slotEndTime: '18:30',
      remark: '',
    }, [
      {
        backendId: '900000000000000100',
        id: 'BZ-WANDA',
        name: '滨州万达店',
        status: '营业中',
        manager: '主管 · 门店账号',
        monthlyOrders: '0',
        pendingOrders: '0',
        address: '',
        phone: '',
        hours: '09:00 - 21:00',
      },
    ])

    expect(order.arrivalDate).toBe('2026-06-18')
    expect(order.arrivalClock).toBe('18:00')
    expect(order.arrivalTime).toBe('06-18 18:00')
  })

  it('keeps refund status and amount on mapped orders for detail diagnostics', () => {
    const order = mapOrder({
      id: '2065344370686517999',
      orderNo: 'DYL-REFUND-001',
      customerName: '退款客户',
      customerPhone: '15200008888',
      storeId: '900000000000000200',
      productId: null,
      serviceNameSnapshot: '证件照套餐',
      source: '抖音来客',
      serviceMethod: '渠道同步',
      orderAt: '2026-06-12 16:04:04',
      arrivalAt: '',
      status: '已退单',
      paymentStatus: '已退款',
      amountCents: 9900,
      refundStatus: 'REFUNDED',
      refundAmountCent: 8800,
      channelType: 'DOUYIN_LIFE',
      remark: '退款通知同步',
    }, [])

    expect(order.status).toBe('已退单')
    expect(order.payment).toBe('已退款')
    expect(order.refundStatus).toBe('REFUNDED')
    expect(order.refundAmountCent).toBe(8800)
  })

  it('keeps refunded backend orders as terminal refunded workbench orders', () => {
    const order = mapOrder({
      id: '2065344370686518000',
      orderNo: 'DYL-REFUND-002',
      customerName: '退款客户二',
      customerPhone: '15200009999',
      storeId: '900000000000000200',
      productId: null,
      serviceNameSnapshot: '证件照套餐',
      source: '抖音来客',
      serviceMethod: '渠道同步',
      orderAt: '2026-06-12 16:04:04',
      arrivalAt: '',
      status: '已退单',
      paymentStatus: '已退款',
      amountCents: 9900,
      refundStatus: 'REFUNDED',
      refundAmountCent: 8800,
      channelType: 'DOUYIN_LIFE',
      remark: '退款通知同步',
    }, [])

    expect(order.status).toBe('已退单')
    expect(order.payment).toBe('已退款')
    expect(order.arrivalDate).toBe('')
    expect(order.arrivalClock).toBe('')
  })

  it('maps raw backend refunded status and payment values to terminal workbench labels', () => {
    const order = mapOrder({
      id: '2065344370686518001',
      orderNo: 'DYL-RAW-REFUND-003',
      customerName: '退款客户三',
      customerPhone: '15200007777',
      storeId: '900000000000000200',
      productId: null,
      serviceNameSnapshot: '证件照套餐',
      source: '抖音来客',
      serviceMethod: '渠道同步',
      orderAt: '2026-06-12 16:04:04',
      arrivalAt: '',
      status: 'REFUNDED',
      paymentStatus: 'REFUNDED',
      amountCents: 9900,
      refundStatus: 'REFUNDED',
      refundAmountCent: 8800,
      channelType: 'DOUYIN_LIFE',
      remark: '退款通知同步',
    }, [])

    expect(order.status).toBe('已退单')
    expect(order.payment).toBe('已退款')
  })

  it('maps backend card products back to card category with concrete store scope', () => {
    const product = mapProduct({
      id: '900000000000030001',
      storeId: '900000000000000100',
      storeName: '滨州万达店',
      productCode: 'YY_PRODUCT_900000000000030001',
      name: 'Codex验收储值卡草稿',
      coverUrl: null,
      spec: '储值卡',
      priceCents: 100,
      unitPriceCents: 0,
      includedCount: 0,
      active: false,
      description: '验收草稿卡',
    })

    expect(product.bizCategory).toBe('CARD')
    expect(product.cardMode).toBe('STORED')
    expect(product.storeBackendId).toBe('900000000000000100')
    expect(product.storeNames).toEqual(['滨州万达店'])
    expect(productPayload(product).storeId).toBe('900000000000000100')
  })

  it('maps backend album and group-buy products back to normalized business categories', () => {
    const album = mapProduct({
      id: '900000000000030002',
      storeId: '900000000000000100',
      storeName: '滨州万达店',
      productCode: 'YY_PRODUCT_900000000000030002',
      name: '轻奢相册入册 12 张',
      coverUrl: null,
      spec: 'ALBUM',
      priceCents: 69900,
      unitPriceCents: 0,
      includedCount: 12,
      active: true,
      description: '含精修入册与相册排版',
    })
    const group = mapProduct({
      id: '900000000000030003',
      storeId: '900000000000000100',
      storeName: '滨州万达店',
      productCode: 'YY_PRODUCT_900000000000030003',
      name: '企业团单形象照',
      coverUrl: null,
      spec: 'GROUP_BUY',
      priceCents: 199900,
      unitPriceCents: 0,
      includedCount: 1,
      active: true,
      description: '多人企业拍摄套餐',
    })

    expect(album.bizCategory).toBe('ALBUM')
    expect(group.bizCategory).toBe('GROUP_BUY')
    expect(productPayload(album).bizCategory).toBe('ALBUM')
    expect(productPayload(group).bizCategory).toBe('GROUP_BUY')
  })

  it('keeps standalone photo albums usable when they are not linked to an order', () => {
    const album = mapAlbum({
      id: '900000000000040001',
      albumNo: 'ALB-900000000000040001',
      orderId: null,
      customerName: '现场补拍客户',
      serviceName: '现场补拍相册',
      shootDate: '2026-06-20',
      photographer: '',
      status: '待客户选片',
      selectedCount: 0,
      totalCount: 0,
      photos: [],
    }, [])

    expect(album.backendId).toBe('900000000000040001')
    expect(album.orderBackendId).toBeUndefined()
    expect(album.orderId).toBe('')
    expect(album.customer).toBe('现场补拍客户')
  })

  it('preserves backend operation operator type for order audit evidence', () => {
    const log = mapOperationLog({
      operId: '99001',
      tenantId: '000000',
      title: '预约订单改期',
      businessType: 2,
      method: 'org.dromara.yy.controller.YyOrderController.reschedule()',
      requestMethod: 'POST',
      operatorType: 1,
      operName: '门店主管',
      deptName: '滨州万达店',
      operUrl: '/yy/order/9001/reschedule',
      operIp: '127.0.0.1',
      operLocation: '内网IP',
      operParam: '{"slotDate":"2026-06-18","slotStartTime":"18:00","slotEndTime":"18:30"}',
      jsonResult: '{}',
      status: 0,
      errorMsg: '',
      operTime: '2026-06-15 10:20:00',
      costTime: 146,
    })

    expect(log.operatorType).toBe(1)
  })
})
