import { describe, expect, it } from 'vitest'
import bookingGuideSource from '../views/BookingView.vue?raw'
import routerSource from '../router/index.ts?raw'
import entryContractsSource from './entryContracts.ts?raw'

describe('miniapp booking guide contracts', () => {
  it('keeps /booking as a miniapp guide instead of a web booking form', () => {
    expect(entryContractsSource).toContain("miniappBookingGuide: '/booking'")
    expect(routerSource).toContain('CLIENT_WEB_ROUTES.miniappBookingGuide')
    expect(routerSource).toContain("name: 'MiniappBookingGuide'")
    expect(routerSource).toContain("redirect: CLIENT_WEB_ROUTES.miniappBookingGuide")
  })

  it('explains that customer booking and payment happen in mini programs', () => {
    expect(bookingGuideSource).toContain('小程序预约')
    expect(bookingGuideSource).toContain('微信或抖音小程序')
    expect(bookingGuideSource).toContain('yy_order')
    expect(bookingGuideSource).toContain('一个订单账本')
    expect(bookingGuideSource).toContain('客户电脑网页只做引导和取片')
  })

  it('does not submit a public web booking intent', () => {
    expect(bookingGuideSource).not.toContain('clientBookingApi')
    expect(bookingGuideSource).not.toContain('/client/booking/intent')
    expect(bookingGuideSource).not.toContain('提交预约意向')
  })

  it('keeps pickup and store support recovery actions visible', () => {
    expect(bookingGuideSource).toContain('已拍摄客户取片')
    expect(bookingGuideSource).toContain('CUSTOMER_SUPPORT.telHref')
    expect(bookingGuideSource).toContain('CUSTOMER_SUPPORT.phoneDisplay')
  })
})
