import { describe, expect, it } from 'vitest'
import homePageSource from '../views/HomeView.vue?raw'

describe('client web home page contracts', () => {
  it('shows customer-facing service proof on the first page', () => {
    expect(homePageSource).toContain('home-proof-strip')
    expect(homePageSource).toContain('home-proof-item')
    expect(homePageSource).toContain('小程序预约')
    expect(homePageSource).toContain('私密取片')
    expect(homePageSource).toContain('门店确认')
  })

  it('explains the booking to delivery journey before staff/system entries', () => {
    expect(homePageSource).toContain('home-journey')
    expect(homePageSource).toContain('home-journey-step')
    expect(homePageSource).toContain('小程序预约')
    expect(homePageSource).toContain('到店拍摄')
    expect(homePageSource).toContain('相册交付')
  })

  it('keeps public customer actions separate from staff and system actions', () => {
    expect(homePageSource).toContain('entry-card--customer')
    expect(homePageSource).toContain('entry-card--staff')
    expect(homePageSource).toContain('entry-card--system')
    expect(homePageSource).toContain('home-privacy-note')
  })

  it('shows customer package choices and delivery proof before entry routing', () => {
    expect(homePageSource).toContain('home-service-menu')
    expect(homePageSource).toContain('证件照精修')
    expect(homePageSource).toContain('形象照拍摄')
    expect(homePageSource).toContain('家庭纪念照')
    expect(homePageSource).toContain('home-delivery-showcase')
    expect(homePageSource).toContain('样片交付')
    expect(homePageSource).toContain('照片私有存储')
  })
})
