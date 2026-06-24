export type JianyueSlotGroupKey = 'morning' | 'afternoon' | 'evening'

export type JianyueSlotServiceGroupBreakdown = {
  serviceGroupBackendId: string
  serviceGroupName: string
  capacity: number
  confirmedCount: number
  remainingCount: number
  conflictCount: number
  capacityLabel: string
  isFull: boolean
}

export type JianyueSlotCard = {
  id: string
  time: string
  endTime: string
  label: string
  orderCount: number
  confirmedCount: number
  capacity: number
  remainingCount: number
  capacityLabel: string
  conflictCount: number
  hasInventory: boolean
  isFull: boolean
  orderNos: string[]
  storeBackendIds: string[]
  serviceGroupBackendIds: string[]
  storeNames: string[]
  serviceGroupNames: string[]
  serviceGroupBreakdown: JianyueSlotServiceGroupBreakdown[]
}

export type JianyueSlotGroup = {
  key: JianyueSlotGroupKey
  label: string
  slots: JianyueSlotCard[]
  orderCount: number
  confirmedCount: number
  capacity: number
  fullCount: number
}
