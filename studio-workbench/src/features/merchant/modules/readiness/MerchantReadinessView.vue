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
            <div class="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-text-muted">商家闭环脚手架</div>
            <h1 class="mt-1 text-[18px] font-semibold text-amber-dark">未完成项总览</h1>
            <p class="mt-2 max-w-3xl text-[12px] leading-relaxed text-amber-text-muted">
              只读聚合商家模块的 readiness 状态、阻塞原因、证据与下一步动作，后续任务包按 owner 逐个补齐真实写链路。
            </p>
          </div>

          <div class="flex min-w-[220px] flex-col gap-2">
            <label class="text-[10px] font-semibold text-amber-text-muted" for="merchant-readiness-store">门店上下文</label>
            <select
              id="merchant-readiness-store"
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
import MerchantModuleChrome from '../../components/MerchantModuleChrome.vue'
import MerchantReadinessBoard from './components/MerchantReadinessBoard.vue'
import { merchantReadinessSections } from './merchantReadinessOperations'
import { useMerchantReadinessState } from './composables/useMerchantReadinessState'

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
} = useMerchantReadinessState()
</script>
