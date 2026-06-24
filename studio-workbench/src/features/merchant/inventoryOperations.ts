import type { BookingInventorySlot, ServiceGroupInfo } from '../../shared/stores/appStore'

export type InventorySelectOption = {
  value: string
  label: string
}

export type InventoryCard = {
  label: string
  value: string
  hint: string
  scope: string
}

export const getInventoryServiceGroupOptions = (
  groups: ServiceGroupInfo[],
  storeBackendId?: string,
): InventorySelectOption[] => {
  const scopedGroups = groups
    .filter(group => group.status === 'ACTIVE')
    .filter(group => !storeBackendId || storeBackendId === 'all' || group.storeBackendId === storeBackendId)
    .slice()
    .sort((left, right) => left.sort - right.sort || left.name.localeCompare(right.name, 'zh-CN'))

  return [
    { value: 'all', label: '全部服务组' },
    ...scopedGroups.map(group => ({ value: String(group.backendId), label: group.name })),
  ]
}

export const buildInventoryCards = (slots: BookingInventorySlot[]): InventoryCard[] => [
  {
    label: '时段总数',
    value: String(slots.length),
    hint: '当前筛选条件下的预约库存时段数量。',
    scope: 'SLOTS',
  },
  {
    label: '库存冲突',
    value: String(slots.filter(slot => slot.conflictCount > 0).length),
    hint: '需要人工介入改期或扩容的冲突时段。',
    scope: 'CONFLICT',
  },
  {
    label: '满载时段',
    value: String(slots.filter(slot => slot.confirmedCount >= slot.capacity && slot.capacity > 0).length),
    hint: '已确认数量达到或超过当前容量的时段。',
    scope: 'FULL',
  },
  {
    label: '总容量',
    value: String(slots.reduce((sum, slot) => sum + slot.capacity, 0)),
    hint: '当前筛选范围内所有时段的承接总容量。',
    scope: 'CAP',
  },
]
