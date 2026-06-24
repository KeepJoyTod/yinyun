import { describe, expect, it } from 'vitest'
import viewSource from './ResourceManageView.vue?raw'
import filterSource from './components/ResourceManageFilterBar.vue?raw'
import tableSource from './components/ResourceManageTable.vue?raw'
import drawerSource from './components/ResourceMetaDrawer.vue?raw'
import composableSource from './composables/useResourceManage.ts?raw'
import filterComposableSource from './composables/useResourceManageFilters.ts?raw'
import operationsSource from './resourceManageOperations.ts?raw'

const contractSource = [viewSource, filterSource, tableSource, drawerSource, composableSource, filterComposableSource, operationsSource].join('\n')

describe('resource manage contract', () => {
  it('uses dedicated resource owners instead of the old derived page', () => {
    expect(contractSource).toContain('ResourceManageFilterBar')
    expect(contractSource).toContain('ResourceManageTable')
    expect(contractSource).toContain('ResourceMetaDrawer')
    expect(viewSource).not.toContain('DerivedResourceModuleView')
  })

  it('loads real resource rows and batch updates through backend resource apis', () => {
    expect(composableSource).toContain('backendApi.listResources')
    expect(composableSource).toContain('backendApi.batchUpdateResources')
    expect(composableSource).toContain('backendApi.deleteResource')
    expect(composableSource).toContain('pageNum: page.value')
    expect(composableSource).toContain('pageSize: pageSize.value')
    expect(contractSource).toContain('yy_photo_asset / yy_photo_album')
  })

  it('keeps route query filters in a dedicated composable', () => {
    expect(filterComposableSource).toContain('useRouteQueryFilters')
    expect(filterComposableSource).toContain('productId: filters.productId')
    expect(filterComposableSource).toContain('uploaderKeyword: filters.uploaderKeyword.trim()')
    expect(filterComposableSource).toContain("tagIds: filters.tagIds.join(',')")
    expect(filterComposableSource).toContain('filterSignature')
  })
})
