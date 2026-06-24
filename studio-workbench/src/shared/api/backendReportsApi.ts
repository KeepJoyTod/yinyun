import { apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import { mapReportSnapshotRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type { ReportSnapshot, ReportSnapshotQuery } from './backendTypes'

let cachedReportSnapshots: ReportSnapshot[] = []

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const reportsApi = {
  async listReportSnapshots(query: ReportSnapshotQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/reportSnapshot/list', {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      ...(query.reportType ? { reportType: query.reportType } : {}),
      ...(query.storeId ? { storeId: String(query.storeId) } : {}),
      ...(query.snapshotDate ? { snapshotDate: query.snapshotDate } : {}),
    })
    cachedReportSnapshots = rows.map(mapReportSnapshotRow)
    return cachedReportSnapshots
  },
}
