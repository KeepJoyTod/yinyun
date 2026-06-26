import { beforeEach, describe, expect, it, vi } from 'vitest'
import { studioAccessStore } from '../../../shared/stores/studioAccessStore'
import type { OrderAnalysisScaffoldDto } from '../../../shared/api/backend'

const { getOrderAnalysisOverview } = vi.hoisted(() => ({
  getOrderAnalysisOverview: vi.fn(),
}))

vi.mock('../../../shared/api/backend', () => ({
  backendApi: {
    getOrderAnalysisOverview,
  },
}))

const buildScaffold = (override: Partial<OrderAnalysisScaffoldDto> = {}): OrderAnalysisScaffoldDto => ({
  overview: {
    orderedCount: 0,
    paidOrderCount: 0,
    paidAmountCent: 0,
    refundOrderCount: 0,
    refundAmountCent: 0,
    pendingAttentionCount: 0,
    boundaryNote: 'fallback note',
  },
  funnel: [],
  channels: [],
  refunds: [],
  ...override,
})

describe('useOrderAnalysisReport', () => {
  beforeEach(() => {
    studioAccessStore.reset()
    studioAccessStore.useDemoAccess('qa-admin')
    getOrderAnalysisOverview.mockReset()
  })

  it('keeps the scaffold in a real empty state when the backend returns no rows', async () => {
    getOrderAnalysisOverview.mockResolvedValue(buildScaffold())
    const { useOrderAnalysisReport } = await import('./useOrderAnalysisReport')

    const state = useOrderAnalysisReport()
    await state.reload()

    expect(getOrderAnalysisOverview).toHaveBeenCalledWith({
      storeId: undefined,
      dateFrom: state.dateStart.value,
      dateTo: state.dateEnd.value,
    })
    expect(state.error.value).toBe('')
    expect(state.hasData.value).toBe(false)
    expect(state.data.value.overview.boundaryNote).toBe('fallback note')
  })

  it('surfaces backend failures and falls back to the local empty scaffold', async () => {
    getOrderAnalysisOverview.mockRejectedValue(new Error('report api down'))
    const { useOrderAnalysisReport } = await import('./useOrderAnalysisReport')

    const state = useOrderAnalysisReport()
    await state.reload()

    expect(state.error.value).toBe('report api down')
    expect(state.hasData.value).toBe(false)
    expect(state.data.value.overview.orderedCount).toBe(0)
    expect(state.data.value.funnel).toEqual([])
    expect(state.data.value.channels).toEqual([])
    expect(state.data.value.refunds).toEqual([])
  })
})
