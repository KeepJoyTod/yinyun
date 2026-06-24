import { describe, expect, it } from 'vitest'
import douyinProductsSource from './DouyinProductsView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

describe('douyin products page contract', () => {
  it('replaces the douyin product placeholder with a real route', () => {
    expect(routerSource).toContain('DouyinProductsView.vue')
    expect(getWorkbenchFeature('product-douyin')?.component).toBe('douyin-products')
    expect(getWorkbenchFeature('product-douyin')?.status).toBe('ready')
    expect(getWorkbenchFeature('product-douyin')?.permission).toBe('yy:channel:list')
  })

  it('loads Douyin Life product mappings from the shared store', () => {
    expect(douyinProductsSource).toContain("appStore.loadChannelProductMappings('DOUYIN_LIFE')")
    expect(douyinProductsSource).toContain('/yy/channelProductMapping/list')
    expect(douyinProductsSource).toContain('DOUYIN_LIFE')
  })

  it('shows the operational readiness fields for true order entry', () => {
    expect(douyinProductsSource).toContain('externalProductId')
    expect(douyinProductsSource).toContain('externalSkuId')
    expect(douyinProductsSource).toContain('externalPoiId')
    expect(douyinProductsSource).toContain('landingUrl')
    expect(douyinProductsSource).toContain('landingPath')
    expect(douyinProductsSource).toContain('可投放')
  })

  it('keeps create and edit actions in admin instead of the staff workbench', () => {
    expect(douyinProductsSource).toContain('门店工作台只做查看、复制和排障')
    expect(douyinProductsSource).toContain('/yy/channelProductMapping/list')
    expect(douyinProductsSource).not.toContain('saveChannelProductMapping')
    expect(douyinProductsSource).not.toContain('deleteChannelProductMapping')
  })

  it('has a dedicated "复制待补清单" button and imports the readiness helper', () => {
    expect(douyinProductsSource).toContain('复制待补清单')
    expect(douyinProductsSource).toContain("from './douyinProductReadiness'")
    expect(douyinProductsSource).toContain('formatDouyinMissingList')
  })

  it('lets staff copy a ready Douyin landing entry or get a clear missing-entry reason', () => {
    expect(douyinProductsSource).toContain('复制入口')
    expect(douyinProductsSource).toContain('copyLandingEntry')
    expect(douyinProductsSource).toContain('抖音来客入口已复制')
    expect(douyinProductsSource).toContain('该映射缺少落地入口，请先复制待补清单给系统后台补齐')
  })

  it('shows a clear empty state when no douyin mappings exist', () => {
    expect(douyinProductsSource).toContain('当前未配置抖音来客商品映射')
    expect(douyinProductsSource).toContain('请先在系统后台配置')
  })

  it('scopes mapping filters to concrete staff stores instead of all-store browsing', () => {
    expect(douyinProductsSource).toContain('concreteStoreOptions')
    expect(douyinProductsSource).toContain('normalizeStoreFilter')
    expect(douyinProductsSource).toContain('ensureWorkbenchStores')
    expect(douyinProductsSource).toContain('await ensureWorkbenchStores()')
    expect(douyinProductsSource).not.toContain('<option value="all">全部门店</option>')
    expect(douyinProductsSource).not.toContain("storeFilter.value !== 'all'")
  })
})
