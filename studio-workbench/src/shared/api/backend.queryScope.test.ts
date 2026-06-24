import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildAllOrdersQuery } from './backend'

describe('backend order query scope', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('limits historical ledger orders to recent 30-day Douyin Life orders', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T10:00:00+08:00'))

    expect(buildAllOrdersQuery()).toEqual({
      pageNum: 1,
      pageSize: 5000,
      source: 'DOUYIN_LIFE',
      beginOrderTime: '2026-05-18 00:00:00',
      endOrderTime: '2026-06-16 23:59:59',
    })
  })
})
