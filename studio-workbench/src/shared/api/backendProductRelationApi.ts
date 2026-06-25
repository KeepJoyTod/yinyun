import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductConfigListQuery, ProductRelationDto } from './backendProductConfigTypes'

const path = '/yy/productRelation'

export const productRelationApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductRelationDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductRelationDto>(`${path}/${id}`)
  },
  save(payload: ProductRelationDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
