import { describe, expect, it } from 'vitest'
import rolesSource from './RolesView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'
import { computeMissingPermissions, formatMissingPermissionsText, roleTemplates } from './rolesOperations'

describe('roles and permissions page contract', () => {
  it('replaces the roles placeholder with a real route', () => {
    expect(routerSource).toContain('RolesView.vue')
    expect(getWorkbenchFeature('settings-roles')?.component).toBe('roles')
    expect(getWorkbenchFeature('settings-roles')?.status).toBe('partial')
    expect(getWorkbenchFeature('settings-roles')?.permission).toBe('yy:dashboard:list')
  })

  it('documents store workbench role templates instead of cloning system role CRUD', () => {
    const names = roleTemplates.map(r => r.name)
    expect(names).toContain('系统管理员')
    expect(names).toContain('门店主管')
    expect(names).toContain('前台店员')
    expect(names).toContain('摄影师')
    expect(names).toContain('修图师')
    expect(rolesSource).toContain('RuoYi')
  })

  it('uses bootstrap permissions and the feature registry as the permission matrix source', () => {
    expect(rolesSource).toContain('studioAccessStore.menuPermissions')
    expect(rolesSource).toContain('workbenchFeatures')
    expect(rolesSource).toContain('getWorkbenchGroupLabel')
    expect(rolesSource).toContain('复制缺失权限')
  })
})

describe('rolesOperations helper', () => {
  it('returns empty array for wildcard holder', () => {
    const result = computeMissingPermissions(['*:*:*'], true)
    expect(result).toEqual([])
  })

  it('returns empty when all permissions satisfied', () => {
    const allPerms = ['yy:dashboard:list', 'yy:order:list', 'yy:order:add', 'yy:bookingInventory:list', 'yy:photoAlbum:list', 'yy:photoAccessLog:list', 'yy:photoAsset:list', 'yy:employee:list', 'yy:channel:list', 'yy:store:list', 'yy:bookingConfig:list', 'yy:product:list', 'yy:customer:list', 'yy:notification:list', 'yy:workOrder:list']
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
    expect(text).toContain('当前账号')
    expect(text).toContain('yy:test:list')
    expect(text).toContain('/test')
  })

  it('formats complete status when no missing permissions', () => {
    const text = formatMissingPermissionsText([], '李四', '所属门店')
    expect(text).toContain('完整')
  })
})
