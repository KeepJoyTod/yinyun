import { describe, expect, it } from 'vitest'
import douyinProductsSource from './DouyinProductsView.vue?raw'
import routerSource from '../../app/router/index.ts?raw'
import moduleViewSource from '../merchant/modules/product/MerchantProductView.vue?raw'
import boardSource from '../merchant/modules/product/components/MerchantProductReadinessBoard.vue?raw'
import stateSource from '../merchant/modules/product/composables/useMerchantProductState.ts?raw'
import operationsSource from '../merchant/modules/product/merchantProductOperations.ts?raw'
import { getWorkbenchFeature } from '../../app/router/featureRegistry'

const douyinProductsContractSource = `${douyinProductsSource}\n${moduleViewSource}\n${boardSource}\n${stateSource}\n${operationsSource}`

describe('douyin products page contract', () => {
  it('replaces the douyin product placeholder with a real route', () => {
    expect(routerSource).toContain('modules/product/MerchantProductView.vue')
    expect(moduleViewSource).toContain('DouyinProductsView.vue')
    expect(getWorkbenchFeature('product-douyin')?.component).toBe('douyin-products')
    expect(getWorkbenchFeature('product-douyin')?.status).toBe('ready')
  })

  it('loads Douyin Life product mappings from the shared store and merchant product scaffold', () => {
    expect(douyinProductsContractSource).toContain('DouyinProductsView')
    expect(douyinProductsContractSource).toContain('useMerchantProductState')
    expect(douyinProductsContractSource).toContain("appStore.loadChannelProductMappings('DOUYIN_LIFE')")
    expect(douyinProductsSource).toContain('/yy/channelProductMapping/list')
  })

  it('shows the operational readiness fields for true order entry', () => {
    expect(douyinProductsSource).toContain('externalProductId')
    expect(douyinProductsSource).toContain('externalSkuId')
    expect(douyinProductsSource).toContain('externalPoiId')
    expect(douyinProductsSource).toContain('landingUrl')
    expect(douyinProductsSource).toContain('landingPath')
  })

  it('keeps create and edit actions in admin instead of the staff workbench', () => {
    expect(douyinProductsSource).toContain('/yy/channelProductMapping/list')
    expect(douyinProductsSource).not.toContain('saveChannelProductMapping')
    expect(douyinProductsSource).not.toContain('deleteChannelProductMapping')
  })

  it('has a dedicated missing-list button and imports the readiness helper', () => {
    expect(douyinProductsContractSource).toContain('All mappings')
    expect(douyinProductsContractSource).toContain('getProductMissingList')
  })
})
