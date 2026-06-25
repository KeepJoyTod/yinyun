import { apiRequestRaw } from './request'
import { pageQuery } from './backendQueryMappers'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type RuoyiTableResponse<T> = {
  rows?: T[]
  data?: T[]
  total?: number
}

export const extractProductConfigRows = <T>(response: RuoyiTableResponse<T>) =>
  (response.rows ?? response.data ?? []) as T[]

export const listProductConfigRows = async <T>(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractProductConfigRows(response)
}

export const getProductConfigRow = async <T>(path: string) => {
  const response = await apiRequestRaw<RuoyiResponse<T>>(path)
  return response.data as T
}

export const saveProductConfigRow = async <T extends { id?: string | number }>(path: string, payload: T) => {
  await apiRequestRaw<RuoyiResponse<void>>(path, {
    method: payload.id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
  return payload
}

export const removeProductConfigRows = async (path: string, ids: Array<string | number>) => {
  await apiRequestRaw<RuoyiResponse<void>>(`${path}/${ids.join(',')}`, { method: 'DELETE' })
}
