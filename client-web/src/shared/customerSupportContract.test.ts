import { describe, expect, it } from 'vitest'
import loginSource from '../views/CustomerLoginView.vue?raw'
import resultSource from '../views/CustomerResultView.vue?raw'
import albumsSource from '../views/CustomerAlbumsView.vue?raw'
import detailSource from '../views/CustomerAlbumDetailView.vue?raw'
import bookingGuideSource from '../views/BookingView.vue?raw'
import { CUSTOMER_SUPPORT } from './customerSupport'

describe('customer support contact contract', () => {
  it('keeps customer-facing support phone links centralized', () => {
    const combinedSource = [loginSource, resultSource, albumsSource, detailSource].join('\n')

    expect(combinedSource).not.toContain('tel:075588882026')
    expect(combinedSource).toContain('CUSTOMER_SUPPORT.telHref')
    expect(combinedSource).toContain('CUSTOMER_SUPPORT.phoneDisplay')
  })

  it('uses the same support contact on the miniapp booking guide', () => {
    expect(bookingGuideSource).not.toMatch(/0755[- ]8888[ -]?2026/)
    expect(bookingGuideSource).not.toContain('tel:075588882026')
    expect(bookingGuideSource).toContain('CUSTOMER_SUPPORT.telHref')
    expect(bookingGuideSource).toContain('CUSTOMER_SUPPORT.phoneDisplay')
  })

  it('keeps guide store name centralized', () => {
    expect(CUSTOMER_SUPPORT.storeName).toBeTruthy()
    expect(bookingGuideSource).not.toContain('深圳南山门店')
    expect(bookingGuideSource).toContain('CUSTOMER_SUPPORT.storeName')
  })
})
