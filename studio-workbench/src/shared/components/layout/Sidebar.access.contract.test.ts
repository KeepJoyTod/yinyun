import { describe, expect, it } from 'vitest'
import sidebarSource from './Sidebar.vue?raw'
import sidebarItemSource from './SidebarItem.vue?raw'

describe('studio sidebar access contract', () => {
  it('filters navigation with server permissions and feature status', () => {
    expect(sidebarSource).toContain('studioAccessStore')
    expect(sidebarSource).toContain('canAccessWorkbenchFeature')
    expect(sidebarSource).toContain('getEffectiveFeatureStatus')
    expect(sidebarSource).toContain("status !== 'hidden'")
  })

  it('shows server pending counts and employee scope', () => {
    expect(sidebarSource).toContain('getFeaturePendingCount')
    expect(sidebarSource).toContain(':pending-count')
    expect(sidebarSource).toContain('identity?.employeeName')
    expect(sidebarSource).toContain('identity?.username')
    expect(sidebarSource).toContain('stores[0]?.storeName')
    expect(sidebarItemSource).toContain('pendingCount')
    expect(sidebarItemSource).toContain('99+')
  })

  it('normalizes internal role codes and placeholder account copy for live workbench accounts', () => {
    expect(sidebarSource).toContain('roleTypeLabelMap')
    expect(sidebarSource).toContain("STORE_MANAGER: '门店管理员'")
    expect(sidebarSource).toContain("normalized.includes('演示账号')")
  })

  it('keeps top-level navigation groups readable with icons and counts', () => {
    expect(sidebarSource).toContain('groupIconMap')
    expect(sidebarSource).toContain('getGroupIcon(group.key)')
    expect(sidebarSource).toContain('text-[14.5px] font-semibold')
    expect(sidebarSource).toContain('group.features.length')
    expect(sidebarSource).toContain('ChevronDown')
  })

  it('uses a premium translucent brand anchor instead of a flat logo block', () => {
    expect(sidebarSource).toContain('yy-sidebar-brand-card')
    expect(sidebarSource).toContain('yy-sidebar-logo-orb')
    expect(sidebarSource).toContain('yy-sidebar-brand-aura')
    expect(sidebarSource).toContain('yy-brand-gradient')
    expect(sidebarSource).toContain('backdrop-blur-xl')
  })

  it('keeps the sidebar header compact without decorative online status copy', () => {
    expect(sidebarSource).toContain('px-4 py-3')
    expect(sidebarSource).toContain('mt-3 flex h-8')
    expect(sidebarSource).not.toContain('门店运营在线')
    expect(sidebarSource).not.toContain('Private OSS')
    expect(sidebarSource).not.toContain('Live')
  })

  it('clears server authorization on logout', () => {
    expect(sidebarSource).toContain('studioAccessStore.reset()')
  })
})
