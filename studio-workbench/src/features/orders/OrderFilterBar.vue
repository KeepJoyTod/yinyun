<template>
  <div class="border-b border-amber-topbar-border bg-white/78 px-7 py-[17.5px] flex flex-col gap-[10.5px] backdrop-blur">
    <div class="flex flex-wrap items-end gap-[13px]">
      <div class="relative flex w-[196px] flex-col gap-1 max-[640px]:w-full">
        <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">关键字</span>
        <input
          :value="effectiveSearchQuery"
          type="text"
          autocomplete="off"
          placeholder="姓名 / 手机号 / 订单号"
          class="w-full pl-[10.5px] pr-8 py-1.5 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-sans placeholder:text-amber-dark/50 focus:outline-none focus:border-amber-dark/30 h-[31.75px]"
          @pointerdown="$emit('armSearchQueryInput')"
          @keydown="$emit('armSearchQueryInput')"
          @paste="$emit('armSearchQueryInput')"
          @input="$emit('searchInput', $event)"
        />
      </div>

      <div v-for="(filter, index) in dropdownFilters" :key="index" class="relative group flex flex-col gap-1" data-dropdown-root>
        <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ getDropdownCaption(filter.label) }}</span>
        <button
          class="yy-action flex items-center justify-between gap-2 px-3 py-[7px] bg-white/78 border border-amber-topbar-border rounded-md text-[11.375px] text-amber-text-muted hover:bg-white transition-colors"
          :class="{ 'border-amber-dark/30 bg-white': activeDropdown === filter.label }"
          :style="{ width: filter.width + 'px' }"
          type="button"
          @click="$emit('setActiveDropdown', activeDropdown === filter.label ? null : filter.label)"
        >
          <span class="truncate">{{ filter.value }}</span>
          <img src="../../assets/icons/dropdown-arrow.svg" class="w-[12.25px] h-[12.25px] opacity-40 transition-transform" :class="{ 'rotate-180': activeDropdown === filter.label }" />
        </button>

        <div v-if="activeDropdown === filter.label" class="absolute top-full left-0 mt-1 bg-white border border-amber-topbar-border rounded-md shadow-lg z-10 min-w-[120px] py-1">
          <div
            v-for="option in filter.options"
            :key="option"
            class="px-3 py-1.5 text-[11px] hover:bg-amber-bg/20 cursor-pointer text-amber-dark/80"
            @click="$emit('selectDropdown', filter.label, option)"
          >
            {{ option }}
          </div>
        </div>
      </div>

      <div class="relative group flex flex-col gap-1" data-dropdown-root>
        <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">下单方式</span>
        <button
          class="yy-action flex w-[98px] items-center justify-between gap-2 rounded-md border border-amber-topbar-border bg-white/78 px-3 py-[7px] text-[11.375px] text-amber-text-muted transition-colors hover:bg-white"
          :class="{ 'border-amber-dark/30 bg-white': activeDropdown === '下单方式' }"
          type="button"
          @click="$emit('setActiveDropdown', activeDropdown === '下单方式' ? null : '下单方式')"
        >
          <span class="truncate">{{ advanced.method === '全部方式' ? '全部方式' : advanced.method }}</span>
          <img src="../../assets/icons/dropdown-arrow.svg" class="w-[12.25px] h-[12.25px] opacity-40 transition-transform" :class="{ 'rotate-180': activeDropdown === '下单方式' }" />
        </button>
        <div v-if="activeDropdown === '下单方式'" class="absolute top-full left-0 z-10 mt-1 min-w-[120px] rounded-md border border-amber-topbar-border bg-white py-1 shadow-lg">
          <div
            v-for="option in methodOptions"
            :key="option"
            class="px-3 py-1.5 text-[11px] text-amber-dark/80 hover:bg-amber-bg/20 cursor-pointer"
            @click="$emit('selectMethodFilter', option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-[10.5px]">
      <div class="flex items-center border border-amber-topbar-border rounded-md overflow-hidden h-[31.75px]">
        <button
          class="yy-action w-[63px] h-full text-[10.5px] font-sans font-medium transition-colors"
          :class="selectedTimeType === 'order' ? 'bg-amber-dark text-[#F4EFE6]' : 'bg-amber-content-bg text-amber-text-muted hover:bg-white'"
          type="button"
          @click="$emit('setSelectedTimeType', 'order')"
        >
          下单时间
        </button>
        <button
          class="yy-action w-[63px] h-full text-[10.5px] font-sans font-medium transition-colors border-l border-amber-topbar-border"
          :class="selectedTimeType === 'arrival' ? 'bg-amber-dark text-[#F4EFE6]' : 'bg-amber-content-bg text-amber-text-muted hover:bg-white'"
          type="button"
          @click="$emit('setSelectedTimeType', 'arrival')"
        >
          到店时间
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-[10.5px]">
        <div class="relative w-[140.5px] h-[31.75px]" data-dropdown-root>
          <input
            type="text"
            readonly
            :value="activeStartDate"
            class="w-full h-full pl-[10.5px] pr-8 bg-white/78 border border-amber-topbar-border rounded-md text-[11.375px] text-amber-text-muted focus:outline-none cursor-pointer"
            @click="$emit('openCalendar', 'startDate')"
          />
          <img src="../../assets/icons/calendar-new.svg" class="absolute right-[10.5px] top-1/2 -translate-y-1/2 w-[12.25px] h-[12.25px] opacity-40 pointer-events-none" />

          <div v-if="activeDropdown === 'startDate'" class="absolute top-full left-0 mt-1 bg-white border border-amber-topbar-border rounded-md shadow-lg z-20 p-3 w-[220px]">
            <div class="text-[12px] font-bold mb-2 flex justify-between items-center">
              <span class="text-amber-dark/90">{{ calendarTitle }}</span>
              <div class="flex gap-1 text-amber-text-muted">
                <button class="w-5 h-5 hover:bg-amber-bg/20 rounded-[1px]" type="button" @click="$emit('prevMonth')">＜</button>
                <button class="w-5 h-5 hover:bg-amber-bg/20 rounded-[1px]" type="button" @click="$emit('nextMonth')">＞</button>
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-[10px]">
              <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="opacity-40">{{ d }}</div>
              <button
                v-for="(cell, idx) in calendarCells"
                :key="idx"
                class="py-1 rounded-[1px] transition-colors"
                :class="getCalendarCellClass(cell)"
                type="button"
                @click="$emit('selectDate', cell.date)"
              >
                {{ cell.date.getDate() }}
              </button>
            </div>
          </div>
        </div>
        <span class="text-amber-text-muted text-14px font-sans">—</span>
        <div class="relative w-[140.5px] h-[31.75px]" data-dropdown-root>
          <input
            type="text"
            readonly
            :value="activeEndDate"
            class="w-full h-full pl-[10.5px] pr-8 bg-white/78 border border-amber-topbar-border rounded-md text-[11.375px] text-amber-text-muted focus:outline-none cursor-pointer"
            @click="$emit('openCalendar', 'endDate')"
          />
          <img src="../../assets/icons/calendar-new.svg" class="absolute right-[10.5px] top-1/2 -translate-y-1/2 w-[12.25px] h-[12.25px] opacity-40 pointer-events-none" />

          <div v-if="activeDropdown === 'endDate'" class="absolute top-full right-0 mt-1 bg-white border border-amber-topbar-border rounded-md shadow-lg z-20 p-3 w-[220px]">
            <div class="text-[12px] font-bold mb-2 flex justify-between items-center">
              <span class="text-amber-dark/90">{{ calendarTitle }}</span>
              <div class="flex gap-1 text-amber-text-muted">
                <button class="w-5 h-5 hover:bg-amber-bg/20 rounded-[1px]" type="button" @click="$emit('prevMonth')">＜</button>
                <button class="w-5 h-5 hover:bg-amber-bg/20 rounded-[1px]" type="button" @click="$emit('nextMonth')">＞</button>
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-[10px]">
              <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="opacity-40">{{ d }}</div>
              <button
                v-for="(cell, idx) in calendarCells"
                :key="idx"
                class="py-1 rounded-[1px] transition-colors"
                :class="getCalendarCellClass(cell)"
                type="button"
                @click="$emit('selectDate', cell.date)"
              >
                {{ cell.date.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="hasActiveFilters"
        class="ml-auto text-[10.5px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors max-[640px]:ml-0"
        type="button"
        @click="$emit('resetFilters')"
      >
        重置筛选
      </button>
    </div>

    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pt-2">
      <span class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">当前筛选：</span>
      <span
        v-for="tag in activeFilterTags"
        :key="tag.key"
        class="inline-flex items-center gap-1 border border-amber-topbar-border bg-white/60 px-2 py-0.5 text-[10px] text-amber-text-muted"
      >
        {{ tag.label }}
        <button class="text-amber-dark/50 hover:text-amber-dark ml-0.5" type="button" @click="tag.clear">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarCell, FilterDropdown } from './composables/useOrderFilters'

defineProps<{
  effectiveSearchQuery: string
  dropdownFilters: FilterDropdown[]
  activeDropdown: string | null
  getDropdownCaption: (label: string) => string
  methodOptions: string[]
  advanced: { method: string }
  selectedTimeType: 'order' | 'arrival'
  activeStartDate: string
  activeEndDate: string
  calendarCells: CalendarCell[]
  calendarTitle: string
  getCalendarCellClass: (cell: CalendarCell) => string
  hasActiveFilters: boolean
  activeFilterTags: Array<{ key: string; label: string; clear: () => void }>
}>()

defineEmits<{
  armSearchQueryInput: []
  searchInput: [event: Event]
  setActiveDropdown: [value: string | null]
  selectDropdown: [label: string, option: string]
  selectMethodFilter: [option: string]
  setSelectedTimeType: [value: 'order' | 'arrival']
  openCalendar: [target: 'startDate' | 'endDate']
  prevMonth: []
  nextMonth: []
  selectDate: [date: Date]
  resetFilters: []
}>()
</script>
