import { apiRequest, apiRequestBlob, type BlobResponse } from './request'
import type { BackendId } from './backendId'
import {
  mapDashboardConversionQuery,
  mapDashboardExportQuery,
  mapDashboardFinanceQuery,
  mapDashboardOrderStatusStatsQuery,
  mapDashboardProductRankingQuery,
  mapDashboardTodaySlotsQuery,
  mapDashboardTrendStatsQuery,
  toFormBody,
} from './backendQueryMappers'
import {
  mapDashboardConversionRow,
  mapDashboardFinanceRow,
  mapDashboardOrderStatusStatRow,
  mapDashboardProductRanking,
  mapDashboardTodaySlotRow,
  mapDashboardTrendStatRow,
  mapScheduleGridRow,
} from './backendRowMappers'
import type {
  DashboardConversionDto,
  DashboardExportQuery,
  DashboardFinanceDto,
  DashboardProductRankingDto,
  DashboardProductRankingQuery,
  DashboardScopeQuery,
  DashboardScheduleGridDto,
  DashboardTrendStatsQuery,
  OrderStatusStatDto,
  TodaySlotDto,
  TrendStatDto,
} from './backendTypes'

export const dashboardApi = {
  async dashboardFinance(query: DashboardScopeQuery = {}): Promise<DashboardFinanceDto> {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/finance', {}, mapDashboardFinanceQuery(query))
    return mapDashboardFinanceRow(row)
  },
  async orderStatusStats(query: DashboardScopeQuery = {}): Promise<OrderStatusStatDto[]> {
    const rows = await apiRequest<Record<string, any>[]>('/yy/dashboard/order-status-stats', {}, mapDashboardOrderStatusStatsQuery(query))
    return Array.isArray(rows) ? rows.map(row => mapDashboardOrderStatusStatRow(row)) : []
  },
  async trendStats(query: DashboardTrendStatsQuery = {}): Promise<TrendStatDto[]> {
    const rows = await apiRequest<Record<string, any>[]>('/yy/dashboard/trend-stats', {}, mapDashboardTrendStatsQuery(query))
    return Array.isArray(rows) ? rows.map(row => mapDashboardTrendStatRow(row)) : []
  },
  async todaySlots(query: DashboardScopeQuery = {}): Promise<TodaySlotDto[]> {
    const rows = await apiRequest<Record<string, any>[]>('/yy/dashboard/today-slots', {}, mapDashboardTodaySlotsQuery(query))
    return Array.isArray(rows) ? rows.map(row => mapDashboardTodaySlotRow(row)) : []
  },
  async dashboardProductRanking(query: DashboardProductRankingQuery = {}): Promise<DashboardProductRankingDto> {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/product-ranking', {}, mapDashboardProductRankingQuery(query))
    return mapDashboardProductRanking(row)
  },
  async dashboardConversion(query: DashboardScopeQuery = {}): Promise<DashboardConversionDto> {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/conversion', {}, mapDashboardConversionQuery(query))
    return mapDashboardConversionRow(row)
  },
  async dashboardScheduleGrid(query: { storeId?: BackendId } = {}): Promise<DashboardScheduleGridDto> {
    const row = await apiRequest<Record<string, any>>('/yy/dashboard/schedule-grid', {}, {
      storeId: query.storeId,
    })
    return mapScheduleGridRow(row)
  },
  async exportDashboard(query: DashboardExportQuery): Promise<BlobResponse> {
    const body = toFormBody(mapDashboardExportQuery(query))
    return apiRequestBlob('/yy/dashboard/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  },
}
