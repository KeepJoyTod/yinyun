<template>
  <div>
    <div class="p-[17.5px_21px] border-b border-hairline flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
      <div class="flex flex-col gap-1">
        <span class="text-label text-ink-muted uppercase">Schedule</span>
        <h2 class="text-title text-ink">预约排期</h2>
        <p class="text-[10.5px] font-sans text-ink-muted mt-1 opacity-70">14天档期网格 · 上午 / 下午 / 晚上时段 · 点击时段查看订单或新增预约</p>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2.5 max-[720px]:w-full max-[720px]:justify-start">
        <button class="yy-action px-4 py-2 border border-hairline rounded-md text-label text-ink-muted hover:bg-accent-hover/5 transition-all" type="button" @click="$emit('export')">
          导出排期 ↗
        </button>
        <button class="yy-action flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-all" type="button" @click="$emit('create-booking')">
          <img src="../../assets/icons/plus.svg" class="w-3.5 h-3.5 invert brightness-200" />
          <span class="text-label">新增预约</span>
        </button>
        <button class="yy-action px-4 py-2 border border-hairline rounded-md text-label text-ink-muted hover:bg-accent-hover/5 transition-all" type="button" @click="$emit('go-booking-entry')">
          预约入口 ↗
        </button>
        <button class="yy-action flex items-center gap-2 px-4 py-2 border border-hairline rounded-md text-label text-ink-muted hover:bg-accent-hover/5 transition-all" type="button" @click="$emit('go-inventory')">
          <img src="../../assets/icons/plus.svg" class="w-3.5 h-3.5 opacity-45" />
          <span class="text-label">调整容量</span>
        </button>
      </div>
    </div>

    <div class="px-7 py-[17.5px] bg-surface-2 border-b border-hairline flex flex-wrap items-center gap-[13px]">
      <div class="relative">
        <button
          class="yy-action flex items-center justify-between gap-2 px-3 py-[7px] bg-canvas border border-hairline rounded-md text-[11.375px] text-ink-muted hover:bg-surface-1 transition-colors"
          :class="{ 'border-accent/30 bg-surface-1': activeDropdown === 'store' }"
          style="width: 109px"
          @click="$emit('toggle-store-dropdown')"
        >
          <span class="truncate">{{ storeLabel }}</span>
          <img
            src="../../assets/icons/dropdown-arrow.svg"
            class="w-[12.25px] h-[12.25px] opacity-40 transition-transform"
            :class="{ 'rotate-180': activeDropdown === 'store' }"
          />
        </button>

        <div
          v-if="activeDropdown === 'store'"
          class="absolute top-full left-0 mt-1 bg-surface-1 border border-hairline rounded-md shadow-lg z-10 min-w-[140px] py-1"
        >
          <div
            v-for="opt in storeOptions"
            :key="opt.label"
            class="px-3 py-1.5 text-[11px] hover:bg-canvas/20 cursor-pointer text-ink/80"
            @click="$emit('select-store', opt)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>

      <button
        class="yy-action ml-auto text-label font-sans font-medium text-ink-muted hover:text-ink transition-colors max-[640px]:ml-0"
        @click="$emit('reset-filters')"
      >
        重置筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ScheduleStoreOption = {
  label: string
  backendId?: string
}

defineProps<{
  storeLabel: string
  activeDropdown: 'store' | null
  storeOptions: ScheduleStoreOption[]
}>()

defineEmits<{
  export: []
  'create-booking': []
  'go-booking-entry': []
  'go-inventory': []
  'toggle-store-dropdown': []
  'select-store': [option: ScheduleStoreOption]
  'reset-filters': []
}>()
</script>
