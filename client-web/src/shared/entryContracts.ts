export const CLIENT_WEB_ROUTES = {
  home: '/',
  miniappBookingGuide: '/booking',
  customerLogin: '/customer/login',
  customerAlbums: '/customer/albums',
  customerAlbumDetail: '/customer/albums/:albumId',
  customerOrderDetail: '/customer/orders/:orderNo',
  customerResult: '/customer/result',
  pickup: '/pickup',
  staffEntry: '/staff',
} as const

export type EntryAudience = 'CUSTOMER' | 'STAFF'
export type EntryKey = 'miniapp-booking-guide' | 'customer-pickup' | 'staff-workbench'

export type EntryTarget = {
  label: string
  path: string
  audience: EntryAudience
}

const targets: Record<EntryKey, EntryTarget> = {
  'miniapp-booking-guide': {
    label: '小程序预约',
    path: CLIENT_WEB_ROUTES.miniappBookingGuide,
    audience: 'CUSTOMER',
  },
  'customer-pickup': {
    label: '客户取片',
    path: CLIENT_WEB_ROUTES.customerLogin,
    audience: 'CUSTOMER',
  },
  'staff-workbench': {
    label: '门店工作台',
    path: CLIENT_WEB_ROUTES.staffEntry,
    audience: 'STAFF',
  },
}

export const resolveEntryTarget = (key: EntryKey) => targets[key]
