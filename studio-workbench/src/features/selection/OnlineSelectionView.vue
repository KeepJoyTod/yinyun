<template>
  <div class="flex flex-col gap-[21px] min-h-full">
    <section class="selection-hero yy-glass-panel rounded-[24px] p-6">
      <div class="flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-[0.22em] text-amber-accent">Selection Console</span>
          <h2 class="mt-1 text-[30px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">在线选片运营台</h2>
          <p class="mt-2 max-w-[760px] text-[13.5px] font-sans leading-relaxed text-amber-text-muted">
            这里负责生成链接、催临期、看客户提交状态和导出已选结果，不承载客户拍摄入口，只承接门店后续选片动作。
          </p>
        </div>
        <div class="grid grid-cols-3 gap-2.5 max-[560px]:grid-cols-1 max-[760px]:w-full">
          <div class="rounded-2xl border border-amber-topbar-border/70 bg-white/58 px-4 py-3 shadow-sm backdrop-blur">
            <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">临期链接</div>
            <div class="mt-1 text-[20px] font-sans font-black tabular-nums text-amber-dark">{{ expiringSoonCount }}</div>
            <div class="mt-1 text-[10px] font-sans text-amber-text-muted">需要优先提醒客户</div>
          </div>
          <div class="rounded-2xl border border-amber-topbar-border/70 bg-white/58 px-4 py-3 shadow-sm backdrop-blur">
            <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">已提交</div>
            <div class="mt-1 text-[20px] font-sans font-black tabular-nums text-amber-dark">{{ selectedLinkCount }}</div>
            <div class="mt-1 text-[10px] font-sans text-amber-text-muted">客户已经交回结果</div>
          </div>
          <div class="rounded-2xl border border-amber-topbar-border/70 bg-white/58 px-4 py-3 shadow-sm backdrop-blur">
            <div class="text-[10px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">总链接</div>
            <div class="mt-1 text-[20px] font-sans font-black tabular-nums text-amber-dark">{{ allLinks.length }}</div>
            <div class="mt-1 text-[10px] font-sans text-amber-text-muted">当前选片入口总量</div>
          </div>
        </div>
      </div>
    </section>

    <div class="photo-selection-board flex flex-col gap-[21px] min-h-full">
    <section class="bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden min-h-[105.5px] grid grid-cols-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
      <div class="flex-1 p-[21px] flex flex-col justify-between border-r border-amber-topbar-border">
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">进行中链接</div>
        <div class="text-[24.5px] font-sans font-normal text-amber-dark leading-[24.5px]">{{ stats.activeCount }}</div>
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">近 7 日新增 +{{ stats.newLast7DaysCount }}</div>
      </div>

      <div class="flex-1 p-[21px] flex flex-col justify-between border-r border-amber-topbar-border">
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">平均选片时长</div>
        <div class="text-[24.5px] font-sans font-normal text-amber-dark leading-[24.5px]">{{ averageSelectionDuration }}</div>
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">已完成 {{ stats.completedCount }} 个链接</div>
      </div>

      <div class="flex-1 p-[21px] flex flex-col justify-between border-r border-amber-topbar-border">
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">客户加片转化</div>
        <div class="text-[24.5px] font-sans font-normal text-amber-dark leading-[24.5px]">{{ extraConversionRate }}%</div>
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">入册外平均 +{{ averageExtraCount }} 张</div>
      </div>

      <div class="flex-1 p-[21px] flex flex-col justify-between">
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">本月加片收入</div>
        <div class="text-[24.5px] font-sans font-normal text-amber-dark leading-[24.5px]">¥ {{ monthExtraRevenue }}</div>
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">本月完成 {{ stats.completedThisMonthCount }} 个链接</div>
      </div>
    </section>

    <section class="grid grid-cols-[1.2fr_0.8fr] gap-[21px] max-[900px]:grid-cols-1">
      <div class="bg-amber-content-bg border border-amber-topbar-border rounded-md p-[21px]">
        <div class="flex items-start justify-between gap-5 max-[640px]:flex-col">
          <div class="min-w-0">
            <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">Delivery Queue</div>
            <div class="text-[14px] font-sans font-medium text-amber-dark leading-[17.5px] mt-[3.5px]">今日选片交付动作</div>
            <div class="text-[10.5px] font-sans text-amber-text-muted leading-[1.7] mt-2">
              先催临期链接，再处理已选客户；复制链接或二维码时只给客户入口，不暴露后台地址和 OSS 地址。
            </div>
          </div>
          <div class="flex gap-2 max-[640px]:w-full">
            <div class="min-w-[92px] flex-1 border border-amber-topbar-border bg-white/55 p-3">
              <div class="text-[18px] font-sans text-amber-dark leading-none">{{ expiringSoonCount }}</div>
              <div class="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">临期</div>
            </div>
            <div class="min-w-[92px] flex-1 border border-amber-topbar-border bg-white/55 p-3">
              <div class="text-[18px] font-sans text-amber-dark leading-none">{{ selectedLinkCount }}</div>
              <div class="mt-1 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-text-muted">已选</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[#1A1814] text-[#F4EFE6] border border-[#1A1814] rounded-md p-[21px]">
        <div class="text-[10px] font-mono uppercase tracking-[0.22em] leading-[15px] text-[#F4EFE6]/55">Next Step</div>
        <div class="mt-3 text-[15px] font-sans leading-[1.25]">{{ selectionQueueHeadline }}</div>
        <div class="mt-2 text-[10.5px] font-sans leading-[1.7] text-[#F4EFE6]/68">{{ selectionQueueHint }}</div>
      </div>
    </section>

    <section class="bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden">
      <div class="p-[17.5px_21px] border-b border-amber-topbar-border flex items-center justify-between gap-7 max-[720px]:flex-col max-[720px]:items-start">
        <div class="min-w-0">
          <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-[15px]">Selection Links</div>
          <div class="text-[14px] font-sans font-medium text-amber-dark leading-[17.5px] mt-[3.5px]">在线选片链接</div>
          <div class="text-[10.5px] font-sans text-amber-text-muted leading-[15.75px] mt-[3.5px]">
            分享链接给客户，远程完成选片与加片确认
          </div>
        </div>

        <button
          class="yy-action flex items-center gap-[7px] px-[14px] py-[7px] bg-amber-dark text-[#F4EFE6] rounded-md shadow-sm hover:bg-black/90 transition-colors"
          @click="openGenerate()"
          type="button"
        >
          <img src="../../assets/icons/plus.svg" class="w-[12.25px] h-[12.25px] invert brightness-200" />
          <span class="text-[11.375px] font-mono font-medium uppercase tracking-[0.18em] leading-[17.06px]">生成选片链接</span>
        </button>
      </div>

      <div
        v-if="copyMessage"
        class="mx-[21px] mt-[14px] border px-3 py-2 text-[10.5px] font-sans"
        :class="messageTone === 'error'
          ? 'border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'
          : 'border-[#2D7A4D]/20 bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'"
        role="status"
      >
        {{ copyMessage }}
      </div>

      <!-- 选片业务阶段 tabs（对齐 yuyue123：待提交 / 待选片 / 已完成） -->
      <div class="flex items-center gap-1.5 border-b border-amber-topbar-border px-[21px] py-3 bg-amber-content-bg">
        <button
          v-for="tab in [
            { v: 'all', l: '全部', c: stageCounts.all },
            { v: 'pending-submit', l: '待提交', c: stageCounts['pending-submit'] },
            { v: 'selecting', l: '待选片', c: stageCounts.selecting },
            { v: 'done', l: '已完成', c: stageCounts.done },
          ]"
          :key="tab.v"
          class="yy-action px-3.5 py-1.5 rounded-md text-[13px] font-sans transition-all"
          :class="filterStage === tab.v
            ? 'bg-amber-dark text-[#F4EFE6] font-semibold'
            : 'text-amber-text-muted hover:bg-black/5 hover:text-amber-dark'"
          type="button"
          @click="filterStage = tab.v"
        >
          {{ tab.l }}
          <span class="ml-1.5 font-mono text-[11px]" :class="filterStage === tab.v ? 'text-amber-accent-soft' : 'opacity-55'">{{ tab.c }}</span>
        </button>
      </div>

      <!-- 选片链接筛选区 -->
      <div class="flex flex-wrap items-center gap-[10.5px] border-b border-amber-topbar-border px-[21px] py-[14px] bg-[rgba(235,228,214,0.3)]">
        <input
          v-model="filterSearch"
          type="text"
          placeholder="客户 / 手机号 / 订单号"
          class="h-[30px] w-[200px] border border-amber-topbar-border bg-amber-content-bg px-2.5 text-[11px] font-sans text-amber-dark placeholder:text-amber-dark/40 focus:outline-none focus:border-amber-dark/30"
        />
        <div class="flex items-center gap-1">
          <button
            v-for="opt in [{v:'全部',l:'全部'}, {v:'进行中',l:'进行中'}, {v:'已完成',l:'已完成'}, {v:'已失效',l:'已失效'}]"
            :key="opt.v"
            class="yy-action px-2.5 py-1 border rounded-md text-[10px] font-sans transition-all"
            :class="filterStatus === opt.v ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted hover:bg-white'"
            type="button"
            @click="filterStatus = opt.v"
          >{{ opt.l }}</button>
        </div>
        <label class="flex items-center gap-1.5 text-[10px] font-sans text-amber-text-muted cursor-pointer">
          <input v-model="filterExpiring" type="checkbox" class="accent-amber-accent" />
          仅看临期 (≤3 天)
        </label>
        <span class="ml-auto text-[10px] font-mono uppercase tracking-[0.14em] text-amber-text-muted">
          匹配 {{ links.length }} / {{ allLinks.length }}
        </span>
        <button
          v-if="hasActiveFilter"
          class="yy-action text-[10px] font-sans text-amber-text-muted hover:text-amber-dark"
          type="button"
          @click="resetFilter"
        >重置筛选</button>
      </div>

      <StateView
        :empty="links.length === 0"
        empty-title="没有匹配的选片链接"
        empty-hint="调整筛选条件，或到「客片管理」生成新的选片链接。"
      >
        <SelectionLinksTable
          :links="links"
          :copying-key="copyingSelectionKey"
          :copied-key="copiedSelectionKey"
          :exporting-link-id="exportingLinkId"
          :days-until-expire="daysUntilExpire"
          :is-link-expiring-soon="isLinkExpiringSoon"
          :link-action-label="linkActionLabel"
          :link-status-style="linkStatusStyle"
          @open-detail="openDetail"
          @copy-link="copyLink"
          @export-result="exportSelectionResult"
        />
      </StateView>
    </section>

  <SelectionLinkDetailModal
    :open="detailOpen"
    :link="activeLink"
    :copied="copied"
    :copying-key="copyingSelectionKey"
    :copied-key="copiedSelectionKey"
    :exporting="Boolean(activeLink && exportingLinkId === activeLink.id)"
    :action-label="activeLink ? linkActionLabel(activeLink) : ''"
    @close="closeDetail"
    @copy-link="copyLink"
    @export-result="exportSelectionResult"
    @qr-downloaded="handleQrDownloaded"
  />
  </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StateView from '../../shared/components/feedback/StateView.vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { useRouteQueryFilters } from '../../shared/composables/useRouteQueryFilters'
import { appStore, type SelectionLink } from '../../shared/stores/appStore'
import SelectionLinkDetailModal from './components/SelectionLinkDetailModal.vue'
import SelectionLinksTable from './components/SelectionLinksTable.vue'
import { downloadSelectionResultCsv } from './selectionExport'

const route = useRoute()
const router = useRouter()
const allLinks = computed(() => appStore.selectionLinks)
const stats = computed(() => appStore.selectionStats)

// 筛选条件（同步到 URL：?status=&expiring=&q=&stage=，保留现有 open 参数）
const filterStatus = ref('全部')
const filterExpiring = ref(false)
const filterSearch = ref('')
const filterDate = ref('')
// 选片业务阶段 tabs（对齐 yuyue123：待提交 / 待选片 / 已完成）
const filterStage = ref('all') // all / pending-submit / selecting / done

const linkStage = (link: SelectionLink): 'pending-submit' | 'selecting' | 'done' | 'other' => {
  if (link.status === '已完成') return 'done'
  if (link.status === '进行中') return link.selectedCount > 0 ? 'selecting' : 'pending-submit'
  return 'other'
}

const stageCounts = computed(() => {
  const links = allLinks.value
  return {
    all: links.length,
    'pending-submit': links.filter(l => linkStage(l) === 'pending-submit').length,
    selecting: links.filter(l => linkStage(l) === 'selecting').length,
    done: links.filter(l => linkStage(l) === 'done').length,
  }
})

const linkBusinessDate = (link: SelectionLink) => {
  const album = appStore.albums.find(item => item.backendId === link.albumBackendId || item.id === link.albumId)
  const order = appStore.orders.find(item => item.backendId === link.orderBackendId || item.id === link.orderId)
  return album?.date || order?.arrivalDate || ''
}

const filteredLinks = computed(() => {
  const keyword = filterSearch.value.trim().toLowerCase()
  return allLinks.value.filter(link => {
    if (filterDate.value && linkBusinessDate(link) !== filterDate.value) return false
    if (filterStatus.value !== '全部' && link.status !== filterStatus.value) return false
    if (filterExpiring.value && !isLinkExpiringSoon(link)) return false
    if (filterStage.value !== 'all') {
      if (filterStage.value === 'done' && linkStage(link) !== 'done') return false
      if (filterStage.value === 'selecting' && linkStage(link) !== 'selecting') return false
      if (filterStage.value === 'pending-submit' && linkStage(link) !== 'pending-submit') return false
    }
    if (keyword) {
      const hay = `${link.customer} ${link.phone} ${link.id} ${link.orderId ?? ''}`.toLowerCase()
      if (!hay.includes(keyword)) return false
    }
    return true
  })
})

// 暴露给模板的别名
const links = filteredLinks

const firstVisibleLink = computed(() => links.value[0] ?? allLinks.value[0] ?? null)

const { applyFromQuery, syncToUrl, isDateKey } = useRouteQueryFilters({
  buildQuery: () => ({
    status: filterStatus.value === '全部' ? '' : filterStatus.value,
    expiring: filterExpiring.value ? '1' : '',
    q: filterSearch.value.trim(),
    date: filterDate.value,
    stage: filterStage.value === 'all' ? '' : filterStage.value,
  }),
  parseQuery: get => {
    const date = get('date')
    if (date && isDateKey(date)) filterDate.value = date
    const status = get('status')
    if (status) filterStatus.value = status
    const expiring = get('expiring')
    filterExpiring.value = expiring === '1'
    const q = get('q')
    if (q) filterSearch.value = q
    const stage = get('stage')
    if (['all', 'pending-submit', 'selecting', 'done'].includes(stage)) filterStage.value = stage
  },
})

onMounted(() => {
  applyFromQuery()
})

watch([filterStatus, filterExpiring, filterSearch, filterDate, filterStage], () => {
  syncToUrl()
})

const hasActiveFilter = computed(
  () => filterStatus.value !== '全部' || filterExpiring.value || filterSearch.value.trim() !== '' || filterDate.value !== '' || filterStage.value !== 'all',
)
const resetFilter = () => {
  filterStatus.value = '全部'
  filterStage.value = 'all'
  filterExpiring.value = false
  filterSearch.value = ''
  filterDate.value = ''
}

const formatFixed = (value: number, digits = 1) => {
  const fixed = value.toFixed(digits)
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed
}

const averageSelectionDuration = computed(() => {
  const minutes = stats.value.averageSelectionMinutes
  if (minutes < 60) return `${Math.round(minutes)} 分钟`
  const days = minutes / 1440
  if (days >= 1) return `${formatFixed(days)} 天`
  return `${formatFixed(minutes / 60)} 小时`
})

const extraConversionRate = computed(() => formatFixed(stats.value.extraConversionRate * 100))
const averageExtraCount = computed(() => formatFixed(stats.value.averageExtraCount))
const monthExtraRevenue = computed(() =>
  (stats.value.monthExtraRevenueCents / 100).toLocaleString('zh-CN', { maximumFractionDigits: 0 }),
)

const detailOpen = ref(false)
const activeLink = ref<SelectionLink | null>(null)
const copied = ref(false)
const copyMessage = ref('')
const messageTone = ref<'success' | 'error'>('success')
const exportingLinkId = ref<string | null>(null)
const { copyingKey: copyingSelectionKey, copiedKey: copiedSelectionKey, copyText: copySelectionText } = useCopyWithState()

const selectedLinkCount = computed(() => allLinks.value.filter(link => link.selectedCount > 0).length)
const expiringSoonCount = computed(() => allLinks.value.filter(link => isLinkExpiringSoon(link)).length)
const selectionQueueHeadline = computed(() => {
  if (expiringSoonCount.value > 0) return `${expiringSoonCount.value} 个链接需要催客户确认`
  if (selectedLinkCount.value > 0) return `${selectedLinkCount.value} 个客户已有选片记录`
  return '暂无紧急选片待办'
})
const selectionQueueHint = computed(() => {
  if (expiringSoonCount.value > 0) return '优先打开临期链接，复制入口或二维码发给客户，避免相册过期后重新生成。'
  if (selectedLinkCount.value > 0) return '进入链接详情确认已选张数和加片数量，下一步交给精修和最终交付。'
  return '可以从客片管理页选择相册生成选片链接，或在这里新建演示链接。'
})

const openDetail = async (link: SelectionLink) => {
  activeLink.value = link
  copied.value = false
  detailOpen.value = true
  await nextTick()
}

const closeDetail = () => {
  detailOpen.value = false
  copied.value = false
  router.replace({ query: { ...route.query, open: undefined } })
}

const copyLink = async (url: string, key = activeLink.value ? `selection-${activeLink.value.id}` : 'selection-link') => {
  const ok = await copySelectionText(url, key)
  if (ok) {
    copied.value = true
    messageTone.value = 'success'
    copyMessage.value = '已复制客户选片入口，可以直接发给客户。'
    window.setTimeout(() => (copied.value = false), 1200)
    window.setTimeout(() => (copyMessage.value = ''), 2200)
    return
  }
  copied.value = false
  messageTone.value = 'error'
  copyMessage.value = '复制失败，请手动选择链接复制。'
  window.setTimeout(() => (copyMessage.value = ''), 2600)
}

const handleQrDownloaded = () => {
  messageTone.value = 'success'
  copyMessage.value = '二维码已下载，适合发到门店工作群或打印给客户扫码。'
  window.setTimeout(() => (copyMessage.value = ''), 2200)
}

const exportSelectionResult = async (link: SelectionLink) => {
  exportingLinkId.value = link.id
  copyMessage.value = ''
  try {
    const album = appStore.albums.find(item =>
      item.backendId === link.albumBackendId || item.id === link.albumId,
    )
    if (!album) throw new Error('未找到该选片链接对应的相册')
    const details = await appStore.loadAlbumDetails(album.id)
    if (!details) throw new Error('相册详情加载失败，请重试')
    if (!details.negatives.some(photo => photo.selected)) {
      throw new Error('暂无可导出的已选照片')
    }
    downloadSelectionResultCsv(link, details)
    messageTone.value = 'success'
    copyMessage.value = `已导出 ${details.negatives.filter(photo => photo.selected).length} 张客户选择结果。`
  } catch (error) {
    messageTone.value = 'error'
    copyMessage.value = error instanceof Error ? error.message : '导出选择结果失败，请重试'
  } finally {
    exportingLinkId.value = null
    window.setTimeout(() => (copyMessage.value = ''), 3000)
  }
}

const openGenerate = async () => {
  const link = await appStore.generateSelectionLink({})
  router.replace({ query: { ...route.query, open: link.id } })
  openDetail(link)
}

watch(
  () => route.query.open,
  async (open) => {
    if (typeof open !== 'string' || open.trim().length === 0) return
    const link = appStore.findSelectionLink(open)
    if (!link) return
    await openDetail(link)
  },
  { immediate: true }
)

watch(
  links,
  next => {
    if (!detailOpen.value && firstVisibleLink.value && !activeLink.value) {
      activeLink.value = firstVisibleLink.value
      return
    }
    if (activeLink.value && !next.some(link => link.id === activeLink.value?.id)) {
      activeLink.value = next[0] ?? null
    }
  },
  { immediate: true }
)

const parseExpireDate = (expire: string) => {
  const [month, day] = expire.split('-').map(Number)
  if (!month || !day) return null
  const date = new Date()
  date.setMonth(month - 1, day)
  date.setHours(23, 59, 59, 999)
  return date
}

const daysUntilExpire = (link: SelectionLink) => {
  const expireDate = parseExpireDate(link.expire)
  if (!expireDate) return Number.POSITIVE_INFINITY
  return Math.ceil((expireDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

const isLinkExpiringSoon = (link: SelectionLink) => link.status === '进行中' && daysUntilExpire(link) <= 3

const linkActionLabel = (link: SelectionLink) => {
  if (link.status === '已失效') return '已失效'
  if (link.status === '已完成') return '已完成'
  if (isLinkExpiringSoon(link)) return '临期催选'
  if (link.selectedCount > 0) return '待精修'
  return '待客户选'
}

const linkStatusStyle = (link: SelectionLink) => {
  if (link.status === '已完成') return 'border-[#2D7A4D]/25 text-[#2D7A4D]'
  if (link.status === '已失效' || isLinkExpiringSoon(link)) return 'border-amber-accent/30 text-amber-accent'
  return 'border-amber-topbar-border text-amber-text-muted'
}
</script>
