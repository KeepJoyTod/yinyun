import { computed } from 'vue'
import { format, addMonths, startOfMonth, endOfMonth, getDay, addDays, parseISO, isSameDay } from 'date-fns'

type CalendarCell = { date: Date; inMonth: boolean }

export function useOrderCalendar(
  calendarMonth: { value: Date },
  activeStartDate: { value: string },
  activeEndDate: { value: string },
  activeDropdown: { value: string | null },
) {
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

  const safeParseIso = (value: string) => {
    try { return parseISO(value) } catch { return null }
  }

  const normalizedRange = computed(() => {
    const s = safeParseIso(activeStartDate.value)
    const e = safeParseIso(activeEndDate.value)
    if (!s || !e) return null
    const sd = new Date(s.getFullYear(), s.getMonth(), s.getDate())
    const ed = new Date(e.getFullYear(), e.getMonth(), e.getDate())
    if (sd <= ed) return { start: sd, end: ed }
    return { start: ed, end: sd }
  })

  const isInRange = (d: Date) => {
    const r = normalizedRange.value
    if (!r) return false
    const cd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return cd >= r.start && cd <= r.end
  }

  const isBoundary = (d: Date) => {
    const r = normalizedRange.value
    if (!r) return false
    return isSameDay(d, r.start) || isSameDay(d, r.end)
  }

  const getCalendarCellClass = (cell: CalendarCell) => {
    const today = new Date()
    const base = cell.inMonth ? 'text-ink/80' : 'text-ink-muted/40'
    if (isInRange(cell.date)) {
      return isBoundary(cell.date)
        ? 'bg-accent text-white font-medium'
        : 'bg-accent/90 text-ink'
    }
    if (isSameDay(cell.date, today)) return `${base} ring-1 ring-amber-dark/20`
    return `${base} hover:bg-canvas/20`
  }

  const openCalendar = (target: 'startDate' | 'endDate') => {
    activeDropdown.value = target
    const base = target === 'startDate' ? activeStartDate.value : activeEndDate.value
    const parsed = safeParseIso(base)
    calendarMonth.value = startOfMonth(parsed ?? new Date())
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
    calendarTitle, calendarCells, normalizedRange,
    getCalendarCellClass, openCalendar, prevMonth, nextMonth, selectDate,
  }
}
