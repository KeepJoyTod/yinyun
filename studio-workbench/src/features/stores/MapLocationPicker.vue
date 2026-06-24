<template>
  <div class="grid gap-3 border border-amber-topbar-border bg-[#FFFDF8] p-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="text-[14px] font-medium text-amber-dark">地图定位</div>
        <p class="mt-1 text-[12px] leading-6 text-amber-text-muted">{{ status.helperText }}</p>
      </div>
      <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-1 text-[11px] text-amber-dark">{{ status.modeLabel }}</span>
    </div>

    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
      <div class="grid gap-3 border border-dashed border-amber-topbar-border bg-[#FBF8F2] px-4 py-4">
        <div class="text-[12px] text-amber-dark">当前地址：{{ safeValue.address || '未填写' }}</div>
        <div class="text-[12px] text-amber-text-muted">经纬度：{{ safeValue.lng || '--' }}, {{ safeValue.lat || '--' }}</div>
        <div class="text-[12px] text-amber-text-muted">行政区编码：{{ safeValue.adCode || '未生成' }}</div>
        <div class="text-[12px] text-amber-text-muted">Provider：{{ safeValue.provider }}</div>
      </div>

      <div class="grid content-start gap-2">
        <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emitMockLocation">
          {{ status.hasKey ? '模拟地图选点' : '快速填充坐标' }}
        </button>
        <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emitCurrentLocation">
          回填当前位置文本
        </button>
        <p class="text-[11px] leading-5 text-amber-text-muted">
          当前版本先提供适配器与降级选点能力；接真实 SDK 时只需替换 `mapAdapter`。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMockMapLocation, resolveMapAdapterStatus, type MapLocationValue } from './mapAdapter'

const props = defineProps<{
  modelValue: MapLocationValue
  seedText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MapLocationValue]
}>()

const status = resolveMapAdapterStatus()

const safeValue = computed<MapLocationValue>(() => ({
  address: props.modelValue?.address || '',
  lat: props.modelValue?.lat || '',
  lng: props.modelValue?.lng || '',
  adCode: props.modelValue?.adCode || '',
  provider: props.modelValue?.provider || status.provider,
}))

const emitMockLocation = () => {
  emit('update:modelValue', buildMockMapLocation(props.seedText || safeValue.value.address, safeValue.value))
}

const emitCurrentLocation = () => {
  emit('update:modelValue', {
    ...safeValue.value,
    address: props.seedText?.trim() || safeValue.value.address,
    provider: safeValue.value.provider || status.provider,
  })
}
</script>