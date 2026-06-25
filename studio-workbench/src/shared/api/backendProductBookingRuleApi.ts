import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductBookingRuleDto, ProductConfigListQuery } from './backendProductConfigTypes'

const path = '/yy/productBookingRule'

export const productBookingRuleApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductBookingRuleDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductBookingRuleDto>(`${path}/${id}`)
  },
  save(payload: ProductBookingRuleDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
