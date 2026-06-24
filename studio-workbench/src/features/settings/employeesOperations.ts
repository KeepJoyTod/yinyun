import type { EmployeeInfo } from '../../shared/stores/appStore'

export type QuickEmployeeFilter = 'all' | 'active' | 'creative' | 'inactive'

export type EmployeeFormDraft = {
  storeBackendId: string
  employeeNo: string
  name: string
  mobile: string
  roleType: string
  skillTags: string
  status: string
  sort: number
  remark: string
}

export type EmployeeStoreOption = {
  backendId?: string | number | null
  name?: string
}

export const createEmployeeFormDraft = (): EmployeeFormDraft => ({
  storeBackendId: '',
  employeeNo: '',
  name: '',
  mobile: '',
  roleType: '',
  skillTags: '',
  status: 'ACTIVE',
  sort: 0,
  remark: '',
})

export const creativeRoles = ['摄影师', '修图师']

export const cardAccentColors = [
  'bg-[var(--color-status-confirmed)]',
  'bg-[var(--color-status-pending)]',
  'bg-[var(--color-status-shooting)]',
  'bg-[var(--color-status-done)]',
]

export const normalizeStoreFilter = (
  preferred: string,
  canUseGlobalStoreScope: boolean,
  concreteStoreOptions: EmployeeStoreOption[],
) => {
  if (canUseGlobalStoreScope && (!preferred || preferred === 'all')) return 'all'
  const matched = concreteStoreOptions.find(store => store.name === preferred || String(store.backendId) === preferred)
  return String(matched?.backendId ?? concreteStoreOptions[0]?.backendId ?? '')
}

export const defaultConcreteStoreId = (concreteStoreOptions: EmployeeStoreOption[], storeFilter: string) => {
  const matched = concreteStoreOptions.find(store => String(store.backendId) === storeFilter)
  return String(matched?.backendId ?? concreteStoreOptions[0]?.backendId ?? '')
}

export const resetEmployeeFormDraft = (form: EmployeeFormDraft, storeBackendId: string) => {
  form.storeBackendId = storeBackendId
  form.employeeNo = ''
  form.name = ''
  form.mobile = ''
  form.roleType = ''
  form.skillTags = ''
  form.status = 'ACTIVE'
  form.sort = 0
  form.remark = ''
}

export const fillEmployeeFormDraft = (form: EmployeeFormDraft, employee: EmployeeInfo) => {
  form.storeBackendId = employee.storeBackendId
  form.employeeNo = employee.employeeNo
  form.name = employee.name
  form.mobile = employee.mobile
  form.roleType = employee.roleType
  form.skillTags = employee.skillTags.join(',')
  form.status = employee.status
  form.sort = employee.sort
  form.remark = employee.remark
}

export const buildEmployeeSaveInput = (editingId: string | null, form: EmployeeFormDraft) => ({
  id: editingId ?? undefined,
  storeBackendId: form.storeBackendId,
  employeeNo: form.employeeNo,
  name: form.name,
  mobile: form.mobile,
  roleType: form.roleType,
  skillTags: form.skillTags,
  status: form.status,
  sort: form.sort,
  remark: form.remark,
})

export const formatEmployeeCreatedAt = (employee: EmployeeInfo) => {
  const value = (employee as EmployeeInfo & { createTime?: string; createdAt?: string }).createTime
    ?? (employee as EmployeeInfo & { createTime?: string; createdAt?: string }).createdAt
    ?? ''
  return value ? value.replace('T', ' ').slice(0, 10) : '未接入'
}

export const formatEmployeeSummary = (employee: EmployeeInfo) => [
  `姓名：${employee.name}`,
  `工号：${employee.employeeNo}`,
  `手机：${employee.mobile || '未填写'}`,
  `角色：${employee.roleType || '未设置'}`,
  `门店：${employee.storeName}`,
  `状态：${employee.status === 'ACTIVE' ? '在岗' : '停用'}`,
  `技能：${employee.skillTags.length ? employee.skillTags.join('、') : '未配置'}`,
  `登记日期：${formatEmployeeCreatedAt(employee)}`,
].join('\n')

export const employeeInitial = (employee: EmployeeInfo) => employee.name.trim().slice(0, 1) || '员'

export const averageSkillCount = (employees: EmployeeInfo[]) => {
  if (!employees.length) return '0.0'
  const total = employees.reduce((sum, employee) => sum + employee.skillTags.length, 0)
  return (total / employees.length).toFixed(1)
}

export const buildRoleDistribution = (employees: EmployeeInfo[]) => {
  const counts = new Map<string, number>()
  employees.forEach(employee => {
    const label = employee.roleType || '未设置'
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })
  const total = Math.max(employees.length, 1)
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, percent: Math.max(8, Math.round((count / total) * 100)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
}

export const buildTopSkillTags = (employees: EmployeeInfo[]) => {
  const counts = new Map<string, number>()
  employees.flatMap(employee => employee.skillTags).forEach(skill => {
    counts.set(skill, (counts.get(skill) ?? 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

export const filterEmployees = (
  employees: EmployeeInfo[],
  filters: {
    storeFilter: string
    roleFilter: string
    statusFilter: string
    activeEmployeeFilter: QuickEmployeeFilter
    searchQuery: string
  },
) => {
  const query = filters.searchQuery.trim().toLowerCase()
  return employees.filter(employee => {
    if (filters.storeFilter !== 'all' && String(employee.storeBackendId) !== filters.storeFilter) return false
    if (filters.roleFilter !== 'all' && employee.roleType !== filters.roleFilter) return false
    if (filters.statusFilter !== 'all' && employee.status !== filters.statusFilter) return false
    if (filters.activeEmployeeFilter === 'active' && employee.status !== 'ACTIVE') return false
    if (filters.activeEmployeeFilter === 'creative' && !creativeRoles.includes(employee.roleType)) return false
    if (filters.activeEmployeeFilter === 'inactive' && employee.status === 'ACTIVE') return false
    if (!query) return true
    const haystack = `${employee.employeeNo} ${employee.name} ${employee.mobile} ${employee.skillTags.join(' ')} ${employee.roleType}`.toLowerCase()
    return haystack.includes(query)
  })
}

export const buildQuickEmployeeFilters = (
  scopedEmployees: EmployeeInfo[],
  activeEmployees: EmployeeInfo[],
  creativeEmployees: EmployeeInfo[],
  inactiveEmployees: EmployeeInfo[],
) => [
  { key: 'all' as const, label: '全部员工', count: scopedEmployees.length },
  { key: 'active' as const, label: '在岗员工', count: activeEmployees.length },
  { key: 'creative' as const, label: '摄影 / 修图', count: creativeEmployees.length },
  { key: 'inactive' as const, label: '停用', count: inactiveEmployees.length },
]

export const buildEmployeeCards = (
  activeEmployees: EmployeeInfo[],
  skillCoverageCount: number,
  storeCoverageCount: number,
) => [
  {
    label: '在岗员工',
    value: String(activeEmployees.length),
    hint: '当前可直接承接预约、拍摄、修图或交付动作的员工。',
    scope: 'ACTIVE',
    icon: 'users',
  },
  {
    label: '今日可排班',
    value: String(activeEmployees.length),
    hint: '默认按在岗状态作为排班可用人数，后续可接真实班次。',
    scope: 'SHIFT',
    icon: 'calendar',
  },
  {
    label: '技能覆盖',
    value: String(skillCoverageCount),
    hint: '已登记的岗位技能标签数量，便于排班和环节匹配。',
    scope: 'SKILL',
    icon: 'sparkles',
  },
  {
    label: '门店覆盖',
    value: String(storeCoverageCount),
    hint: '当前已经配置员工资料的门店数量。',
    scope: '门店',
    icon: 'store',
  },
]

export const buildEmployeeDerivedState = (
  scopedEmployees: EmployeeInfo[],
  filters: {
    storeFilter: string
    roleFilter: string
    statusFilter: string
    activeEmployeeFilter: QuickEmployeeFilter
    searchQuery: string
  },
) => {
  const activeEmployees = scopedEmployees.filter(employee => employee.status === 'ACTIVE')
  const creativeEmployees = scopedEmployees.filter(employee => creativeRoles.includes(employee.roleType))
  const inactiveEmployees = scopedEmployees.filter(employee => employee.status !== 'ACTIVE')
  const skillCoverageCount = new Set(scopedEmployees.flatMap(employee => employee.skillTags)).size
  const storeCoverageCount = new Set(scopedEmployees.map(employee => employee.storeBackendId)).size

  return {
    activeEmployees,
    creativeEmployees,
    inactiveEmployees,
    skillCoverageCount,
    storeCoverageCount,
    averageSkillCount: averageSkillCount(scopedEmployees),
    roleDistribution: buildRoleDistribution(scopedEmployees),
    topSkillTags: buildTopSkillTags(scopedEmployees),
    filteredEmployees: filterEmployees(scopedEmployees, filters),
    quickEmployeeFilters: buildQuickEmployeeFilters(scopedEmployees, activeEmployees, creativeEmployees, inactiveEmployees),
    cards: buildEmployeeCards(activeEmployees, skillCoverageCount, storeCoverageCount),
  }
}
