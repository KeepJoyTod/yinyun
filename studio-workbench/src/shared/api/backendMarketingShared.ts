import { pageQuery } from './backendQueryMappers'
import { normalizeBackendId, optionalBackendId, type BackendId } from './backendId'
import { apiRequestRaw } from './request'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'

type QueryValue = string | number | boolean | null | undefined

export type MarketingQuery = Record<string, QueryValue>

export const listMarketingRows = async <T>(path: string, query?: MarketingQuery) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

export const toBackendIds = (values?: Array<string | number | null | undefined> | null): BackendId[] =>
  Array.isArray(values) ? values.filter(value => value !== null && value !== undefined && value !== '').map(value => normalizeBackendId(value)) : []

export const toBackendId = (value: string | number): BackendId => normalizeBackendId(value)

export const toOptionalBackendId = (value?: string | number | null): BackendId | undefined => optionalBackendId(value)
