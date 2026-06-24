import { describe, expect, it } from 'vitest'
import appSource from './App.vue?raw'

describe('studio app shell contract', () => {
  it('loads workbench data only after staff routes are active', () => {
    expect(appSource).toContain('isPublicRoute')
    expect(appSource).toContain('appStore.initialized')
    expect(appSource).toContain('appStore.bootstrap()')
    expect(appSource).toContain('正在连接影约云后端')
    expect(appSource).toContain('appStore.apiError')
  })

  it('turns the desktop sidebar into a dismissible mobile drawer', () => {
    expect(appSource).toContain('mobileSidebarOpen')
    expect(appSource).toContain('@toggle-menu="toggleMobileSidebar"')
    expect(appSource).toContain('aria-label="关闭导航菜单"')
    expect(appSource).toContain('left-sidebar')
    expect(appSource).toContain('max-[900px]:fixed')
    expect(appSource).toContain("'mobile-sidebar-open'")
    expect(appSource).toContain('transform: translateX(-100%)')
    expect(appSource).not.toContain("'max-[900px]:-translate-x-full': !mobileSidebarOpen")
  })
})
