import { describe, expect, it } from 'vitest'
import { buildTagDeleteMessage, buildTagEmptyState, sortTagsByUsage } from './resourceTagOperations'

describe('resourceTagOperations', () => {
  it('builds the delete confirmation from real tag usage', () => {
    expect(buildTagDeleteMessage({ tagName: '精修待复核', resourceCount: 3 })).toContain('3')
    expect(buildTagDeleteMessage({ tagName: '精修待复核', resourceCount: 3 })).toContain('不会删除资源主记录')
  })

  it('keeps empty states honest', () => {
    expect(buildTagEmptyState(false).title).toContain('当前还没有资源标签')
    expect(buildTagEmptyState(true).title).toContain('没有匹配的资源标签')
  })

  it('sorts tags by usage first', () => {
    const rows = sortTagsByUsage([
      { id: '2', storeId: null, storeName: '', tagName: 'B', resourceCount: 1, createBy: null, createTime: '' },
      { id: '1', storeId: null, storeName: '', tagName: 'A', resourceCount: 5, createBy: null, createTime: '' },
    ])
    expect(rows[0]?.tagName).toBe('A')
  })
})
