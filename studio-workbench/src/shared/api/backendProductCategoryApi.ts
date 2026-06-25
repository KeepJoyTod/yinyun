import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductCategoryDto, ProductConfigListQuery } from './backendProductConfigTypes'

const path = '/yy/productCategory'

export const productCategoryApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductCategoryDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductCategoryDto>(`${path}/${id}`)
  },
  save(payload: ProductCategoryDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
