import type { Album, BookingOrder } from '../../shared/stores/appStore'
import { isDouyinLifeOrder } from '../../shared/stores/orderIssueRules'

export type OrderPhotoDeliveryStageKey = 'NO_ALBUM' | 'WAITING_UPLOAD' | 'READY_NOTIFY' | 'READY_CONFIRM' | 'DELIVERED'

export type OrderPhotoDeliveryStage = {
  key: OrderPhotoDeliveryStageKey
  label: string
  hint: string
  primaryAction: string
}

export type OrderCancelGuidance = {
  tone: 'danger' | 'warn' | 'neutral'
  title: string
  body: string
}

export const buildOrderPhotoDeliveryStage = (album: Album | null | undefined): OrderPhotoDeliveryStage => {
  if (!album) {
    return {
      key: 'NO_ALBUM',
      label: '未建相册',
      hint: '该订单还没有客片相册，拍摄后先到客片管理上传底片。',
      primaryAction: '去客片管理',
    }
  }
  if (album.status === '已交付') {
    return {
      key: 'DELIVERED',
      label: '已交付',
      hint: '资料已完成最终交付，可用于售后查看和复购沟通。',
      primaryAction: '查看客片',
    }
  }
  if (album.totalCount <= 0) {
    return {
      key: 'WAITING_UPLOAD',
      label: '待上传客片',
      hint: '相册已建立但还没有可选照片，先上传底片或精修图。',
      primaryAction: '上传客片',
    }
  }
  if (album.selectedCount <= 0) {
    return {
      key: 'READY_NOTIFY',
      label: '待通知选片',
      hint: '已有客片但客户还没有选片记录，优先通知客户进入选片。',
      primaryAction: '通知客户',
    }
  }
  return {
    key: 'READY_CONFIRM',
    label: '待确认选片',
    hint: '客户已有选片记录，下一步确认精修、加片和最终交付。',
    primaryAction: '客片确认',
  }
}

export const buildOrderCancelGuidance = (order: BookingOrder): OrderCancelGuidance => {
  if (isDouyinLifeOrder(order) && order.payment === '已支付') {
    return {
      tone: 'danger',
      title: '先在抖音来客处理退款',
      body: '工作台取消只会更新影约云订单状态；已支付抖音来客订单的退款/退单仍需在抖音来客或支付平台完成。',
    }
  }

  if (order.payment === '已支付' || order.payment === '部分支付') {
    return {
      tone: 'warn',
      title: '先确认退款',
      body: '工作台取消只会更新影约云订单状态；已支付订单的退款/退单需在对应支付平台处理，工作台记录取消原因。',
    }
  }

  return {
    tone: 'neutral',
    title: '本地取消',
    body: '该订单未记录支付，取消会写入影约云订单状态和取消原因，不涉及外部退款。',
  }
}
