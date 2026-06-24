import { describe, expect, it } from 'vitest'
import { CLIENT_WEB_ROUTES, resolveEntryTarget } from './entryContracts'

describe('client web entry contracts', () => {
  it('keeps customer website entries separate from staff workbench entries', () => {
    expect(CLIENT_WEB_ROUTES.customerLogin).toBe('/customer/login')
    expect(CLIENT_WEB_ROUTES.customerAlbums).toBe('/customer/albums')
    expect(CLIENT_WEB_ROUTES.customerAlbumDetail).toBe('/customer/albums/:albumId')
    expect(CLIENT_WEB_ROUTES.customerOrderDetail).toBe('/customer/orders/:orderNo')
    expect(CLIENT_WEB_ROUTES.customerResult).toBe('/customer/result')
    expect(CLIENT_WEB_ROUTES.miniappBookingGuide).toBe('/booking')
    expect(CLIENT_WEB_ROUTES.staffEntry).toBe('/staff')

    expect(resolveEntryTarget('miniapp-booking-guide')).toEqual({
      label: '小程序预约',
      path: '/booking',
      audience: 'CUSTOMER',
    })
    expect(resolveEntryTarget('customer-pickup')).toEqual({
      label: '客户取片',
      path: '/customer/login',
      audience: 'CUSTOMER',
    })
    expect(resolveEntryTarget('staff-workbench')).toMatchObject({
      label: '门店工作台',
      path: '/staff',
      audience: 'STAFF',
    })
  })
})
