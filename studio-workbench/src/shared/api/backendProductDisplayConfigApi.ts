import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductConfigListQuery, ProductDisplayConfigDto } from './backendProductConfigTypes'

const path = '/yy/productDisplayConfig'

export const productDisplayConfigApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductDisplayConfigDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductDisplayConfigDto>(`${path}/${id}`)
  },
  save(payload: ProductDisplayConfigDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
