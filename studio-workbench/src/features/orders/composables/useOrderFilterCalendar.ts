import { computed, ref, type Ref, type WritableComputedRef } from 'vue'
import { addDays, addMonths, endOfMonth, format, getDay, isSameDay, parseISO, startOfMonth } from 'date-fns'
import type { CalendarCell } from './useOrderFilterTypes'

type UseOrderFilterCalendarParams = {
  today: Date
  activeDropdown: Ref<string | null>
  activeStartDate: WritableComputedRef<string>
  activeEndDate: WritableComputedRef<string>
}

export const useOrderFilterCalendar = ({
  today,
  activeDropdown,
  activeStartDate,
  activeEndDate,
}: UseOrderFilterCalendarParams) => {
  const calendarMonth = ref(startOfMonth(today))

  const safeParseIso = (value: string) => {
    try {
      return parseISO(value)
    } catch {
      return null
    }
  }

  const calendarTitle = computed(() => format(calendarMonth.value, 'yyyy年M月'))

  const calendarCells = computed(() => {
    const monthStart = startOfMonth(calendarMonth.value)
    const monthEnd = endOfMonth(calendarMonth.value)
    const prefix = getDay(monthStart)
    const gridStart = addDays(monthStart, -prefix)
    const cells: CalendarCell[] = []
    for (let i = 0; i < 42; i += 1) {
      const d = addDays(gridStart, i)
      cells.push({ date: d, inMonth: d >= monthStart && d <= monthEnd })
    }
    return cells
  })

  const normalizedRange = computed(() => {
    const s = safeParseIso(activeStartDate.value)
    const e = safeParseIso(activeEndDate.value)
    if (!s || !e) return null
    const sd = new Date(s.getFullYear(), s.getMonth(), s.getDate())
    const ed = new Date(e.getFullYear(), e.getMonth(), e.getDate())
    return sd <= ed ? { start: sd, end: ed } : { start: ed, end: sd }
  })

  const isInRange = (d: Date) => {
    const r = normalizedRange.value
    if (!r) return false
    const cd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return cd >= r.start && cd <= r.end
  }

  const isBoundary = (d: Date) => {
    const r = normalizedRange.value
    return Boolean(r && (isSameDay(d, r.start) || isSameDay(d, r.end)))
  }

  const getCalendarCellClass = (cell: CalendarCell) => {
    const base = cell.inMonth ? 'text-amber-dark/80' : 'text-amber-text-muted/40'
    if (isInRange(cell.date)) {
      return isBoundary(cell.date)
        ? 'bg-amber-dark text-[#F4EFE6] font-medium'
        : 'bg-amber-dark/90 text-[#F4EFE6]'
    }
    if (isSameDay(cell.date, today)) return `${base} ring-1 ring-amber-dark/20`
    return `${base} hover:bg-amber-bg/20`
  }

  const openCalendar = (target: 'startDate' | 'endDate') => {
    activeDropdown.value = target
    const base = target === 'startDate' ? activeStartDate.value : activeEndDate.value
    calendarMonth.value = startOfMonth(safeParseIso(base) ?? new Date())
  }

  const prevMonth = () => {
    calendarMonth.value = startOfMonth(addMonths(calendarMonth.value, -1))
  }

  const nextMonth = () => {
    calendarMonth.value = startOfMonth(addMonths(calendarMonth.value, 1))
  }

  const selectDate = (d: Date) => {
    const value = format(d, 'yyyy-MM-dd')
    if (activeDropdown.value === 'startDate') {
      activeStartDate.value = value
      if (activeEndDate.value && activeEndDate.value < activeStartDate.value) activeEndDate.value = value
    } else if (activeDropdown.value === 'endDate') {
      activeEndDate.value = value
      if (activeStartDate.value && activeEndDate.value < activeStartDate.value) activeStartDate.value = value
    }
    activeDropdown.value = null
  }

  return {
    calendarMonth,
    calendarCells,
    calendarTitle,
    getCalendarCellClass,
    openCalendar,
    prevMonth,
    nextMonth,
    selectDate,
  }
}
