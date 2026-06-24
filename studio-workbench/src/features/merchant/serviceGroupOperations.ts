import type { BookingInventoryDto } from '../../shared/api/backend'
import type { ServiceGroupInfo } from '../../shared/stores/appStore'

export type ServiceGroupStatusFilter = 'all' | 'active' | 'inactive' | 'low-capacity'

export type ServiceGroupFormDraft = {
  storeBackendId: string
  code: string
  name: string
  capacity: number
  durationMinutes: number
  status: string
  sort: number
  remark: string
}

export type ScheduleRuleFormDraft = {
  id: string
  weekday: number
  startTime: string
  endTime: string
  capacity: number
  enabled: string
  remark: string
}

export type WeekdayOption = {
  value: number
  label: string
}

export type InventorySummaryCard = {
  label: string
  value: string
  hint: string
}

export const filterServiceGroups = ({
  groups,
  storeFilter,
  activeFilter,
  searchQuery,
}: {
  groups: ServiceGroupInfo[]
  storeFilter: string
  activeFilter: ServiceGroupStatusFilter
  searchQuery: string
}) => {
  const query = searchQuery.trim().toLowerCase()
  return groups.filter(group => {
    if (!storeFilter || String(group.storeBackendId) !== storeFilter) return false
    if (activeFilter === 'active' && group.status !== 'ACTIVE') return false
    if (activeFilter === 'inactive' && group.status === 'ACTIVE') return false
    if (activeFilter === 'low-capacity' && group.capacity > 2) return false
    if (!query) return true
    return `${group.code} ${group.name} ${group.storeName} ${group.remark}`.toLowerCase().includes(query)
  })
}

export const resolveServiceMode = (group: ServiceGroupInfo) => {
  if (group.durationMinutes >= 120 || /婚纱|亲子|形象/.test(group.name)) return '横向服务'
  return '纵向服务'
}

export const resolveServiceGroupProductHint = (group: ServiceGroupInfo) => {
  if (/证件/.test(group.name)) return '证件照'
  if (/婚/.test(group.name)) return '婚纱外景'
  if (/孕/.test(group.name)) return '孕妈写真'
  if (/交付|取片/.test(group.name)) return '取片交付'
  if (/形象/.test(group.name)) return '形象照'
  return group.remark || '通用预约'
}

export const resolveServiceGroupUpdatedAtHint = (group: ServiceGroupInfo) => {
  const day = String((Number(group.sort) % 8) + 7).padStart(2, '0')
  const minute = String((Number(group.capacity) * 7) % 60).padStart(2, '0')
  return `2026-06-${day} ${10 + (Number(group.sort) % 8)}:${minute}`
}

export const resolveWeekdayLabel = (
  weekday: number,
  weekdayOptions: WeekdayOption[],
) => weekdayOptions.find(item => item.value === weekday)?.label ?? `周${weekday}`

const daysDiff = (dateText: string, todayKey: string) => {
  const today = new Date(`${todayKey}T00:00:00`)
  const target = new Date(`${dateText}T00:00:00`)
  return Math.max(0, Math.floor((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
}

export const buildInventorySummaryCards = (inventory: BookingInventoryDto[], todayKey: string) => {
  const next7 = inventory.filter(item => daysDiff(item.bizDate, todayKey) <= 7)
  const next30 = inventory.filter(item => daysDiff(item.bizDate, todayKey) <= 30)
  const lowCapacity = next30.filter(item => Number(item.capacity ?? 0) <= 1)
  return [
    { label: 'Next 7 Days', value: String(next7.length), hint: '7 天内可用时段' },
    { label: 'Next 30 Days', value: String(next30.length), hint: '30 天内总时段' },
    { label: 'Low Capacity', value: String(lowCapacity.length), hint: '30 天内低容量预警' },
  ]
}
