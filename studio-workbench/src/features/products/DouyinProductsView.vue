<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Douyin Life Products</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">抖音产品</h2>
          <p class="mt-1 max-w-[780px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            查看抖音来客商品、SKU、POI 与影约云本地产品的映射状态。真实下单入口仍走抖音来客商品页，支付后同步到本地 yy_order。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted"
          type="button"
          :disabled="loading"
          @click="reload"
        >
          {{ loading ? '刷新中...' : '刷新映射' }}
        </button>
      </div>
    </section>

    <NoticeBanner :notice="notice" />

    <section class="border border-amber-topbar-border bg-amber-content-bg/55">
      <div class="border-b border-amber-topbar-border p-5">
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
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="storeFilter"
              class="yy-field-sm"
            >
              <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
              <option v-for="store in concreteStoreOptions" :key="store" :value="store">{{ store }}</option>
            </select>
            <input
              v-model="searchQuery"
              class="yy-field-sm w-[260px] max-[520px]:w-full"
              placeholder="搜索产品、SKU、POI、商品名"
              type="text"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">
            展示 {{ filteredMappings.length }} 条，已就绪 {{ readyMappings.length }} 条
          </div>
        </div>

        <div v-if="loading" class="space-y-3 p-5">
          <div v-for="item in 4" :key="item" class="h-[78px] animate-pulse border border-amber-topbar-border bg-white/55"></div>
        </div>

        <div v-else-if="filteredMappings.length" class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">本地产品</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">抖音商品</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">外部 ID</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">入口</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="mapping in filteredMappings"
                :key="mapping.backendId"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedMapping?.backendId === mapping.backendId ? 'bg-amber-content-bg' : ''"
                @click="selectedMapping = mapping"
              >
                <td class="px-5 py-4">
                  <div class="text-[11px] font-semibold text-amber-dark">{{ mapping.productName }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ mapping.storeName }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ mapping.externalName || '未填写抖音商品名' }}</div>
                  <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ mapping.channelType }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="space-y-1 font-mono text-[10px] text-amber-text-muted">
                    <div>商品 {{ mapping.externalProductId || '缺失' }}</div>
                    <div>SKU {{ mapping.externalSkuId || '缺失' }}</div>
                    <div>POI {{ mapping.externalPoiId || '缺失' }}</div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="max-w-[300px] break-all font-mono text-[10px] leading-relaxed text-amber-dark">
                    {{ mapping.landingUrl || mapping.landingPath || '未配置落地页' }}
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span
                    class="px-2 py-0.5 text-[10px]"
                    :class="readinessFor(mapping).ready ? 'bg-[#EBF4ED] text-[#2D7A4D]' : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
                  >
                    {{ readinessFor(mapping).ready ? '可投放' : '待补齐' }}
                  </span>
                  <div class="mt-2 text-[10px] text-amber-text-muted">{{ mapping.mappingStatus }}</div>
                  <div v-if="!readinessFor(mapping).ready" class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="field in readinessFor(mapping).missingFields"
                      :key="field"
                      class="border border-[#B8543B]/20 bg-[#B8543B]/5 px-1.5 py-0.5 text-[9.5px] text-[#8C3E2C]"
                    >
                      {{ field === '映射状态' ? '状态未启用' : `缺${field}` }}
                    </span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="flex flex-wrap gap-2">
                    <button
                      class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                      type="button"
                      :title="getCopyableValue(mapping) ? '复制抖音来客落地入口' : '该映射缺少落地入口'"
                      @click.stop="copyLandingEntry(mapping)"
                    >
                      复制入口
                    </button>
                    <button
                      class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                      type="button"
                      @click.stop="copyMissingList(mapping)"
                    >
                      复制待补清单
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="mappings.length === 0" class="px-6 py-12 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前未配置抖音来客商品映射</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">请先在系统后台配置 /yy/channelProductMapping/list 后再刷新。</p>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有抖音产品映射</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可以切换具体门店，或调整关键词和状态筛选。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Mapping Detail</span>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">映射诊断</h3>
        </div>

        <div v-if="selectedMapping" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedMapping.externalName || selectedMapping.productName }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedMapping.storeName }} · {{ selectedMapping.channelType }}</div>
            </div>
            <span
              class="px-2 py-0.5 text-[10px]"
              :class="readinessFor(selectedMapping).ready ? 'bg-[#EBF4ED] text-[#2D7A4D]' : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
            >
              {{ readinessFor(selectedMapping).ready ? 'READY' : 'CHECK' }}
            </span>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Required Fields</dt>
              <dd class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="field in requiredFieldChips(selectedMapping)"
                  :key="field.label"
                  class="border px-2 py-1 text-[10px]"
                  :class="field.ok ? 'border-[#2D7A4D]/20 bg-[#EBF4ED] text-[#2D7A4D]' : 'border-[#B8543B]/20 bg-[#B8543B]/10 text-[#8C3E2C]'"
                >
                  {{ field.label }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Landing</dt>
              <dd class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">
                {{ getCopyableValue(selectedMapping) || '暂无可复制入口' }}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">Remark</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedMapping.remark || '无备注' }}</dd>
            </div>
          </dl>

          <div class="mt-6 border border-amber-topbar-border bg-amber-content-bg p-4">
            <div class="text-[11px] font-semibold text-amber-dark">操作边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              门店工作台只做查看、复制和排障；真实新增、编辑和禁用映射仍在系统后台的 /yy/channelProductMapping/list 对应模块处理。
            </p>
          </div>
        </div>

        <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
          选择一条映射后，可以确认商品 ID、SKU、POI 和抖音来客落地页是否齐全。
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { appStore, type ChannelProductMappingInfo } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { checkDouyinProductReadiness, formatDouyinMissingList } from './douyinProductReadiness'
import { useNotice } from '../../shared/composables/useNotice'

type MappingFilter = 'all' | 'ready' | 'missing' | 'link'

const loading = ref(false)
const activeFilter = ref<MappingFilter>('all')
const storeFilter = ref('')
const searchQuery = ref('')
const mappings = ref<ChannelProductMappingInfo[]>([])
const selectedMapping = ref<ChannelProductMappingInfo | null>(null)
const { notice, pushNotice } = useNotice()

const getCopyableValue = (mapping: ChannelProductMappingInfo) => mapping.landingUrl || mapping.landingPath || ''
const readinessFor = (mapping: ChannelProductMappingInfo) => checkDouyinProductReadiness(mapping)

const requiredFieldChips = (mapping: ChannelProductMappingInfo) => [
  { label: 'Product ID', ok: Boolean(mapping.externalProductId) },
  { label: 'SKU ID', ok: Boolean(mapping.externalSkuId) },
  { label: 'POI ID', ok: Boolean(mapping.externalPoiId) },
  { label: 'Landing', ok: Boolean(getCopyableValue(mapping)) },
  { label: 'Status', ok: !readinessFor(mapping).fields.find(field => field.key === 'mappingStatus')?.missing },
]

const readyMappings = computed(() => mappings.value.filter(item => readinessFor(item).ready))
const missingMappings = computed(() => mappings.value.filter(item => !readinessFor(item).ready))
const linkMappings = computed(() => mappings.value.filter(item => Boolean(getCopyableValue(item))))
const storeOptions = computed(() => Array.from(new Set(mappings.value.map(item => item.storeName).filter(Boolean))))
const concreteStoreOptions = computed(() => {
  const visibleNames = appStore.stores.map(store => store.name).filter(Boolean)
  return visibleNames.filter(name => storeOptions.value.includes(name))
})

const normalizeStoreFilter = (preferred = storeFilter.value) => {
  if (preferred && concreteStoreOptions.value.includes(preferred)) return preferred
  return concreteStoreOptions.value[0] ?? ''
}
const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const filteredMappings = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return mappings.value.filter(mapping => {
    if (!storeFilter.value) return false
    if (activeFilter.value === 'ready' && !readinessFor(mapping).ready) return false
    if (activeFilter.value === 'missing' && readinessFor(mapping).ready) return false
    if (activeFilter.value === 'link' && !getCopyableValue(mapping)) return false
    if (storeFilter.value && mapping.storeName !== storeFilter.value) return false
    if (!query) return true
    const haystack = `${mapping.storeName} ${mapping.productName} ${mapping.channelType} ${mapping.externalName} ${mapping.externalProductId} ${mapping.externalSkuId} ${mapping.externalPoiId} ${getCopyableValue(mapping)} ${mapping.remark}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部映射', count: mappings.value.length },
  { key: 'ready' as const, label: '可投放', count: readyMappings.value.length },
  { key: 'missing' as const, label: '待补齐', count: missingMappings.value.length },
  { key: 'link' as const, label: '有入口', count: linkMappings.value.length },
])

const cards = computed(() => [
  {
    label: '抖音映射',
    value: String(mappings.value.length),
    hint: '来自 /yy/channelProductMapping/list 的 DOUYIN_LIFE 映射。',
    scope: 'ALL',
  },
  {
    label: '可投放',
    value: String(readyMappings.value.length),
    hint: '商品、SKU、POI 和落地页均已补齐。',
    scope: '可用',
  },
  {
    label: '待补齐',
    value: String(missingMappings.value.length),
    hint: '缺少外部 ID、POI、入口或状态未启用。',
    scope: 'CHECK',
  },
  {
    label: '订单归集',
    value: 'yy_order',
    hint: '抖音支付完成后同步到本地统一订单表。',
    scope: 'CORE',
  },
])

const reload = async () => {
  loading.value = true
  try {
    await ensureWorkbenchStores()
    const next = await appStore.loadChannelProductMappings('DOUYIN_LIFE')
    mappings.value = [...next]
    storeFilter.value = normalizeStoreFilter()
    selectedMapping.value = filteredMappings.value[0] ?? null
  } catch (error) {
    pushNotice('error', error instanceof Error ? `抖音产品加载失败：${error.message}` : '抖音产品加载失败')
  } finally {
    loading.value = false
  }
}

const copyMissingList = async (mapping: ChannelProductMappingInfo) => {
  const text = formatDouyinMissingList(mapping)
  try {
    await navigator.clipboard?.writeText(text)
    pushNotice('success', '待补清单已复制到剪贴板')
  } catch {
    pushNotice('error', '复制失败，请手动选择文本复制')
  }
}

const copyLandingEntry = async (mapping: ChannelProductMappingInfo) => {
  const entry = getCopyableValue(mapping)
  if (!entry) {
    pushNotice('error', '该映射缺少落地入口，请先复制待补清单给系统后台补齐')
    return
  }
  try {
    await navigator.clipboard?.writeText(entry)
    pushNotice('success', '抖音来客入口已复制')
  } catch {
    pushNotice('error', '复制失败，请手动选择入口文本复制')
  }
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
