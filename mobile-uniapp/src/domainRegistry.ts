export type MobileDomainStatus = 'ready' | 'scaffold'

export type MobileDomainModule = {
  key: 'home' | 'booking' | 'orders' | 'albums' | 'member' | 'coupons' | 'profile'
  label: string
  entryPage: string
  owner: string
  status: MobileDomainStatus
}

export const mobileDomainModules: MobileDomainModule[] = [
  { key: 'home', label: '品牌首页', entryPage: 'pages/home/index', owner: 'src/pages/home', status: 'ready' },
  { key: 'booking', label: '预约下单', entryPage: 'pages/store/list/index', owner: 'src/pages/store', status: 'ready' },
  { key: 'orders', label: '我的订单', entryPage: 'pages/customer/orders/index', owner: 'src/pages/customer/orders', status: 'ready' },
  { key: 'albums', label: '底片相册', entryPage: 'pages/pickup/albums/index', owner: 'src/pages/pickup', status: 'ready' },
  { key: 'member', label: '会员中心', entryPage: 'pages/my/index', owner: 'src/pages/my', status: 'ready' },
  { key: 'coupons', label: '卡券权益', entryPage: 'pages/coupons/index', owner: 'src/pages/coupons', status: 'scaffold' },
  { key: 'profile', label: '个人资料', entryPage: 'pages/profile/index', owner: 'src/pages/profile', status: 'scaffold' },
]
