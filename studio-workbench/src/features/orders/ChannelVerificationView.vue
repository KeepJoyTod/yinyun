<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Channel Verification</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">渠道核销</h2>
          <p class="mt-1 max-w-[800px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            聚合抖音来客发券、接单、整单核销和订单同步健康状态。这里用于验收、复制 logid 和排障，不在门店工作台直接执行真实核销。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          {{ loading ? '刷新中...' : '刷新状态' }}
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="card in healthCards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm">
        <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
        <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
          <span class="text-[10px] font-sans text-amber-text-muted">{{ card.scope }}</span>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Acceptance Cases</span>
            <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">抖音来客验收记录</h3>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="filter in quickFilters"
              :key="filter.key"
              class="yy-action yy-filter-chip"
              :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
              type="button"
              @click="activeFilter = filter.key"
            >
              {{ filter.label }} · {{ filter.count }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="space-y-3 p-5">
          <div v-for="item in 3" :key="item" class="h-[92px] animate-pulse border border-amber-topbar-border bg-white/55"></div>
        </div>

        <div v-else-if="filteredCases.length" class="divide-y divide-amber-topbar-border/60">
          <article
            v-for="item in filteredCases"
            :key="item.caseKey"
            class="cursor-pointer px-5 py-4 hover:bg-black/[0.015]"
            :class="selectedCase?.caseKey === item.caseKey ? 'bg-[#FBF8F2]' : ''"
            @click="selectedCaseKey = item.caseKey"
          >
            <div class="flex items-start justify-between gap-4 max-[640px]:flex-col">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-[12px] font-semibold text-amber-dark">{{ item.label }}</h4>
                  <span
                    class="px-2 py-0.5 text-[10px]"
                    :class="casePassed(item) ? 'bg-[#EBF4ED] text-[#2D7A4D]' : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
                  >
                    {{ item.statusText || item.status || (casePassed(item) ? '已通过' : '待排查') }}
                  </span>
                  <span
                    class="border px-2 py-0.5 text-[10px]"
                    :class="item.logMatchLevel === 'logid'
                      ? 'border-[#2D7A4D]/20 bg-[#EBF4ED] text-[#2D7A4D]'
                      : item.logMatchLevel === 'api-candidate'
                        ? 'border-[#A76F1F]/20 bg-[#FFF4DD] text-[#8A5B1B]'
                        : 'border-amber-topbar-border bg-white/70 text-amber-text-muted'"
                  >
                    {{ item.logMatchLabel }}
                  </span>
                </div>
                <div class="mt-2 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ item.endpoint || item.apiName }}</div>
                <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ item.hint || item.errorMessage || '暂无说明' }}</p>
                <div v-if="item.relatedLog" class="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-amber-text-muted">
                  <span class="font-mono">{{ item.relatedLog.apiName }}</span>
                  <span class="break-all font-mono text-amber-dark">{{ item.relatedLog.requestId || '暂无 logid' }}</span>
                </div>
              </div>
              <button
                class="yy-action shrink-0 border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5 disabled:text-amber-text-muted"
                type="button"
                :disabled="!item.requestId"
                @click.stop="copyValue(item.requestId)"
              >
                复制 logid
              </button>
            </div>
          </article>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前没有验收记录</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可刷新接口，或到系统后台检查 DOUYIN_LIFE 验收用例是否已生成。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Verification Detail</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">核销排障清单</h3>
        </div>

        <div class="p-5">
          <div class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">安全边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              不在门店工作台直接执行真实核销。后端已规划 POST /yy/channel/DOUYIN_LIFE/verify，真实操作仍需在管理员确认、权限校验和平台验收通过后开放。
            </p>
          </div>

          <button
            v-if="selectedCase"
            class="yy-action mt-4 w-full border border-amber-dark bg-amber-dark px-4 py-2.5 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
            type="button"
            @click="copyDiagnosticPackage"
          >
            复制排障包
          </button>

          <dl v-if="selectedCase" class="mt-5 space-y-4">
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Selected Case</dt>
              <dd class="mt-1 text-[12px] font-semibold text-amber-dark">{{ selectedCase.label }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Endpoint</dt>
              <dd class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ selectedCase.publicUrl || selectedCase.endpoint || selectedCase.apiName }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Request ID / Logid</dt>
              <dd class="mt-1 flex items-center gap-2">
                <span class="min-w-0 flex-1 break-all font-mono text-[10.5px] text-amber-dark">{{ selectedCase.requestId || '暂无' }}</span>
                <button
                  v-if="selectedCase.requestId"
                  class="yy-action border border-amber-topbar-border px-2 py-1 text-[10px] text-amber-text-muted hover:bg-black/5"
                  type="button"
                  @click="copyValue(selectedCase.requestId)"
                >
                  复制
                </button>
              </dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">日志匹配</dt>
              <dd class="mt-1 space-y-2">
                <div class="text-[10.5px] font-semibold text-amber-dark">{{ selectedCase.logMatchLabel }}</div>
                <p class="text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedCase.logMatchHint }}</p>
                <div v-if="selectedCase.relatedLog" class="border border-amber-topbar-border bg-white/70 p-3">
                  <div class="break-all font-mono text-[10px] leading-relaxed text-amber-dark">{{ selectedCase.relatedLog.apiName }}</div>
                  <button
                    v-if="selectedCase.relatedLog.requestId"
                    class="yy-action mt-2 max-w-full truncate border border-amber-topbar-border px-2 py-1 text-left font-mono text-[10px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click="copyValue(selectedCase.relatedLog.requestId)"
                  >
                    {{ selectedCase.relatedLog.requestId }}
                  </button>
                  <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
                    {{ selectedCase.relatedLog.errorMessage || selectedCase.relatedLog.remark || '无异常记录' }}
                  </div>
                </div>
              </dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Result</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed" :class="selectedCase.errorMessage ? 'text-[#8C3E2C]' : 'text-amber-text-muted'">
                {{ selectedCase.errorMessage || selectedCase.hint || '无异常记录' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6">
            <div class="text-[11px] font-semibold text-amber-dark">真实核销开放前必须确认</div>
            <div class="mt-3 space-y-2">
              <div v-for="item in verificationChecklist" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-amber-topbar-border bg-[#FBF8F2] text-[10px] font-mono text-amber-text-muted">✓</span>
                <p class="text-[10.5px] leading-relaxed text-amber-text-muted">{{ item }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section class="border border-amber-topbar-border bg-amber-content-bg">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Recent Channel Logs</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">最近渠道日志</h3>
        </div>
        <span class="text-[10.5px] text-amber-text-muted">展示 {{ visibleChannelLogs.length }} 条 DOUYIN_LIFE 相关日志</span>
      </div>

      <div v-if="visibleChannelLogs.length" class="overflow-x-auto">
        <table class="w-full min-w-[820px] border-collapse">
          <thead>
            <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">接口</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">门店</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">requestId / logid</th>
              <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/60">
            <tr v-for="log in visibleChannelLogs" :key="log.backendId" class="hover:bg-black/[0.015]">
              <td class="px-5 py-4">
                <div class="text-[11px] font-semibold text-amber-dark">{{ log.apiName }}</div>
                <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ log.channelType }}</div>
              </td>
              <td class="px-5 py-4 text-[11px] text-amber-dark">{{ log.storeName }}</td>
              <td class="px-5 py-4">
                <span
                  class="px-2 py-0.5 text-[10px]"
                  :class="log.status === 'SUCCESS' ? 'bg-[#EBF4ED] text-[#2D7A4D]' : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
                >
                  {{ log.status === 'SUCCESS' ? '成功' : '失败' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <button
                  v-if="log.requestId"
                  class="yy-action max-w-[220px] truncate border border-amber-topbar-border px-2 py-1 text-left font-mono text-[10px] text-amber-dark hover:bg-black/5"
                  type="button"
                  @click="copyValue(log.requestId)"
                >
                  {{ log.requestId }}
                </button>
                <span v-else class="text-[10px] text-amber-text-muted">暂无</span>
              </td>
              <td class="px-5 py-4 text-[10.5px] leading-relaxed text-amber-text-muted">{{ log.errorMessage || log.remark || '无' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="px-6 py-10 text-center text-[11px] text-amber-text-muted">
        暂无抖音核销、发券、订单或履约同步日志。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  appStore,
  type ChannelSyncLogInfo,
  type DouyinAcceptanceCaseInfo,
  type DouyinSyncHealthInfo,
} from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'
import {
  buildAcceptanceCaseDiagnosticText,
  buildAcceptanceCaseLogRelations,
  casePassed,
  type AcceptanceCaseLogRelation,
} from './channelVerificationOperations'

type CaseFilter = 'all' | 'passed' | 'failed'

const loading = ref(false)
const activeFilter = ref<CaseFilter>('all')
const cases = ref<DouyinAcceptanceCaseInfo[]>([])
const health = ref<DouyinSyncHealthInfo | null>(null)
const channelLogs = ref<ChannelSyncLogInfo[]>([])
const selectedCaseKey = ref<string | null>(null)
const { notice, pushNotice } = useNotice()

const caseRelations = computed(() => buildAcceptanceCaseLogRelations(cases.value, channelLogs.value))

const passedCases = computed(() => caseRelations.value.filter(casePassed))
const failedCases = computed(() => caseRelations.value.filter(item => !casePassed(item)))

const filteredCases = computed(() => {
  if (activeFilter.value === 'passed') return passedCases.value
  if (activeFilter.value === 'failed') return failedCases.value
  return caseRelations.value
})

const selectedCase = computed<AcceptanceCaseLogRelation | null>(() => {
  const matched = caseRelations.value.find(item => item.caseKey === selectedCaseKey.value)
  if (matched) return matched
  return filteredCases.value[0] ?? null
})

const selectedCaseDiagnosticText = computed(() =>
  selectedCase.value ? buildAcceptanceCaseDiagnosticText(selectedCase.value) : '',
)

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部用例', count: cases.value.length },
  { key: 'passed' as const, label: '已通过', count: passedCases.value.length },
  { key: 'failed' as const, label: '待排查', count: failedCases.value.length },
])

const healthCards = computed(() => [
  {
    label: '同步状态',
    value: health.value?.healthStatus || 'UNKNOWN',
    hint: health.value?.message || '未加载 /yy/channel/DOUYIN_LIFE/sync-health。',
    scope: health.value?.channelType || 'DOUYIN_LIFE',
  },
  {
    label: '失败事件',
    value: String(health.value?.failedEventCount ?? 0),
    hint: '同步失败但仍可排查的事件数量。',
    scope: 'FAIL',
  },
  {
    label: '可重试',
    value: String(health.value?.retryableEventCount ?? 0),
    hint: '可由补偿任务或管理员重试的事件。',
    scope: 'RETRY',
  },
  {
    label: '最近 logid',
    value: health.value?.latestLogId ? '已记录' : '暂无',
    hint: health.value?.latestLogId || '等待抖音回调或主动同步产生 logid。',
    scope: 'LOGID',
  },
])

const visibleChannelLogs = computed(() =>
  channelLogs.value.filter(item => {
    if (item.channelType !== 'DOUYIN_LIFE') return false
    const api = item.apiName.toLowerCase()
    return ['verify', 'voucher', 'fulfil', 'order', 'tripartite', 'reservation'].some(keyword => api.includes(keyword))
  }),
)

const verificationChecklist = [
  '确认抖音生活服务能力、商户和门店 POI 已授权给当前应用。',
  '确认商品映射里 externalProductId、externalSkuId、externalPoiId 都和来客后台一致。',
  '真实核销需要 codes 或 verify_token，且必须校验订单归属、门店和核销状态。',
  '每次请求都要保存 X-Bytedance-Logid，失败时复制 logid 给平台排障。',
  '核销成功后必须写入 yy_order / 渠道映射 / 同步日志，避免重复核销和账本冲突。',
]

const reload = async () => {
  loading.value = true
  const failures: string[] = []
  try {
    const [casesResult, healthResult, logsResult] = await Promise.allSettled([
      appStore.loadDouyinAcceptanceCases(),
      appStore.loadDouyinSyncHealth(),
      appStore.loadChannelSyncLogs(),
    ])
    if (casesResult.status === 'fulfilled') {
      cases.value = [...casesResult.value]
    } else {
      failures.push(`验收记录：${casesResult.reason instanceof Error ? casesResult.reason.message : '加载失败'}`)
    }
    if (healthResult.status === 'fulfilled') {
      health.value = healthResult.value
    } else {
      failures.push(`同步健康：${healthResult.reason instanceof Error ? healthResult.reason.message : '加载失败'}`)
    }
    if (logsResult.status === 'fulfilled') {
      channelLogs.value = [...logsResult.value]
    } else {
      failures.push(`渠道日志：${logsResult.reason instanceof Error ? logsResult.reason.message : '加载失败'}`)
    }
    selectedCaseKey.value = filteredCases.value[0]?.caseKey ?? null
    if (failures.length) pushNotice('error', failures.join('；'))
  } finally {
    loading.value = false
  }
}

const copyValue = async (value: string) => {
  if (!value) return
  try {
    await navigator.clipboard?.writeText(value)
    pushNotice('success', '已复制到剪贴板')
  } catch {
    pushNotice('error', '复制失败，请手动选择文本复制')
  }
}

const copyDiagnosticPackage = async () => {
  if (!selectedCase.value) return
  await copyValue(selectedCaseDiagnosticText.value)
}

onMounted(reload)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
