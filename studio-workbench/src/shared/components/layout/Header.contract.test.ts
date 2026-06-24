import { describe, expect, it } from 'vitest'
import headerSource from './Header.vue?raw'

describe('studio header contract', () => {
  it('shows only today pending order count in the top action', () => {
    expect(headerSource).toContain('todayPendingOrderCount')
    expect(headerSource).toContain('arrivalDate === todayKey')
    expect(headerSource).toContain('今日待确认')
    expect(headerSource).not.toContain('const pendingOrderCount')
  })

  it('provides a compact mobile navigation trigger', () => {
    expect(headerSource).toContain("emit('toggle-menu')")
    expect(headerSource).toContain('aria-label="打开导航菜单"')
    expect(headerSource).toContain('max-[900px]:hidden')
    expect(headerSource).toContain('max-[560px]:hidden')
  })

  it('keeps the page title and order action readable in the top bar', () => {
    expect(headerSource).toContain('yy-glass-panel')
    expect(headerSource).toContain('font-sans text-[24px] font-black')
    expect(headerSource).toContain('max-w-[360px]')
    expect(headerSource).toContain('shrink-0 items-center gap-2 whitespace-nowrap')
    expect(headerSource).toContain('<span class="max-[560px]:hidden whitespace-nowrap">处理订单</span>')
  })

  it('keeps the top bar softer and more translucent for the premium workbench feel', () => {
    expect(headerSource).toContain('bg-amber-topbar-bg/56')
    expect(headerSource).toContain('backdrop-blur-[28px]')
    expect(headerSource).toContain('shadow-[0_12px_42px_rgba(26,24,20,0.06)]')
  })
})
