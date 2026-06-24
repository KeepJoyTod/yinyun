import { describe, expect, it } from 'vitest'
import { buildResourceEmptyState, canRunBatchAction, formatFileSize, getResourceTypeLabel } from './resourceManageOperations'
import { createDefaultResourceManageFilters } from './resourceTypes'

describe('resourceManageOperations', () => {
  it('formats real file sizes', () => {
    expect(formatFileSize(0)).toBe('未回填')
    expect(formatFileSize(1024)).toContain('KB')
    expect(formatFileSize(1024 ** 2)).toContain('MB')
  })

  it('maps resource type labels', () => {
    expect(getResourceTypeLabel('RAW')).toBe('原片')
    expect(getResourceTypeLabel('')).toBe('未分类')
  })

  it('keeps batch actions disabled without selection or payload', () => {
    expect(canRunBatchAction([], {})).toBe(false)
    expect(canRunBatchAction(['1'], { rating: 5 })).toBe(true)
  })

  it('switches empty copy when filters are active', () => {
    const base = createDefaultResourceManageFilters()
    expect(buildResourceEmptyState(base).title).toContain('当前还没有资源记录')
    expect(buildResourceEmptyState({ ...base, keyword: 'Alice' }).title).toContain('当前筛选没有匹配资源')
  })
})
