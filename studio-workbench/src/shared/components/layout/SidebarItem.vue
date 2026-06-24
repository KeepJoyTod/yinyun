<template>
  <router-link
    :to="to"
    class="yy-action group relative flex min-h-[36px] items-center gap-[10px] rounded-lg px-3 py-2 text-nav-item font-medium transition-all duration-200"
    :class="[
      isActive
        ? 'bg-white/[0.08] text-amber-accent'
        : 'text-[#F4EFE6]/80 hover:bg-white/5 hover:text-[#F4EFE6]'
    ]"
  >
    <span
      v-if="isActive"
      class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-amber-accent"
    ></span>
    <div class="relative flex items-center justify-center w-4 h-4">
      <img
        :src="iconUrl"
        class="w-full h-full transition-opacity invert brightness-200"
        :class="isActive ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'"
      />
      <span
        v-if="hasDot"
        class="absolute -top-[1px] -right-[1px] w-[5px] h-[5px] bg-amber-accent rounded-full border border-amber-dark"
      ></span>
    </div>
    <span class="min-w-0 flex-1 truncate tracking-normal">{{ label }}</span>
    <span v-if="status === 'building'" class="font-mono text-[9.5px] text-[#F4EFE6]/40">建设中</span>
    <span v-else-if="pendingCount && pendingCount > 0" class="min-w-5 border border-amber-accent/40 px-1.5 py-[1px] text-center font-mono text-[9.5px] font-semibold text-amber-accent">
      {{ formattedPendingCount }}
    </span>
    <span v-else-if="badge" class="border border-white/12 px-1.5 py-[1px] font-mono text-[9.5px] text-[#F4EFE6]/55">{{ badge }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  to: string
  icon: string
  label: string
  hasDot?: boolean
  badge?: string
  status?: 'ready' | 'building' | 'hidden'
  pendingCount?: number
}>()

const route = useRoute()
const isActive = computed(() => route.path === props.to)
const formattedPendingCount = computed(() => (props.pendingCount && props.pendingCount > 99 ? '99+' : String(props.pendingCount ?? 0)))

const iconUrl = computed(() => {
  return new URL(`../../../assets/icons/${props.icon}.svg`, import.meta.url).href
})
</script>
