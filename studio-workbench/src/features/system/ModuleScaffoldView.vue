<template>
  <section class="min-h-full">
    <div class="border border-amber-topbar-border bg-amber-content-bg">
      <div class="grid min-h-[360px] grid-cols-[minmax(0,1fr)_320px] max-[960px]:grid-cols-1">
        <div class="px-10 py-12 max-[720px]:px-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-accent">{{ domain }} / Phase 0 Scaffold</p>
          <h1 class="mt-4 font-sans text-[30px] font-medium text-amber-dark">{{ title }}</h1>
          <p class="mt-4 max-w-[720px] text-[13px] leading-7 text-amber-text-muted">{{ summary }}</p>

          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full border border-amber-topbar-border px-3 py-1 font-mono text-[10px] text-amber-text-muted">
              {{ runtimeStatusLabel }}
            </span>
            <span class="rounded-full border border-amber-topbar-border px-3 py-1 text-[10px] text-amber-text-muted">
              {{ accessState }}
            </span>
            <span
              v-if="permissionCode"
              class="rounded-full border border-amber-topbar-border px-3 py-1 font-mono text-[10px] text-amber-text-muted"
            >
              {{ permissionCode }}
            </span>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-2">
            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">模块 owner</div>
              <p class="mt-1 text-[11px] leading-6 text-amber-text-muted">{{ owner }}</p>
            </article>

            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">下一阶段</div>
              <p class="mt-1 text-[11px] leading-6 text-amber-text-muted">{{ nextPhase }}</p>
            </article>

            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">路由 / 页面</div>
              <ul class="mt-1 space-y-1 font-mono text-[10px] text-amber-text-muted">
                <li v-for="item in routes" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">契约 / 类型</div>
              <ul class="mt-1 space-y-1 font-mono text-[10px] text-amber-text-muted">
                <li v-for="item in contracts" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">模块接口</div>
              <ul class="mt-1 space-y-1 font-mono text-[10px] text-amber-text-muted">
                <li v-for="item in apis" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">账本 / 证据</div>
              <ul class="mt-1 space-y-1 font-mono text-[10px] text-amber-text-muted">
                <li v-for="item in ledgers" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>
        </div>

        <aside class="border-l border-amber-topbar-border bg-[#F0E9DD] p-8 max-[960px]:border-l-0 max-[960px]:border-t">
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Phase 0 rule</p>
          <div class="mt-6 space-y-5">
            <div>
              <p class="text-[11px] text-amber-text-muted">当前状态</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">{{ runtimeStatusLabel }}</p>
            </div>
            <div>
              <p class="text-[11px] text-amber-text-muted">访问门禁</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">{{ accessState }}</p>
            </div>
            <div>
              <p class="text-[11px] text-amber-text-muted">门店范围</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">{{ storeScopeLabel || '待绑定门店范围' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-amber-text-muted">上线条件</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">契约、权限、测试和地图同步齐全</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkbenchFeatureRuntimeStatus } from '../../app/router/featureRegistry'

const props = withDefaults(defineProps<{
  domain: string
  title: string
  summary: string
  owner: string
  nextPhase: string
  routes: string[]
  contracts: string[]
  apis: string[]
  ledgers: string[]
  permissionCode?: string
  runtimeStatus?: WorkbenchFeatureRuntimeStatus
  accessState?: string
  storeScopeLabel?: string
}>(), {
  permissionCode: '',
  runtimeStatus: 'building',
  accessState: '待加载门禁',
  storeScopeLabel: '',
})

const runtimeStatusLabel = computed(() => {
  if (props.runtimeStatus === 'ready') return '已接入真实模块'
  if (props.runtimeStatus === 'hidden') return '未开通或已隐藏'
  if (props.runtimeStatus === 'derived') return '已接入派生模块'
  if (props.runtimeStatus === 'partial') return '已接入部分链路'
  return '已挂载脚手架'
})
</script>
