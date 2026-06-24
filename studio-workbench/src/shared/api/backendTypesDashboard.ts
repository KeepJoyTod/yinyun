import type { BackendId } from './backendId'

export type DashboardScopeQuery = {
  date?: string
  bizDate?: string
  storeId?: BackendId
  storeBackendId?: BackendId
}

export type DashboardTrendStatsQuery = DashboardScopeQuery & {
  endDate?: string
  days?: number
}

export type DashboardProductRankingQuery = DashboardScopeQuery & {
  topN?: number
}

export type DashboardProductRankingRowDto = {
  rank: number
  productName: string
  orderCount: number
  amountCents: number
}

export type DashboardProductRankingDto = {
  byOrderCount: DashboardProductRankingRowDto[]
  byAmount: DashboardProductRankingRowDto[]
}

export type DashboardConversionDto = {
  date: string
  storeId: BackendId | null
  bookedCount: number
  paidCount: number
  arrivedCount: number
  completedCount: number
  paidRate: number
  arrivedRate: number
  completedRate: number
}
