import { apiRequest, apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'
import {
  mapCollaborationPolicyRow,
  mapRetouchProviderRow,
  mapRetouchTaskRow,
  mapServiceLicenseBindingRow,
} from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  CollaborationPolicyPayload,
  RetouchProviderListQuery,
  RetouchProviderPayload,
  RetouchTaskActionPayload,
  RetouchTaskListQuery,
  ServiceLicenseBindingPayload,
} from './backendTypes'

export const serviceProductionApi = {
  async listRetouchTasks(query: RetouchTaskListQuery = {}) {
    const response = await apiRequestRaw<RuoyiTableResponse<Record<string, any>>>(
      '/yy/serviceProduction/retouchTask/list',
      {},
      {
        ...pageQuery,
        storeId: query.storeId,
        providerId: query.providerId,
        status: query.status,
        keyword: query.keyword,
        pageNum: query.pageNum ?? pageQuery.pageNum,
        pageSize: query.pageSize ?? pageQuery.pageSize,
      },
    )
    return extractRuoyiRows(response).map(mapRetouchTaskRow)
  },

  async updateRetouchTask(payload: RetouchTaskActionPayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/serviceProduction/retouchTask/${payload.id}/action`, {
      method: 'POST',
      body: JSON.stringify({
        providerId: payload.providerId,
        quoteAmountCent: payload.quoteAmountCent,
        dueTime: payload.dueTime,
        status: payload.status,
        acceptanceStatus: payload.acceptanceStatus,
        blockReason: payload.blockReason,
        remark: payload.remark,
      }),
    })
    return mapRetouchTaskRow(row)
  },

  async listRetouchProviders(query: RetouchProviderListQuery = {}) {
    const rows = await apiRequest<Record<string, any>[]>(
      '/yy/serviceProduction/retouchProvider/list',
      {},
      {
        keyword: query.keyword,
        applicationStatus: query.applicationStatus,
        status: query.status,
      },
    )
    return rows.map(mapRetouchProviderRow)
  },

  async saveRetouchProvider(payload: RetouchProviderPayload) {
    const row = await apiRequest<Record<string, any>>('/yy/serviceProduction/retouchProvider', {
      method: payload.id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    })
    return mapRetouchProviderRow(row)
  },

  async getCollaborationPolicy() {
    const row = await apiRequest<Record<string, any>>('/yy/serviceProduction/collaborationPolicy')
    return mapCollaborationPolicyRow(row)
  },

  async saveCollaborationPolicy(payload: CollaborationPolicyPayload) {
    const row = await apiRequest<Record<string, any>>('/yy/serviceProduction/collaborationPolicy', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapCollaborationPolicyRow(row)
  },

  async listServiceLicenseBindings(storeId?: string) {
    const rows = await apiRequest<Record<string, any>[]>(
      '/yy/serviceProduction/licenseBinding/list',
      {},
      { storeId },
    )
    return rows.map(mapServiceLicenseBindingRow)
  },

  async saveServiceLicenseBinding(payload: ServiceLicenseBindingPayload) {
    const row = await apiRequest<Record<string, any>>('/yy/serviceProduction/licenseBinding', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapServiceLicenseBindingRow(row)
  },
}
