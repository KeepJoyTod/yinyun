import { describe, expect, it } from 'vitest'
import selectionSource from './OnlineSelectionView.vue?raw'
import selectionDetailModalSource from './components/SelectionLinkDetailModal.vue?raw'
import selectionLinksTableSource from './components/SelectionLinksTable.vue?raw'
import appStoreTransformsSource from '../../shared/stores/appStoreTransforms.ts?raw'
import appStoreTypesSource from '../../shared/stores/appStoreTypes.ts?raw'

const selectionContractSource = [
  selectionSource,
  selectionDetailModalSource,
  selectionLinksTableSource,
].join('\n')

describe('online selection operations contract', () => {
  it('exports a selected photo result with explicit action states', () => {
    expect(selectionContractSource).toContain('exportSelectionResult')
    expect(selectionContractSource).toContain('exportingLinkId')
    expect(selectionContractSource).toContain('导出选择结果')
    expect(selectionContractSource).toContain('导出中...')
    expect(selectionSource).toContain('暂无可导出的已选照片')
  })

  it('keeps the backend selected flag in the workbench album model', () => {
    expect(appStoreTypesSource).toContain('selected: boolean')
    expect(appStoreTransformsSource).toContain('selected: dto.selected')
  })

  it('formats the conversion ratio as a percentage', () => {
    expect(selectionSource).toContain('stats.value.extraConversionRate * 100')
  })

  it('filters selection links by status, expiry window and keyword synced to the url', () => {
    expect(selectionSource).toContain('useRouteQueryFilters')
    expect(selectionSource).toContain('applyFromQuery')
    expect(selectionSource).toContain('syncToUrl')
    expect(selectionSource).toContain('filterStatus')
    expect(selectionSource).toContain('filterExpiring')
    expect(selectionSource).toContain('filterSearch')
    expect(selectionSource).toContain('filteredLinks')
    expect(selectionSource).toContain('仅看临期')
    expect(selectionSource).toContain('重置筛选')
    expect(selectionSource).toContain('status:')
    expect(selectionSource).toContain('expiring:')
  })

  it('highlights extra selection count and expiring countdown in the table', () => {
    expect(selectionContractSource).toContain('link.extraCount > 0')
    expect(selectionContractSource).toContain('有加片')
    expect(selectionContractSource).toContain('isLinkExpiringSoon(link)')
    expect(selectionContractSource).toContain('daysUntilExpire(link)')
    expect(selectionContractSource).toContain('剩')
    expect(selectionContractSource).toContain('天')
  })

  it('shows customer submission status next to the link status', () => {
    expect(selectionContractSource).toContain('客户已提交')
    expect(selectionContractSource).toContain('未提交')
    expect(selectionContractSource).toContain('link.selectedCount > 0')
  })

  it('renders an empty state when no link matches the filters', () => {
    expect(selectionSource).toContain('StateView')
    expect(selectionSource).toContain('没有匹配的选片链接')
  })

  it('adds business-stage tabs aligned with the reference (pending-submit / selecting / done)', () => {
    expect(selectionSource).toContain('待提交')
    expect(selectionSource).toContain('待选片')
    expect(selectionSource).toContain('filterStage')
    expect(selectionSource).toContain('linkStage')
    expect(selectionSource).toContain('stageCounts')
    expect(selectionSource).toContain("'pending-submit'")
    expect(selectionSource).toContain("'selecting'")
    expect(selectionSource).toContain('stage:')
  })

  it('accepts dashboard drill-down filters for date scoped selection work', () => {
    expect(selectionSource).toContain('filterDate')
    expect(selectionSource).toContain('linkBusinessDate')
    expect(selectionSource).toContain('date: filterDate.value')
    expect(selectionSource).toContain('linkBusinessDate(link) !== filterDate.value')
    expect(selectionSource).toContain('album?.date || order?.arrivalDate')
  })

  it('renders online selection as a premium customer selection console', () => {
    expect(selectionSource).toContain('selection-hero')
    expect(selectionSource).toContain('在线选片运营台')
    expect(selectionSource).toContain('photo-selection-board')
    expect(selectionSource).toContain('yy-glass-panel')
    expect(selectionSource).toContain('bg-white/58')
    expect(selectionSource).toContain('rounded-[24px]')
    expect(selectionSource).toContain('临期')
  })

  it('shows per-link copy states instead of only a global clipboard alert', () => {
    expect(selectionSource).toContain('useCopyWithState')
    expect(selectionSource).toContain('copyingSelectionKey')
    expect(selectionSource).toContain('copiedSelectionKey')
    expect(selectionContractSource).toContain('复制中')
    expect(selectionContractSource).toContain('已复制')
    expect(selectionSource).toContain('复制失败，请手动选择链接复制')
    expect(selectionContractSource).toContain("$emit('copy-link', link.url")
    expect(selectionContractSource).toContain("$emit('copy-link', link.url")
  })
})
