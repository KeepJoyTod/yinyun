export type ScheduleFilterKey = 'all' | 'pending' | 'confirmed' | 'conflict'

export type ScheduleNavigationTarget =
  | 'orders'
  | 'inventory'
  | 'booking-entry'
  | 'share-links'
  | 'reports'

export type ScheduleOperationCardAction = {
  target: ScheduleNavigationTarget
  query?: Record<string, string | undefined>
}

export type ScheduleOperationCard = {
  label: string
  value: string
  hint: string
  action: string
  scope: string
  filter?: ScheduleFilterKey
  go: ScheduleOperationCardAction
}

export type ScheduleBookingSelection = {
  id?: string | number
  bookingId?: string | number
  orderNo?: string | number
  customer: string
  status: 'active' | 'pending'
}
