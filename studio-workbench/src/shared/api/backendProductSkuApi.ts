import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductConfigListQuery, ProductSkuDto } from './backendProductConfigTypes'

const path = '/yy/productSku'

export const productSkuApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductSkuDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductSkuDto>(`${path}/${id}`)
  },
  save(payload: ProductSkuDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
