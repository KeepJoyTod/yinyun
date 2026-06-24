<template>
  <div class="flex flex-col gap-7">
    <section class="logs-hero yy-glass-panel rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">System Logs</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">排障控制台</h2>
          <p class="mt-2 max-w-[780px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
            汇总店员操作日志和渠道同步日志，重点排查抖音来客 logid、订单同步失败、客户取片权限和接口耗时。
          </p>
        </div>
        <button
          class="yy-action min-h-[42px] rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[13px] font-semibold text-[#F4EFE6] shadow-[0_14px_28px_rgba(26,24,20,0.18)] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          {{ loading ? '刷新中...' : '刷新日志' }}
        </button>
      </div>
      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in logHeroCards"
          :key="card.label"
          class="rounded-2xl border border-amber-topbar-border/70 bg-white/58 p-4 shadow-sm backdrop-blur"
        >
          <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">{{ card.label }}</div>
          <div class="mt-1 text-[24px] font-sans font-black tabular-nums text-amber-dark">{{ card.value }}</div>
          <div class="mt-1 text-[11px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
        </article>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            class="yy-action border px-3 py-1.5 text-[10.5px] font-sans transition-all"
            :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }} · {{ filter.count }}
          </button>
          <button
            v-if="hasActiveLogFilter"
            class="yy-action ml-auto text-[10px] font-sans text-amber-text-muted hover:text-amber-dark"
            type="button"
            @click="resetLogFilter"
          >
            重置筛选
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4 shadow-sm">
          <div class="text-[11px] font-sans font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] font-sans leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="text-[25px] font-sans leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="text-[10px] font-sans text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="system-log-panel border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="w-full max-w-[180px] max-[900px]:max-w-none">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-accent">系统日志面板</span>
            <div class="mt-1 text-[13px] font-sans font-bold text-amber-dark">筛选后定位 requestId / logid</div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="storeFilter"
              class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none"
            >
              <option v-if="canUseGlobalStoreScope" value="all">全部门店</option>
              <option v-for="store in visibleLogStoreOptions" :key="store" :value="store">{{ store }}</option>
            </select>
            <input
              v-model="logIdFilter"
              class="h-8 w-[200px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[640px]:w-full"
              placeholder="按 requestId / logid 定位搜索"
              type="text"
            />
            <input
              v-model="searchQuery"
              class="h-8 w-[220px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[520px]:w-full"
              placeholder="请输入处理内容搜索"
              type="text"
            />
            <input
              v-model="handlerFilter"
              class="h-8 w-[150px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[520px]:w-full"
              placeholder="请输入处理人"
              type="text"
            />
            <input
              v-model="mobileFilter"
              class="h-8 w-[150px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark focus:outline-none max-[520px]:w-full"
              placeholder="请输入手机号"
              type="text"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">
            展示 {{ filteredEvents.length }} 条，失败 {{ failedEvents.length }} 条
          </div>
        </div>

        <div v-if="loading" class="space-y-3 p-5">
          <div v-for="item in 4" :key="item" class="h-[74px] animate-pulse border border-amber-topbar-border bg-white/55"></div>
        </div>

        <div v-else-if="filteredEvents.length" class="overflow-x-auto">
          <table class="w-full min-w-[880px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">处理场景</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">处理人</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">处理结果</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">处理时间</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">处理内容</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">requestId / logid</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="event in filteredEvents"
                :key="event.id"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedEvent?.id === event.id ? 'bg-amber-content-bg' : ''"
                @click="selectedEvent = event"
              >
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ event.title }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ event.source }} · {{ event.channelType }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-semibold text-amber-dark">{{ event.handler }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ event.storeName }}</div>
                </td>
                <td class="px-5 py-4">
                  <span
                    class="px-2 py-0.5 text-[10px]"
                    :class="event.status === 'SUCCESS'
                      ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
                      : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'"
                  >
                    {{ event.status === 'SUCCESS' ? '成功' : '失败' }}
                  </span>
                  <span v-if="event.retryable" class="ml-2 border border-amber-topbar-border bg-amber-content-bg px-2 py-0.5 text-[10px] text-amber-text-muted">
                    可重试
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ formatLogTime(event.happenedAt) }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ event.durationMs }} ms</div>
                </td>
                <td class="px-5 py-4">
                  <div class="max-w-[340px] truncate text-[11px] text-amber-dark">{{ event.content }}</div>
                  <div class="mt-1 max-w-[340px] truncate font-mono text-[10px] text-amber-text-muted">{{ event.action }}</div>
                </td>
                <td class="px-5 py-4">
                  <button
                    v-if="event.requestId"
                    class="yy-action max-w-[190px] truncate border border-amber-topbar-border px-2 py-1 text-left font-mono text-[10px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click.stop="copyValue(event.requestId)"
                  >
                    {{ event.requestId }}
                  </button>
                  <span v-else class="text-[10px] text-amber-text-muted">暂无</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有日志</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部日志，或刷新后再查看最近操作和渠道同步记录。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Log Detail</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">日志详情</h3>
        </div>

        <div v-if="selectedEvent" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedEvent.title }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedEvent.source }} · {{ selectedEvent.storeName }}</div>
            </div>
            <span
              class="px-2 py-0.5 text-[10px]"
              :class="selectedEvent.status === 'SUCCESS'
                ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
                : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'"
            >
              {{ selectedEvent.status === 'SUCCESS' ? '成功' : '失败' }}
            </span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Action</dt>
              <dd class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">{{ selectedEvent.action }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Request ID</dt>
              <dd class="mt-1 flex items-center gap-2">
                <span class="min-w-0 flex-1 break-all font-mono text-[10.5px] text-amber-dark">{{ selectedEvent.requestId || '暂无' }}</span>
                <button
                  v-if="selectedEvent.requestId"
                  class="yy-action border border-amber-topbar-border px-2 py-1 text-[10px] text-amber-text-muted hover:bg-black/5"
                  type="button"
                  @click="copyValue(selectedEvent.requestId)"
                >
                  复制
                </button>
              </dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Meta</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedEvent.meta }}</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Time</dt>
              <dd class="mt-1 text-[10.5px] text-amber-text-muted">{{ selectedEvent.happenedAt || '暂无时间' }} · {{ selectedEvent.durationMs }} ms</dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Result</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed" :class="selectedEvent.errorMessage ? 'text-[#8C3E2C]' : 'text-amber-text-muted'">
                {{ selectedEvent.errorMessage || selectedEvent.remark || '无异常记录' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 border border-amber-topbar-border bg-amber-content-bg p-4">
            <div class="text-[11px] font-semibold text-amber-dark">处理建议</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedEvent.suggestion }}</p>
            <button
              v-if="selectedEvent.status === 'FAILED'"
              class="yy-action mt-3 w-full border border-amber-topbar-border bg-white px-3 py-2 text-[10.5px] font-sans text-amber-dark hover:bg-black/5"
              type="button"
              @click="copyErrorDetail(selectedEvent)"
            >
              复制错误详情（requestId + 错误信息）
            </button>
          </div>
        </div>

        <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
          选择一条日志后，可以查看 requestId、抖音 logid、失败原因和处理建议。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useRouteQueryFilters } from '../../shared/composables/useRouteQueryFilters'
import {
  appStore,
  type ChannelSyncLogInfo,
  type OperationLogInfo,
} from '../../shared/stores/appStore'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import { useNotice } from '../../shared/composables/useNotice'
import {
  buildLogDiagnosticText,
  buildLogHeroCards,
  buildLogSummaryCards,
  buildQuickLogFilters,
  buildUnifiedLogEvents,
  filterUnifiedLogEvents,
  formatLogTime,
  getLogStoreOptions,
  type LogFilter,
  type UnifiedLogEvent,
  validLogFilters,
} from './logsOperations'

const loading = ref(false)
const { notice, pushNotice } = useNotice()
const activeFilter = ref<LogFilter>('all')
const storeFilter = ref('all')
const logIdFilter = ref('')
const searchQuery = ref('')
const handlerFilter = ref('')
const mobileFilter = ref('')
const operationLogs = ref<OperationLogInfo[]>([])
const channelLogs = ref<ChannelSyncLogInfo[]>([])
const selectedEvent = ref<UnifiedLogEvent | null>(null)
const canUseGlobalStoreScope = computed(() => studioAccessStore.globalStoreScope)

// 筛选条件同步到 URL：?filter=&store=&q=&logid=，排障时可直接分享筛选链接
const { applyFromQuery, syncToUrl } = useRouteQueryFilters({
  buildQuery: () => ({
    filter: activeFilter.value === 'all' ? '' : activeFilter.value,
    store: storeFilter.value === 'all' ? '' : storeFilter.value,
    q: searchQuery.value.trim(),
    handler: handlerFilter.value.trim(),
    mobile: mobileFilter.value.trim(),
    logid: logIdFilter.value.trim(),
  }),
  parseQuery: get => {
    const filter = get('filter') as LogFilter
    if (validLogFilters.includes(filter)) activeFilter.value = filter
    const store = get('store')
    if (store) storeFilter.value = store
    const q = get('q')
    if (q) searchQuery.value = q
    const handler = get('handler')
    if (handler) handlerFilter.value = handler
    const mobile = get('mobile')
    if (mobile) mobileFilter.value = mobile
    const logid = get('logid')
    if (logid) logIdFilter.value = logid
  },
})

const allEvents = computed(() => buildUnifiedLogEvents(operationLogs.value, channelLogs.value))
const failedEvents = computed(() => allEvents.value.filter(item => item.status === 'FAILED'))
const storeOptions = computed(() => getLogStoreOptions(allEvents.value))
const visibleStoreNames = computed(() => new Set(appStore.stores.map(store => store.name).filter(Boolean)))
const visibleLogStoreOptions = computed(() => {
  if (canUseGlobalStoreScope.value) return storeOptions.value
  return storeOptions.value.filter(store => visibleStoreNames.value.has(store))
})
const normalizeStoreFilter = (preferred = storeFilter.value) => {
  if (canUseGlobalStoreScope.value && (!preferred || preferred === 'all')) return 'all'
  const matched = visibleLogStoreOptions.value.find(store => store === preferred)
  return matched ?? visibleLogStoreOptions.value[0] ?? ''
}
const filteredEvents = computed(() => filterUnifiedLogEvents(allEvents.value, {
  activeFilter: activeFilter.value,
  storeFilter: storeFilter.value,
  logIdFilter: logIdFilter.value,
  searchQuery: searchQuery.value,
  handlerFilter: handlerFilter.value,
  mobileFilter: mobileFilter.value,
}))
const quickFilters = computed(() => buildQuickLogFilters(allEvents.value))
const logHeroCards = computed(() => buildLogHeroCards(allEvents.value))
const cards = computed(() => buildLogSummaryCards(allEvents.value))

const hasActiveLogFilter = computed(
  () => activeFilter.value !== 'all'
    || storeFilter.value !== normalizeStoreFilter(canUseGlobalStoreScope.value ? 'all' : '')
    || searchQuery.value.trim() !== ''
    || handlerFilter.value.trim() !== ''
    || mobileFilter.value.trim() !== ''
    || logIdFilter.value.trim() !== '',
)

const resetLogFilter = () => {
  activeFilter.value = 'all'
  storeFilter.value = normalizeStoreFilter(canUseGlobalStoreScope.value ? 'all' : '')
  searchQuery.value = ''
  handlerFilter.value = ''
  mobileFilter.value = ''
  logIdFilter.value = ''
}

const copyErrorDetail = async (event: UnifiedLogEvent | null) => {
  if (!event) return
  try {
    await navigator.clipboard?.writeText(buildLogDiagnosticText(event))
    pushNotice('success', '日志排障信息已复制，可直接粘贴给平台或后端')
  } catch {
    pushNotice('error', '复制失败，请手动选择文本复制')
  }
}

const reload = async () => {
  loading.value = true
  const failures: string[] = []
  try {
    const [operationResult, channelResult] = await Promise.allSettled([
      appStore.loadOperationLogs(),
      appStore.loadChannelSyncLogs(),
    ])
    if (operationResult.status === 'fulfilled') {
      operationLogs.value = [...operationResult.value]
    } else {
      failures.push(`操作日志：${operationResult.reason instanceof Error ? operationResult.reason.message : '加载失败'}`)
    }
    if (channelResult.status === 'fulfilled') {
      channelLogs.value = [...channelResult.value]
    } else {
      failures.push(`渠道同步：${channelResult.reason instanceof Error ? channelResult.reason.message : '加载失败'}`)
    }
    if (!canUseGlobalStoreScope.value && storeFilter.value === 'all') {
      storeFilter.value = normalizeStoreFilter()
    }
    storeFilter.value = normalizeStoreFilter()
    selectedEvent.value = filteredEvents.value[0] ?? null
    if (failures.length) pushNotice('error', failures.join('；'))
  } finally {
    loading.value = false
  }
}

const copyValue = async (value: string) => {
  try {
    await navigator.clipboard?.writeText(value)
    pushNotice('success', '已复制到剪贴板')
  } catch {
    pushNotice('error', '复制失败，请手动选择文本复制')
  }
}

onMounted(() => {
  applyFromQuery()
  reload()
})

watch([activeFilter, storeFilter, searchQuery, handlerFilter, mobileFilter, logIdFilter], () => {
  syncToUrl()
})

watch(
  () => `${canUseGlobalStoreScope.value}:${visibleLogStoreOptions.value.join('|')}`,
  () => {
    if (!canUseGlobalStoreScope.value && storeFilter.value === 'all') {
      storeFilter.value = normalizeStoreFilter()
      return
    }
    storeFilter.value = normalizeStoreFilter()
  },
)
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
