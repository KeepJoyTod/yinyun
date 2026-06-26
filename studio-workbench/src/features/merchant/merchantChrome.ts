import overviewIcon from '../../assets/icons/overview.svg'
import storeIcon from '../../assets/icons/store.svg'
import configIcon from '../../assets/icons/config.svg'
import calendarIcon from '../../assets/icons/calendar-new.svg'
import ordersIcon from '../../assets/icons/orders.svg'
import photoIcon from '../../assets/icons/photo-mgmt.svg'
import selectionIcon from '../../assets/icons/online-selection.svg'

export type MerchantTab = {
  key: string
  label: string
  path: string
  icon: string
}

export type MerchantQuickAccessCard = {
  key: string
  label: string
  hint: string
  path: string
  icon: string
  accent?: boolean
}

export const merchantTabs: MerchantTab[] = [
  { key: 'overview', label: '模块总览', path: '/merchant/overview', icon: overviewIcon },
  { key: 'readiness', label: '闭环脚手架', path: '/merchant/readiness', icon: overviewIcon },
  { key: 'schedule-governance', label: '档期治理', path: '/merchant/schedule-governance', icon: calendarIcon },
  { key: 'channel-readiness', label: '渠道承接', path: '/merchant/channel-readiness', icon: selectionIcon },
  { key: 'governance', label: '商家治理', path: '/merchant/governance', icon: configIcon },
  { key: 'dependency-readiness', label: '依赖闭环', path: '/merchant/dependency-readiness', icon: ordersIcon },
  { key: 'consumer-ops-p1', label: '消费者运营 P1', path: '/merchant/consumer-ops-p1', icon: overviewIcon },
  { key: 'store', label: '门店管理', path: '/merchant/store', icon: storeIcon },
  { key: 'service-groups', label: '服务组管理', path: '/merchant/service-groups', icon: configIcon },
  { key: 'inventory', label: '时段库存', path: '/merchant/inventory', icon: calendarIcon },
]

export const merchantQuickAccessCards: MerchantQuickAccessCard[] = [
  {
    key: 'orders',
    label: '预约订单',
    hint: '今日履约',
    path: '/order/appointment',
    icon: ordersIcon,
    accent: true,
  },
  {
    key: 'schedule',
    label: '今日预约',
    hint: '时段排期',
    path: '/dashboard/today',
    icon: calendarIcon,
  },
  {
    key: 'photos',
    label: '客片管理',
    hint: '上传交付',
    path: '/service/photos',
    icon: photoIcon,
  },
  {
    key: 'selection',
    label: '在线选片',
    hint: '客户进度',
    path: '/service/selection',
    icon: selectionIcon,
  },
]
