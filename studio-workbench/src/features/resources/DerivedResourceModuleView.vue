<template>
  <div class="flex flex-col gap-7">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">{{ module.eyebrow }}</span>
          <h2 class="mt-1 font-sans text-[17.5px] font-medium text-amber-dark">{{ module.title }}</h2>
          <p class="mt-1 max-w-[820px] text-[10.5px] leading-relaxed text-amber-text-muted">{{ module.description }}</p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="router.push('/service/photos')"
        >
          打开客片管理
        </button>
      </div>
    </section>

    <section class="border border-amber-topbar-border bg-[#FBF8F2]/55">
      <div class="flex flex-wrap items-center gap-2 border-b border-amber-topbar-border p-5">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          class="yy-action border px-3 py-1.5 text-[10.5px]"
          :class="activeFilter === filter.key ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
          type="button"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }} · {{ filter.count }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.label" class="border border-amber-topbar-border bg-amber-content-bg p-4">
          <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
          <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
          <div class="mt-4 flex items-end justify-between gap-3">
            <strong class="font-sans text-[25px] leading-none text-amber-dark">{{ card.value }}</strong>
            <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-text-muted">{{ card.scope }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[900px]:flex-col max-[900px]:items-start">
          <div class="flex flex-wrap items-center gap-3 max-[560px]:w-full">
            <select v-model="serviceFilter" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full">
              <option value="all">全部服务</option>
              <option v-for="service in serviceOptions" :key="service" :value="service">{{ service }}</option>
            </select>
            <input
              v-model.trim="searchQuery"
              class="h-8 w-[270px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none max-[560px]:w-full"
              placeholder="搜索文件、客户、相册、订单"
              type="search"
            />
          </div>
          <div class="text-[10.5px] text-amber-text-muted">展示 {{ filteredItems.length }} 条</div>
        </div>

        <div v-if="filteredItems.length" class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">资源 / 相册</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">归属</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">文件状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">业务状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">动作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="cursor-pointer hover:bg-black/[0.015]"
                :class="selectedItem?.id === item.id ? 'bg-[#FBF8F2]' : ''"
                @click="selectedItem = item"
              >
                <td class="px-5 py-4">
                  <div class="text-[11px] font-medium text-amber-dark">{{ item.title }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.album.id }} · {{ item.album.orderId }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ item.ownerLabel }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ item.album.service }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="font-mono text-[10px] text-amber-text-muted">{{ item.fileLabel }}</div>
                </td>
                <td class="px-5 py-4">
                  <span class="px-2 py-0.5 text-[10px]" :class="stageClass(item.stage)">{{ item.stage }}</span>
                  <span class="ml-2 px-2 py-0.5 text-[10px] bg-[#FBF8F2] text-amber-text-muted">{{ item.album.status }}</span>
                </td>
                <td class="px-5 py-4">
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click.stop="openItem(item)">
                    {{ item.actionLabel }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-12 text-center">
          <div class="font-sans text-[14px] text-amber-dark">{{ module.emptyTitle }}</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">{{ module.emptyHint }}</p>
          <button
            v-if="activeFilter !== 'all' || serviceFilter !== 'all' || searchQuery"
            class="yy-action mt-4 border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark hover:bg-black/5"
            type="button"
            @click="resetFilters"
          >
            清空筛选
          </button>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Resource Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">{{ module.title }}详情</h3>
        </div>
        <div v-if="selectedItem" class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ selectedItem.title }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ selectedItem.subtitle }}</div>
            </div>
            <span class="border border-amber-topbar-border bg-[#FBF8F2] px-2 py-1 text-[10px] text-amber-dark">{{ selectedItem.stage }}</span>
          </div>

          <div class="mt-5 aspect-[4/3] overflow-hidden border border-amber-topbar-border bg-[#EBE4D6]">
            <img v-if="selectedItem.photo.url" :src="selectedItem.photo.url" class="h-full w-full object-cover grayscale-[0.12]" />
            <div v-else class="flex h-full items-center justify-center p-5 text-center text-[10.5px] text-amber-text-muted">
              缺文件访问地址，请回到客片管理检查 objectKey 和 OSS 同步。
            </div>
          </div>

          <dl class="mt-5 space-y-4">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">下一步</dt>
              <dd class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.nextAction }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">Private OSS</dt>
              <dd class="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-amber-dark">
                {{ selectedItem.photo.url || '无 URL，仅保留数据库归属排查' }}
              </dd>
            </div>
          </dl>

          <button class="yy-action mt-6 w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" @click="openItem(selectedItem)">
            {{ selectedItem.actionLabel }}
          </button>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">{{ selectedItem.boundary }}</p>
          </div>
        </div>
        <div v-else class="px-5 py-10 text-center text-[11px] leading-relaxed text-amber-text-muted">
          <p>选择一条资源后查看文件归属、私有 OSS 状态和下一步处理建议。</p>
          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-4 text-left">
            <div class="text-[11px] font-semibold text-amber-dark">数据边界</div>
            <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
              空态仍显示边界：{{ emptyBoundary }}
            </p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import { buildDerivedResourceItems, getDerivedResourceModule, type DerivedResourceItem, type DerivedResourceStage } from './derivedResourceModules'

const moduleLabelExamples = '文件资源 样片作品'
void moduleLabelExamples

type QuickFilter = 'all' | 'ready' | 'issue' | 'sample'

const route = useRoute()
const router = useRouter()
const activeFilter = ref<QuickFilter>('all')
const serviceFilter = ref('all')
const searchQuery = ref('')
const selectedItem = ref<DerivedResourceItem | null>(null)

const module = computed(() => getDerivedResourceModule(String(route.meta.featureKey || route.name || 'resource-files')))
const items = computed(() => buildDerivedResourceItems(module.value, appStore.albums))
const readyItems = computed(() => items.value.filter(item => item.stage === '可访问' || item.stage === '候选样片'))
const issueItems = computed(() => items.value.filter(item => item.stage === '待排查' || item.stage === '待授权'))
const sampleItems = computed(() => items.value.filter(item => item.photo.selected))
const serviceOptions = computed(() => Array.from(new Set(items.value.map(item => item.album.service).filter(Boolean))))
const emptyBoundary = computed(() =>
  module.value.source === 'samples'
    ? '样片作品只从 yy_photo_album 和 yy_photo_asset 派生候选，正式发布需客户授权。'
    : '文件资源只读相册底片和私有 OSS 归属，不暴露永久 OSS 地址。',
)

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => {
    if (activeFilter.value === 'ready' && !(item.stage === '可访问' || item.stage === '候选样片')) return false
    if (activeFilter.value === 'issue' && !(item.stage === '待排查' || item.stage === '待授权')) return false
    if (activeFilter.value === 'sample' && !item.photo.selected) return false
    if (serviceFilter.value !== 'all' && item.album.service !== serviceFilter.value) return false
    if (!query) return true
    const haystack = `${item.title} ${item.subtitle} ${item.album.id} ${item.album.orderId} ${item.album.customer} ${item.album.service} ${item.photo.name}`.toLowerCase()
    return haystack.includes(query)
  })
})

const quickFilters = computed(() => [
  { key: 'all' as const, label: '全部', count: items.value.length },
  { key: 'ready' as const, label: module.value.source === 'samples' ? '候选样片' : '可访问', count: readyItems.value.length },
  { key: 'issue' as const, label: '待处理', count: issueItems.value.length },
  { key: 'sample' as const, label: '已选照片', count: sampleItems.value.length },
])

const cards = computed(() => [
  { label: module.value.title, value: String(items.value.length), hint: '当前模块匹配到的相册照片资源数量。', scope: 'PHOTO' },
  { label: module.value.source === 'samples' ? '候选样片' : '可访问', value: String(readyItems.value.length), hint: '可用于排查、交付或进入样片候选流程。', scope: '可用' },
  { label: '待处理', value: String(issueItems.value.length), hint: '缺访问地址、缺授权或仍需人工确认的资源。', scope: '处理' },
  { label: '数据来源', value: '相册', hint: '统一读取 yy_photo_album / yy_photo_asset，不建立第二套资源账本。', scope: '边界' },
])

const openItem = (item: DerivedResourceItem) => {
  router.push(item.actionPath)
}

const resetFilters = () => {
  activeFilter.value = 'all'
  serviceFilter.value = 'all'
  searchQuery.value = ''
}

const stageClass = (stage: DerivedResourceStage) => {
  if (stage === '可访问' || stage === '候选样片') return 'bg-[#EBF4ED] text-[#2D7A4D]'
  return 'bg-[#B8543B]/10 text-[#8C3E2C]'
}

watch(
  [filteredItems, module],
  ([nextItems]) => {
    if (!nextItems.some(item => item.id === selectedItem.value?.id)) selectedItem.value = nextItems[0] ?? null
  },
  { immediate: true },
)

watch(module, () => {
  resetFilters()
})
</script>
