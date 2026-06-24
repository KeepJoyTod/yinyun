import { describe, expect, it } from 'vitest'
import rolesSource from './RolesView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import { computeMissingPermissions, formatMissingPermissionsText, roleTemplates } from './rolesOperations'

describe('roles and permissions page contract', () => {
  it('replaces the roles placeholder with a real route', () => {
    expect(routerSource).toContain('RolesView.vue')
    expect(getWorkbenchFeature('settings-roles')?.component).toBe('roles')
    expect(getWorkbenchFeature('settings-roles')?.status).toBe('ready')
    expect(getWorkbenchFeature('settings-roles')?.permission).toBe('yy:dashboard:list')
  })

  it('documents store workbench role templates instead of cloning system role CRUD', () => {
    const names = roleTemplates.map(r => r.name)
    expect(names).toContain('系统管理员')
    expect(names).toContain('门店主管')
    expect(names).toContain('前台店员')
    expect(names).toContain('摄影师')
    expect(names).toContain('修图师')
    expect(rolesSource).toContain('系统级角色仍在 RuoYi 后台维护')
  })

  it('uses bootstrap permissions and the feature registry as the permission matrix source', () => {
    expect(rolesSource).toContain('studioAccessStore.menuPermissions')
    expect(rolesSource).toContain('workbenchFeatures')
    expect(rolesSource).toContain('getWorkbenchGroupLabel')
    expect(rolesSource).toContain('复制缺失权限')
  })

  it('keeps employee workbench data scope boundaries explicit', () => {
    expect(rolesSource).toContain('可查看全部门店')
    expect(roleTemplates.some(r => r.scope === '所属门店')).toBe(true)
    expect(rolesSource).toContain('避免员工误改全局权限')
  })

  it('shows missing permissions table when permissions are missing', () => {
    expect(rolesSource).toContain('Missing Permissions')
    expect(rolesSource).toContain('缺失权限')
    expect(rolesSource).toContain('菜单名称')
    expect(rolesSource).toContain('权限码')
  })

  it('shows complete status when no permissions are missing', () => {
    expect(rolesSource).toContain('当前账号工作台权限完整')
  })

  it('imports rolesOperations helper', () => {
    expect(rolesSource).toContain("from './rolesOperations'")
  })
})

describe('rolesOperations helper', () => {
  it('returns empty array for wildcard holder', () => {
    const result = computeMissingPermissions(['*:*:*'], true)
    expect(result).toEqual([])
  })

  it('returns empty when all permissions satisfied', () => {
    const allPerms = ['yy:dashboard:list', 'yy:order:list', 'yy:order:add', 'yy:bookingInventory:list', 'yy:photoAlbum:list', 'yy:photoAccessLog:list', 'yy:employee:list', 'yy:channel:list', 'yy:store:list', 'yy:bookingConfig:list', 'yy:product:list', 'yy:customer:list', 'yy:notification:list']
    const result = computeMissingPermissions(allPerms, false)
    expect(result).toEqual([])
  })

  it('includes photo access log permission in photo delivery roles', () => {
    const photoRoles = roleTemplates.filter(role => role.permissions.includes('yy:photoAlbum:list'))
    expect(photoRoles.map(role => role.key)).toEqual(expect.arrayContaining(['store-manager', 'photographer', 'retoucher']))
    for (const role of photoRoles) {
      expect(role.permissions).toContain('yy:photoAccessLog:list')
    }
  })

  it('returns missing permissions with full details', () => {
    const result = computeMissingPermissions(['yy:dashboard:list'], false)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('label')
    expect(result[0]).toHaveProperty('path')
    expect(result[0]).toHaveProperty('permission')
    expect(result[0]).toHaveProperty('groupLabel')
  })

  it('deduplicates by permission code', () => {
    const result = computeMissingPermissions([], false)
    const permCodes = result.map(m => m.permission)
    const unique = [...new Set(permCodes)]
    expect(permCodes.length).toBe(unique.length)
  })

  it('formats copy text with required sections', () => {
    const text = formatMissingPermissionsText(
      [{ key: 'test', label: '测试', path: '/test', permission: 'yy:test:list', group: 'test', groupLabel: '测试组' }],
      '张三',
      '可查看全部门店',
    )
    expect(text).toContain('【影约云工作台缺失权限】')
    expect(text).toContain('当前账号：张三')
    expect(text).toContain('门店范围：可查看全部门店')
    expect(text).toContain('缺失数量：1')
    expect(text).toContain('菜单名称：测试')
    expect(text).toContain('路由：/test')
    expect(text).toContain('权限码：yy:test:list')
    expect(text).toContain('模块：测试组')
    expect(text).toContain('请在 RuoYi 系统后台')
  })

  it('formats complete status when no missing permissions', () => {
    const text = formatMissingPermissionsText([], '李四', '所属门店')
    expect(text).toContain('当前账号工作台权限完整')
  })

  it('roleTemplates contains required roles', () => {
    const keys = roleTemplates.map(r => r.key)
    expect(keys).toContain('system-admin')
    expect(keys).toContain('store-manager')
    expect(keys).toContain('front-desk')
    expect(keys).toContain('photographer')
    expect(keys).toContain('retoucher')
  })

  it('uses the shared notice banner for feedback', () => {
    expect(rolesSource).toContain('NoticeBanner')
  })

  it('renders roles as a store permission health console', () => {
    expect(rolesSource).toContain('roles-hero')
    expect(rolesSource).toContain('权限体检控制台')
    expect(rolesSource).toContain('权限健康度')
    expect(rolesSource).toContain('roleHealthCards')
    expect(rolesSource).toContain('yy-glass-panel')
    expect(rolesSource).toContain('yy-console-hero')
    expect(rolesSource).toContain('yy-console-card')
    expect(rolesSource).toContain('yy-console-table')
    expect(rolesSource).toContain('rounded-[24px]')
  })
})
