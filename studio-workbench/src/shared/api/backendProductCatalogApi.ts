import { getProductConfigRow } from './backendProductConfigShared'
import type { ProductBindingReadinessDto, ProductCatalogDto } from './backendProductConfigTypes'
import type { BackendId } from './backendId'

export const productCatalogApi = {
  getCatalog(productId: BackendId) {
    return getProductConfigRow<ProductCatalogDto>(`/yy/productCatalog/${productId}`)
  },
  getOrderReadiness(productId: BackendId) {
    return getProductConfigRow<ProductBindingReadinessDto>(`/yy/productCatalog/${productId}/order-readiness`)
  },
  getInventoryBinding(productId: BackendId) {
    return getProductConfigRow<ProductBindingReadinessDto>(`/yy/productCatalog/${productId}/inventory-binding`)
  },
  getBenefitBinding(productId: BackendId) {
    return getProductConfigRow<ProductBindingReadinessDto>(`/yy/productCatalog/${productId}/benefit-binding`)
  },
}
