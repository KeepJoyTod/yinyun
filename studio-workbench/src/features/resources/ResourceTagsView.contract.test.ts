import { describe, expect, it } from 'vitest'
import viewSource from './ResourceTagsView.vue?raw'
import tableSource from './components/ResourceTagTable.vue?raw'
import composableSource from './composables/useResourceTagMutations.ts?raw'
import operationsSource from './resourceTagOperations.ts?raw'

const contractSource = [viewSource, tableSource, composableSource, operationsSource].join('\n')

describe('resource tags contract', () => {
  it('keeps tag list, mutations and navigation in dedicated owners', () => {
    expect(contractSource).toContain('ResourceTagTable')
    expect(composableSource).toContain('backendApi.createResourceTag')
    expect(composableSource).toContain('backendApi.updateResourceTag')
    expect(composableSource).toContain('backendApi.deleteResourceTag')
  })

  it('requires store selection before creating a tag', () => {
    expect(viewSource).toContain('!createTagName || !createStoreId || submitting')
    expect(viewSource).toContain("if (!createStoreId.value) return")
  })

  it('links tag rows back to resource manage filters', () => {
    expect(viewSource).toContain("path: '/resource/manage'")
    expect(viewSource).toContain("query: { tagIds: id }")
    expect(operationsSource).toContain('不会删除资源主记录')
  })
})
