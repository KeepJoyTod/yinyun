import { describe, expect, it } from 'vitest'
import albumsPageSource from '../views/CustomerAlbumsView.vue?raw'

describe('customer albums page contracts', () => {
  it('shows a delivery overview before the album list', () => {
    expect(albumsPageSource).toContain('customer-album-overview')
    expect(albumsPageSource).toContain('album-summary-grid')
    expect(albumsPageSource).toContain('totalAlbumCount')
    expect(albumsPageSource).toContain('totalPhotoCount')
    expect(albumsPageSource).toContain('expiringAlbumCount')
  })

  it('keeps privacy guidance and readable status labels on album cards', () => {
    expect(albumsPageSource).toContain('album-security-note')
    expect(albumsPageSource).toContain('album-card__status')
    expect(albumsPageSource).toContain('album-card__progress')
    expect(albumsPageSource).toContain('albumStatusLabel')
    expect(albumsPageSource).toContain('albumChannelLabel')
    expect(albumsPageSource).toContain('albumNextAction')
  })

  it('shows delivery steps and store support before customers enter an album', () => {
    expect(albumsPageSource).toContain('album-service-panel')
    expect(albumsPageSource).toContain('album-service-steps')
    expect(albumsPageSource).toContain('album-support-card')
    expect(albumsPageSource).toContain('交付提醒')
    expect(albumsPageSource).toContain('联系门店')
  })

  it('gives customers clear recovery actions when no album is available', () => {
    expect(albumsPageSource).toContain('album-empty-actions')
    expect(albumsPageSource).toContain('换手机号登录')
    expect(albumsPageSource).toContain('小程序预约')
    expect(albumsPageSource).toContain('拨打门店电话')
  })
})
