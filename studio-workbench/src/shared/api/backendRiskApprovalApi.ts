import { apiRequest, apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import { mapRiskApprovalRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  RiskApprovalDecisionPayload,
  RiskApprovalDto,
  RiskApprovalListQuery,
} from './backendTypes'

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const riskApprovalApi = {
  async listRiskApprovals(query: RiskApprovalListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/riskApproval/list', query)
    return rows.map(mapRiskApprovalRow)
  },
  async approveRiskApproval(id: RiskApprovalDto['id'], payload: RiskApprovalDecisionPayload = {}) {
    const row = await apiRequest<Record<string, any>>(`/yy/riskApproval/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapRiskApprovalRow(row)
  },
  async rejectRiskApproval(id: RiskApprovalDto['id'], payload: RiskApprovalDecisionPayload = {}) {
    const row = await apiRequest<Record<string, any>>(`/yy/riskApproval/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapRiskApprovalRow(row)
  },
}
