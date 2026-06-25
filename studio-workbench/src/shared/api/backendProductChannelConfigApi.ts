import { getProductConfigRow, listProductConfigRows, removeProductConfigRows, saveProductConfigRow } from './backendProductConfigShared'
import type { ProductChannelConfigDto, ProductConfigListQuery } from './backendProductConfigTypes'

const path = '/yy/productChannelConfig'

export const productChannelConfigApi = {
  list(query?: ProductConfigListQuery) {
    return listProductConfigRows<ProductChannelConfigDto>(`${path}/list`, query)
  },
  get(id: string | number) {
    return getProductConfigRow<ProductChannelConfigDto>(`${path}/${id}`)
  },
  save(payload: ProductChannelConfigDto) {
    return saveProductConfigRow(path, payload)
  },
  remove(ids: Array<string | number>) {
    return removeProductConfigRows(path, ids)
  },
}
