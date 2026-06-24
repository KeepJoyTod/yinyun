<template>
  <section class="min-h-full">
    <div class="border border-amber-topbar-border bg-amber-content-bg">
      <div class="grid min-h-[360px] grid-cols-[1fr_300px] max-[860px]:grid-cols-1">
        <div class="flex flex-col justify-center px-10 py-12 max-[720px]:px-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-accent">{{ groupLabel }} · 能力建设</p>
          <h1 class="mt-4 font-sans text-[30px] font-medium text-amber-dark">{{ feature?.label ?? '功能建设中' }}</h1>
          <p class="mt-4 max-w-[620px] text-[13px] leading-7 text-amber-text-muted">
            {{ feature?.description ?? '该能力已纳入影约云门店工作台实施计划。' }}
          </p>

          <div v-if="feature" class="mt-6 max-w-[620px] space-y-3">
            <div class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">所属模块</div>
              <p class="mt-1 text-[11px] text-amber-text-muted">{{ groupLabel }}（{{ feature.group }}）</p>
            </div>
            <div v-if="featureInfo.expectedApi.length" class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">预计接入接口</div>
              <ul class="mt-1 space-y-1 font-mono text-[10px] text-amber-text-muted">
                <li v-for="api in featureInfo.expectedApi" :key="api">{{ api }}</li>
              </ul>
            </div>
            <div class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
              <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
              <p class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ featureInfo.boundary }}</p>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <button class="yy-action bg-amber-dark px-5 py-2.5 text-[11px] font-medium text-[#F4EFE6]" type="button" @click="goBack">
              返回上一页
            </button>
            <router-link class="yy-action border border-amber-topbar-border px-5 py-2.5 text-[11px] font-medium text-amber-dark" to="/">
              回到经营概况
            </router-link>
          </div>
        </div>

        <aside class="border-l border-amber-topbar-border bg-[#F0E9DD] p-8 max-[860px]:border-l-0 max-[860px]:border-t">
          <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Delivery status</p>
          <div class="mt-6 space-y-5">
            <div>
              <p class="text-[11px] text-amber-text-muted">当前状态</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">已进入实施计划</p>
            </div>
            <div>
              <p class="text-[11px] text-amber-text-muted">数据原则</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">只接真实统一数据库</p>
            </div>
            <div>
              <p class="text-[11px] text-amber-text-muted">上线条件</p>
              <p class="mt-1 text-[14px] font-medium text-amber-dark">接口、权限、测试同时通过</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkbenchFeature, workbenchGroups } from '../../app/router/featureRegistry'

type FeatureInfo = {
  expectedApi: string[]
  boundary: string
}

const featureInfoMap: Record<string, FeatureInfo> = {
  'report-reviews': {
    expectedApi: ['GET /yy/customerReview/list', 'GET /yy/channelReview/list'],
    boundary: '客户评价没有正式评价表或渠道评价 API 时保持空态，不伪造评分。',
  },
  'order-verification': {
    expectedApi: ['GET /yy/channel/DOUYIN_LIFE/acceptance-cases', 'GET /yy/channel/DOUYIN_LIFE/sync-health'],
    boundary: '渠道核销数据通过回调同步，不伪造核销结果。',
  },
  'settings-logs': {
    expectedApi: ['GET /monitor/operlog/list'],
    boundary: '操作日志依赖 RuoYi 监控接口权限，无权限时只显示渠道同步日志。',
  },
}

const route = useRoute()
const router = useRouter()
const feature = computed(() => getWorkbenchFeature(String(route.meta.featureKey ?? '')))
const groupLabel = computed(() => workbenchGroups.find(group => group.key === feature.value?.group)?.label ?? '影约云')
const featureInfo = computed<FeatureInfo>(() => {
  if (feature.value && featureInfoMap[feature.value.key]) return featureInfoMap[feature.value.key]
  return {
    expectedApi: ['待按模块接入真实业务接口'],
    boundary: '该功能仍处于建设中，只展示实施边界；上线前必须接入真实接口、权限和测试，不使用伪造业务数据。',
  }
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>
