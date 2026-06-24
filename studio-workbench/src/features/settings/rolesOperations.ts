import { getWorkbenchGroupLabel, workbenchFeatures } from '../../app/router/featureRegistry'

export type MissingPermission = {
  key: string
  label: string
  path: string
  permission: string
  group: string
  groupLabel: string
}

export type RoleTemplate = {
  key: string
  name: string
  scope: string
  desc: string
  permissions: string[]
}

export const roleTemplates: RoleTemplate[] = [
  {
    key: 'system-admin',
    name: '系统管理员',
    scope: '全量',
    desc: '查看全部门店、全部订单、系统后台和平台配置，负责员工角色、渠道配置和上线验收。',
    permissions: ['*:*:*'],
  },
  {
    key: 'store-manager',
    name: '门店主管',
    scope: '所属门店',
    desc: '处理本门店订单、日程、客片、选片、员工和渠道日志，适合店长或运营负责人。',
    permissions: ['yy:dashboard:list', 'yy:order:list', 'yy:bookingInventory:list', 'yy:photoAlbum:list', 'yy:photoAccessLog:list', 'yy:employee:list', 'yy:channel:list'],
  },
  {
    key: 'front-desk',
    name: '前台店员',
    scope: '所属门店',
    desc: '查看和处理预约订单、日程、客户取片入口、通知模板，不能修改系统级渠道配置。',
    permissions: ['yy:dashboard:list', 'yy:order:list', 'yy:bookingInventory:list', 'yy:store:list', 'yy:notification:list'],
  },
  {
    key: 'photographer',
    name: '摄影师',
    scope: '所属门店',
    desc: '查看今日预约、拍摄状态和客片上传，不负责财务、渠道和员工配置。',
    permissions: ['yy:dashboard:list', 'yy:order:list', 'yy:photoAlbum:list', 'yy:photoAccessLog:list', 'yy:store:list'],
  },
  {
    key: 'retoucher',
    name: '修图师',
    scope: '所属门店',
    desc: '查看客片、在线选片、修图交付相关订单，后续接工单环节和修图量统计。',
    permissions: ['yy:dashboard:list', 'yy:order:list', 'yy:photoAlbum:list', 'yy:photoAccessLog:list'],
  },
]

export const computeMissingPermissions = (
  menuPermissions: string[],
  hasWildcard: boolean,
): MissingPermission[] => {
  if (hasWildcard) return []
  return workbenchFeatures
    .filter(feature => feature.permission && !menuPermissions.includes(feature.permission))
    .reduce<MissingPermission[]>((acc, feature) => {
      if (acc.some(m => m.permission === feature.permission)) return acc
      acc.push({
        key: feature.key,
        label: feature.label,
        path: feature.path,
        permission: feature.permission!,
        group: feature.group,
        groupLabel: getWorkbenchGroupLabel(feature.group),
      })
      return acc
    }, [])
}

export const formatMissingPermissionsText = (
  missingPermissions: MissingPermission[],
  identityName: string,
  storeScope: string,
): string => {
  if (!missingPermissions.length) {
    return '当前账号工作台权限完整。'
  }

  const lines = [
    '【影约云工作台缺失权限】',
    `当前账号：${identityName}`,
    `门店范围：${storeScope}`,
    `缺失数量：${missingPermissions.length}`,
    '',
  ]

  missingPermissions.forEach((perm, i) => {
    lines.push(`${i + 1}. 菜单名称：${perm.label}`)
    lines.push(`   路由：${perm.path}`)
    lines.push(`   权限码：${perm.permission}`)
    lines.push(`   模块：${perm.groupLabel}`)
    lines.push('')
  })

  lines.push('请在 RuoYi 系统后台 -> 系统管理 -> 角色管理 -> 菜单权限 中补齐以上权限。')

  return lines.join('\n')
}
