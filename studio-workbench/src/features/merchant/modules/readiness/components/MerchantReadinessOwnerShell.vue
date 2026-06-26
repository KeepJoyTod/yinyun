<template>
  <MerchantModuleChrome>
    <template #status>
      <span class="text-[11px] text-amber-text-muted">
        {{ selectedStoreLabel }} / {{ currentSection.label }}
      </span>
    </template>

    <section class="space-y-4">
      <header class="border border-amber-topbar-border bg-amber-content-bg/55 p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-text-muted">{{ eyebrow }}</div>
            <h1 class="mt-1 text-[18px] font-semibold text-amber-dark">{{ title }}</h1>
            <p class="mt-2 max-w-3xl text-[12px] leading-relaxed text-amber-text-muted">
              {{ description }}
            </p>
          </div>

          <div class="flex min-w-[220px] flex-col gap-2">
            <label class="text-[10px] font-semibold text-amber-text-muted" :for="storeSelectId">门店上下文</label>
            <select
              :id="storeSelectId"
              v-model="selectedStoreId"
              class="yy-field h-9 w-full border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark"
            >
              <option value="">全部门店</option>
              <option
                v-for="store in concreteStoreOptions"
                :key="String(store.backendId)"
                :value="String(store.backendId)"
              >
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <template v-if="showTabs">
            <button
              v-for="section in merchantReadinessSections"
              :key="section.key"
              class="yy-action yy-filter-chip"
              :class="activeSection === section.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
              type="button"
              @click="activeSection = section.key"
            >
              {{ section.label }}
            </button>
          </template>
          <span v-else class="yy-status-chip border border-amber-topbar-border bg-white text-amber-text-muted">
            {{ currentSection.hint }}
          </span>

          <button class="yy-action ml-auto border border-amber-topbar-border bg-white px-3 py-1.5 text-[11px] text-amber-dark" type="button" @click="reload">
            刷新
          </button>
        </div>
      </header>

      <MerchantReadinessBoard
        :section-label="currentSection.label"
        :items="currentItems"
        :summary="summary"
        :loading="loading"
        :error-message="errorMessage"
        @retry="reload"
      />
    </section>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MerchantModuleChrome from '../../../components/MerchantModuleChrome.vue'
import MerchantReadinessBoard from './MerchantReadinessBoard.vue'
import { merchantReadinessSections, type MerchantReadinessSectionKey } from '../merchantReadinessOperations'
import { useMerchantReadinessState } from '../composables/useMerchantReadinessState'

const props = withDefaults(defineProps<{
  sectionKey: MerchantReadinessSectionKey
  eyebrow: string
  title: string
  description: string
  showTabs?: boolean
}>(), {
  showTabs: false,
})

const storeSelectId = computed(() => `merchant-readiness-store-${props.sectionKey}`)

const {
  loading,
  errorMessage,
  selectedStoreId,
  activeSection,
  concreteStoreOptions,
  currentItems,
  currentSection,
  selectedStoreLabel,
  summary,
  reload,
} = useMerchantReadinessState(props.sectionKey)
</script>
