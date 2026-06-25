import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductConfigListQuery, ProductFulfillmentRuleDto } from './backendProductConfigTypes'

const path = '/yy/productFulfillmentRule'

export const productFulfillmentRuleApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductFulfillmentRuleDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductFulfillmentRuleDto>(`${path}/${id}`)
  },
  save(payload: ProductFulfillmentRuleDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
