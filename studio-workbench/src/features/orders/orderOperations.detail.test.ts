import { describe, expect, it } from 'vitest'
import {
  buildOrderCancelGuidance,
  buildOrderChannelDiagnosticText,
  buildOrderDetailTimeline,
  buildOrderOperationEvidenceCards,
  buildOrderPhotoDeliveryStage,
  buildOrderSourceContext,
  getOrderChannelSyncLogs,
  getOrderOperationLogs,
  isOrderOperationLog,
} from './orderOperations'
import { makeAlbum, makeChannelLog, makeOperationLog, makeOrder } from './orderOperations.testData'

describe('order detail operations helpers', () => {
  it('finds order channel sync logs across logid, remark, and error context', () => {
    const order = makeOrder({ backendId: '9001', id: 'YY202606150001' })
    const logs = [
      makeChannelLog({
        backendId: 'log-request',
        requestId: 'douyin-logid-YY202606150001',
        remark: '平台订单查询',
      }),
      makeChannelLog({
        backendId: 'log-remark',
        requestId: 'douyin-logid-remark',
        remark: '同步本地订单 orderNo=YY202606150001 到 yy_order id=9001',
      }),
      makeChannelLog({
        backendId: 'log-error',
        requestId: 'douyin-logid-error',
        status: 'FAILED',
        errorMessage: 'localOrderId=9001 库存冲突',
        retryable: true,
      }),
      makeChannelLog({
        backendId: 'log-store-noise',
        requestId: 'douyin-logid-store-noise',
        remark: '同门店订单补偿同步，但没有订单标识',
      }),
      makeChannelLog({
        backendId: 'log-other',
        requestId: 'douyin-logid-YY202606150002',
        remark: '同步其他订单 YY202606150002',
      }),
    ]

    expect(getOrderChannelSyncLogs(order, logs).map(log => log.backendId)).toEqual([
      'log-request',
      'log-remark',
      'log-error',
    ])
  })

  it('builds copyable channel troubleshooting text for an order detail drawer', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      source: 'DOUYIN_LIFE',
      store: '影约云旗舰店',
    })
    const logs = [
      makeChannelLog({
        requestId: '202606151030ABCDEF',
        status: 'FAILED',
        errorMessage: '库存冲突',
        retryable: true,
        remark: '同步本地订单 orderNo=YY202606150001 到 yy_order id=9001',
      }),
    ]

    const text = buildOrderChannelDiagnosticText(order, logs)

    expect(text).toContain('[订单渠道排障]')
    expect(text).toContain('订单号：YY202606150001')
    expect(text).toContain('本地订单ID：9001')
    expect(text).toContain('渠道：DOUYIN_LIFE')
    expect(text).toContain('requestId/logid：202606151030ABCDEF')
    expect(text).toContain('状态：失败')
    expect(text).toContain('错误信息：库存冲突')
    expect(text).toContain('备注：同步本地订单 orderNo=YY202606150001 到 yy_order id=9001')
  })

  it('finds order operation logs for status transition and reschedule without matching generic log pages', () => {
    const order = makeOrder({ backendId: '9001', id: 'YY202606150001' })
    const logs = [
      makeOperationLog({
        backendId: 'op-transition',
        action: 'POST /yy/order/9001/transition',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 10:10:00',
      }),
      makeOperationLog({
        backendId: 'op-reschedule',
        action: 'POST /yy/order/9001/reschedule',
        url: '/yy/order/9001/reschedule',
        operator: '店员A',
        happenedAt: '2026-06-15 10:20:00',
      }),
      makeOperationLog({
        backendId: 'op-monitor',
        title: '操作日志',
        action: 'GET /monitor/operlog/list',
        url: '/monitor/operlog/list',
        operator: '系统',
        happenedAt: '2026-06-15 10:30:00',
      }),
      makeOperationLog({
        backendId: 'op-other',
        action: 'POST /yy/order/9002/transition',
        url: '/yy/order/9002/transition',
        happenedAt: '2026-06-15 10:40:00',
      }),
    ]

    expect(logs.map(log => isOrderOperationLog(order, log))).toEqual([true, true, false, false])
    expect(getOrderOperationLogs(order, logs).map(log => log.backendId)).toEqual([
      'op-reschedule',
      'op-transition',
    ])
  })

  it('adds matched backend operation logs into the order detail timeline safely', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已确认',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-transition',
        operator: '门店主管',
        action: 'POST /yy/order/9001/transition',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 09:20:00',
      }),
      makeOperationLog({
        backendId: 'op-reschedule',
        operator: '店员A',
        action: 'POST /yy/order/9001/reschedule',
        url: '/yy/order/9001/reschedule',
        happenedAt: '2026-06-15 10:05:00',
      }),
    ]

    const timeline = buildOrderDetailTimeline(order, null, [], operationLogs)

    expect(timeline.filter(item => item.key.startsWith('operation-'))).toEqual([
      {
        key: 'operation-op-reschedule',
        label: '订单操作',
        value: '改期 · 店员A',
        hint: '2026-06-15 10:05 · 门店/部门：影约云旗舰店 · 操作来源：后台用户 · POST /yy/order/9001/reschedule',
        statusLabel: '成功',
        tone: 'done',
      },
      {
        key: 'operation-op-transition',
        label: '订单操作',
        value: '状态流转 · 门店主管',
        hint: '2026-06-15 09:20 · 门店/部门：影约云旗舰店 · 操作来源：后台用户 · POST /yy/order/9001/transition',
        statusLabel: '成功',
        tone: 'done',
      },
    ])
  })

  it('shows order action reason, target state and operator context from backend operation logs', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已确认',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-cancel',
        title: '预约订单状态流转',
        operator: '店员A',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyOrderController.transition()',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 11:20:00',
        requestPayload: '{"expectedStatus":"CONFIRMED","targetStatus":"CANCELLED","remark":"客户主动取消"}',
      }),
      makeOperationLog({
        backendId: 'op-reschedule',
        title: '预约订单改期',
        operator: '门店主管',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyOrderController.reschedule()',
        url: '/yy/order/9001/reschedule',
        happenedAt: '2026-06-15 10:20:00',
        requestPayload: '{"slotDate":"2026-06-18","slotStartTime":"18:00","slotEndTime":"18:30","remark":"客户要求改期"}',
      }),
    ]

    const timeline = buildOrderDetailTimeline(order, null, [], operationLogs)

    expect(timeline.filter(item => item.key.startsWith('operation-'))).toEqual([
      {
        key: 'operation-op-cancel',
        label: '订单操作',
        value: '取消预约 · 店员A',
        hint: '2026-06-15 11:20 · 门店/部门：滨州万达店 · 操作来源：后台用户 · POST /yy/order/9001/transition · 目标状态：已取消 · 原因：客户主动取消',
        statusLabel: '成功',
        tone: 'done',
      },
      {
        key: 'operation-op-reschedule',
        label: '订单操作',
        value: '改期 · 门店主管',
        hint: '2026-06-15 10:20 · 门店/部门：滨州万达店 · 操作来源：后台用户 · POST /yy/order/9001/reschedule · 目标时段：2026-06-18 18:00-18:30 · 原因：客户要求改期',
        statusLabel: '成功',
        tone: 'done',
      },
    ])
  })

  it('builds compact operation evidence cards for the order detail summary', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已确认',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-cancel',
        title: '预约订单状态流转',
        operator: '店员A',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyOrderController.transition()',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 11:20:00',
        durationMs: 88,
        requestPayload: '{"expectedStatus":"CONFIRMED","targetStatus":"CANCELLED","remark":"客户主动取消"}',
      }),
      makeOperationLog({
        backendId: 'op-reschedule',
        title: '预约订单改期',
        operator: '门店主管',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyOrderController.reschedule()',
        url: '/yy/order/9001/reschedule',
        happenedAt: '2026-06-15 10:20:00',
        requestPayload: '{"slotDate":"2026-06-18","slotStartTime":"18:00","slotEndTime":"18:30","remark":"客户要求改期"}',
      }),
    ]

    expect(buildOrderOperationEvidenceCards(order, operationLogs)).toEqual([
      {
        key: 'operation-evidence-op-cancel',
        action: '取消预约',
        operator: '店员A',
        operatorContext: '操作人：店员A · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 11:20',
        primaryDetail: '目标状态：已取消',
        secondaryDetail: '原因：客户主动取消 · 耗时：88 ms',
        statusLabel: '成功',
        tone: 'done',
      },
      {
        key: 'operation-evidence-op-reschedule',
        action: '改期',
        operator: '门店主管',
        operatorContext: '操作人：门店主管 · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 10:20',
        primaryDetail: '目标时段：2026-06-18 18:00-18:30',
        secondaryDetail: '原因：客户要求改期 · 耗时：146 ms',
        statusLabel: '成功',
        tone: 'done',
      },
    ])
  })

  it('includes photo delivery backend logs in order operation evidence when order context is present', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已完成',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-photo-notify',
        title: '客片通知客户',
        operator: '客服A',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyPhotoAlbumController.notify()',
        url: '/yy/photoAlbum/71001/notify',
        happenedAt: '2026-06-15 12:00:00',
        durationMs: 120,
        requestPayload: '{"orderId":9001,"albumId":71001,"remark":"订单详情通知客户 71001"}',
      }),
      makeOperationLog({
        backendId: 'op-photo-confirm',
        title: '客片确认',
        operator: '修图主管',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyPhotoAlbumController.confirmSelection()',
        url: '/yy/photoAlbum/71001/selection/confirm',
        happenedAt: '2026-06-15 12:10:00',
        durationMs: 144,
        requestPayload: '{"orderId":9001,"albumId":71001,"remark":"订单详情确认客片 71001"}',
      }),
      makeOperationLog({
        backendId: 'op-photo-deliver',
        title: '客片资料发送',
        operator: '修图主管',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyPhotoAlbumController.deliver()',
        url: '/yy/photoAlbum/71001/deliver',
        happenedAt: '2026-06-15 12:20:00',
        durationMs: 188,
        requestPayload: '{"orderId":9001,"albumId":71001,"remark":"订单详情发送资料 71001"}',
      }),
    ]

    expect(buildOrderOperationEvidenceCards(order, operationLogs)).toEqual([
      {
        key: 'operation-evidence-op-photo-deliver',
        action: '资料发送',
        operator: '修图主管',
        operatorContext: '操作人：修图主管 · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 12:20',
        primaryDetail: '相册：71001',
        secondaryDetail: '原因：订单详情发送资料 71001 · 耗时：188 ms',
        statusLabel: '成功',
        tone: 'done',
      },
      {
        key: 'operation-evidence-op-photo-confirm',
        action: '客片确认',
        operator: '修图主管',
        operatorContext: '操作人：修图主管 · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 12:10',
        primaryDetail: '相册：71001',
        secondaryDetail: '原因：订单详情确认客片 71001 · 耗时：144 ms',
        statusLabel: '成功',
        tone: 'done',
      },
      {
        key: 'operation-evidence-op-photo-notify',
        action: '通知客户',
        operator: '客服A',
        operatorContext: '操作人：客服A · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 12:00',
        primaryDetail: '相册：71001',
        secondaryDetail: '原因：订单详情通知客户 71001 · 耗时：120 ms',
        statusLabel: '成功',
        tone: 'done',
      },
    ])
  })

  it('keeps failure reasons visible in operation evidence cards even when target status is present', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已确认',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-cancel-failed',
        title: '预约订单状态流转',
        operator: '店员A',
        deptName: '滨州万达店',
        action: 'org.dromara.yy.controller.YyOrderController.transition()',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 11:20:00',
        status: 'FAILED',
        errorMessage: '已支付抖音来客订单需要先完成平台退单',
        requestPayload: '{"expectedStatus":"CONFIRMED","targetStatus":"CANCELLED","remark":"客户主动取消"}',
      }),
    ]

    expect(buildOrderOperationEvidenceCards(order, operationLogs)).toEqual([
      {
        key: 'operation-evidence-op-cancel-failed',
        action: '取消预约',
        operator: '店员A',
        operatorContext: '操作人：店员A · 门店/部门：滨州万达店 · 操作来源：后台用户',
        happenedAt: '2026-06-15 11:20',
        primaryDetail: '目标状态：已取消',
        secondaryDetail: '原因：客户主动取消 · 失败：已支付抖音来客订单需要先完成平台退单',
        statusLabel: '失败',
        tone: 'danger',
      },
    ])
  })

  it('marks missing operation source explicitly for legacy backend logs', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      status: '已确认',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-legacy',
        operator: '老日志用户',
        deptName: '滨州万达店',
        operatorType: Number.NaN,
        action: 'POST /yy/order/9001/transition',
        url: '/yy/order/9001/transition',
        happenedAt: '2026-06-15 11:30:00',
      }),
    ]

    expect(buildOrderOperationEvidenceCards(order, operationLogs)).toEqual([
      expect.objectContaining({
        key: 'operation-evidence-op-legacy',
        operatorContext: '操作人：老日志用户 · 门店/部门：滨州万达店 · 操作来源：未记录',
      }),
    ])
    expect(buildOrderDetailTimeline(order, null, [], operationLogs)).toContainEqual(expect.objectContaining({
      key: 'operation-op-legacy',
      hint: '2026-06-15 11:30 · 门店/部门：滨州万达店 · 操作来源：未记录 · POST /yy/order/9001/transition',
    }))
  })

  it('summarizes photo delivery stage for the order detail drawer', () => {
    expect(buildOrderPhotoDeliveryStage(null)).toMatchObject({
      key: 'NO_ALBUM',
      label: '未建相册',
      primaryAction: '去客片管理',
    })

    expect(buildOrderPhotoDeliveryStage(makeAlbum({ totalCount: 0, selectedCount: 0 }))).toMatchObject({
      key: 'WAITING_UPLOAD',
      label: '待上传客片',
      primaryAction: '上传客片',
    })

    expect(buildOrderPhotoDeliveryStage(makeAlbum({ totalCount: 6, selectedCount: 0 }))).toMatchObject({
      key: 'READY_NOTIFY',
      label: '待通知选片',
      primaryAction: '通知客户',
    })

    expect(buildOrderPhotoDeliveryStage(makeAlbum({ totalCount: 6, selectedCount: 2, status: '选片中' }))).toMatchObject({
      key: 'READY_CONFIRM',
      label: '待确认选片',
      primaryAction: '客片确认',
    })

    expect(buildOrderPhotoDeliveryStage(makeAlbum({ totalCount: 6, selectedCount: 2, status: '已交付' }))).toMatchObject({
      key: 'DELIVERED',
      label: '已交付',
      primaryAction: '查看客片',
    })
  })

  it('builds channel-aware cancellation guidance for the detail drawer', () => {
    expect(buildOrderCancelGuidance(makeOrder({
      source: '抖音来客',
      payment: '已支付',
    }))).toMatchObject({
      tone: 'danger',
      title: '先在抖音来客处理退款',
      body: '工作台取消只会更新影约云订单状态；已支付抖音来客订单的退款/退单仍需在抖音来客或支付平台完成。',
    })

    expect(buildOrderCancelGuidance(makeOrder({
      source: '门店录入',
      payment: '待支付',
    }))).toMatchObject({
      tone: 'neutral',
      title: '本地取消',
      body: '该订单未记录支付，取消会写入影约云订单状态和取消原因，不涉及外部退款。',
    })
  })

  it('builds a safe source context for micro-form converted appointments', () => {
    const context = buildOrderSourceContext(makeOrder({
      source: '手工录入',
      method: '人工预约',
      channelType: 'LOCAL',
      remark: [
        '来源：微表单「证件照报名」提交 #7842',
        '来源码：poster-a',
        '回答：姓名: 张三；电话: 13800000000',
        '提交备注：客户想周末拍',
      ].join('\n'),
    }))

    expect(context).toEqual({
      title: '微表单转预约',
      badge: 'FORM',
      tone: 'pending',
      description: '来自微表单「证件照报名」提交 #7842，已转为本地预约；员工继续在工作台确认时段和服务。',
      details: [
        '来源码：poster-a',
        '预约方式：人工预约',
        '渠道：LOCAL',
      ],
    })
    expect(context.description).not.toContain('13800000000')
    expect(context.details.join('\n')).not.toContain('13800000000')
  })

  it('builds a source context for staff manual bookings', () => {
    expect(buildOrderSourceContext(makeOrder({
      source: '手工录入',
      method: '人工预约',
      channelType: 'LOCAL',
      remark: '门店电话预约，客户稍后到店',
    }))).toEqual({
      title: '员工手工预约',
      badge: 'MANUAL',
      tone: 'neutral',
      description: '员工在影约云工作台创建或维护的本地预约，只影响 yy_order 和 yy_booking_slot_inventory。',
      details: [
        '预约方式：人工预约',
        '渠道：LOCAL',
        '备注：门店电话预约，客户稍后到店',
      ],
    })
  })

  it('builds a source context for Douyin Life orders without pretending missing slots are scheduled', () => {
    expect(buildOrderSourceContext(makeOrder({
      source: '抖音来客',
      method: '渠道同步',
      channelType: 'DOUYIN_LIFE',
      externalProductId: '1867049893048363',
      externalSkuId: '1867049646914595',
      externalPoiId: '7647419894213445642',
      arrivalTime: '',
      arrivalDate: '',
      arrivalClock: '',
    }))).toEqual({
      title: '抖音来客同步订单',
      badge: 'DOUYIN',
      tone: 'warn',
      description: '订单来自抖音来客并已进入本地 yy_order；当前没有真实预约时段，不写入今日排期。',
      details: [
        '商品 1867049893048363',
        'SKU 1867049646914595',
        'POI 7647419894213445642',
        '预约方式：渠道同步',
        '渠道：DOUYIN_LIFE',
      ],
    })
  })

  it('builds a readable order detail timeline from order, album, and channel sync state', () => {
    const order = makeOrder({
      id: 'JY-12118454',
      backendId: '12118454',
      status: '待确认',
      payment: '已支付',
      source: '简约网',
      orderTime: '06-10 16:57',
      arrivalTime: '06-19 13:30',
    })
    const album = makeAlbum({
      orderBackendId: '12118454',
      totalCount: 6,
      selectedCount: 0,
      status: '待客户选片',
    })
    const logs = [
      makeChannelLog({
        backendId: 'sync-1',
        requestId: 'logid-001',
        status: 'SUCCESS',
        remark: '同步本地订单 orderNo=JY-12118454 到 yy_order id=12118454',
      }),
    ]

    expect(buildOrderDetailTimeline(order, album, logs)).toEqual([
      {
        key: 'source',
        label: '订单来源',
        value: '简约网',
        hint: '订单已进入影约云统一账本；按当前状态继续处理预约、交付和售后。',
        tone: 'neutral',
      },
      {
        key: 'created',
        label: '订单进入工作台',
        value: '06-10 16:57',
        tone: 'neutral',
      },
      {
        key: 'arrival',
        label: '预约到店时段',
        value: '06-19 13:30',
        tone: 'neutral',
      },
      {
        key: 'status',
        label: '当前处理节点',
        value: '待确认',
        hint: '电话/微信确认后点击',
        tone: 'pending',
      },
      {
        key: 'cancel',
        label: '取消/退款边界',
        value: '先确认退款',
        hint: '工作台取消只会更新影约云订单状态；已支付订单的退款/退单需在对应支付平台处理，工作台记录取消原因。',
        tone: 'warn',
      },
      {
        key: 'photo',
        label: '客片交付',
        value: '待通知选片',
        hint: '已有客片但客户还没有选片记录，优先通知客户进入选片。',
        tone: 'pending',
      },
      {
        key: 'channel-sync',
        label: '最近渠道同步',
        value: '成功 · goodlife/v1/trade/order/query',
        hint: 'logid-001',
        tone: 'done',
      },
    ])
  })

  it('adds a real refund summary to the order detail timeline when refund fields exist', () => {
    const order = makeOrder({
      id: 'DYL-REFUND-001',
      backendId: '9002',
      status: '已退单',
      payment: '已退款',
      source: '抖音来客',
      channelType: 'DOUYIN_LIFE',
      amount: 99,
      refundStatus: 'REFUNDED',
      refundAmountCent: 8800,
    })
    const logs = [
      makeChannelLog({
        backendId: 'refund-log',
        apiName: 'refund_notify',
        requestId: 'dy-refund-notify-log-001',
        status: 'SUCCESS',
        remark: '同步退款 orderNo=DYL-REFUND-001 到 yy_order id=9002',
      }),
    ]

    expect(buildOrderDetailTimeline(order, null, logs)).toContainEqual({
      key: 'refund',
      label: '退款/退单结果',
      value: '已退款 88.00',
      hint: '退款状态 REFUNDED；最近退款 logid：dy-refund-notify-log-001',
      tone: 'danger',
    })
  })

  it('does not render refund summary for unpaid local cancellations', () => {
    const order = makeOrder({
      id: 'YY-STAFF-CANCELLED',
      status: '已取消',
      payment: '待支付',
      source: '本地',
      channelType: 'LOCAL',
      refundStatus: '',
      refundAmountCent: 0,
    })

    expect(buildOrderDetailTimeline(order, null).some(item => item.key === 'refund')).toBe(false)
    expect(buildOrderDetailTimeline(order, null)).toContainEqual(expect.objectContaining({
      key: 'status',
      value: '已取消',
      hint: '订单已取消，库存已释放；如需重新安排请新建预约或从操作日志追溯原因',
    }))
  })

  it('labels copy order operations with schedule mode evidence', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
    })
    const operationLogs = [
      makeOperationLog({
        backendId: 'op-copy',
        title: '澶嶅埗棰勭害璁㈠崟',
        operator: '搴楀憳A',
        action: 'POST /yy/order/9001/copy',
        url: '/yy/order/9001/copy',
        happenedAt: '2026-06-15 13:00:00',
        requestPayload: '{"scheduleMode":"UNDECIDED","remark":"copy"}',
      }),
    ]

    expect(buildOrderOperationEvidenceCards(order, operationLogs)).toEqual([
      expect.objectContaining({
        key: 'operation-evidence-op-copy',
        action: '复制订单',
        primaryDetail: expect.stringContaining('待定档期'),
      }),
    ])
    expect(buildOrderDetailTimeline(order, null, [], operationLogs)).toContainEqual(expect.objectContaining({
      key: 'operation-op-copy',
      hint: expect.stringContaining('复制方式'),
    }))
  })
})
