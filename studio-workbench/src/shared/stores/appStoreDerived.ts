import { computed } from 'vue'
import { isMissingArrivalSchedule } from './orderIssueRules'
import { buildWorkbenchStoreNames } from './appStoreTransforms'
import type { BookingOrder, ProductConfig, StoreInfo } from './appStoreTypes'

type AppDerivedStore = {
  stores: StoreInfo[]
  products: ProductConfig[]
  productSpecOptions: string[]
  ledgerOrders: BookingOrder[]
  orders: BookingOrder[]
}

export const createAppDerived = (store: AppDerivedStore) => ({
  storeNames: computed(() => buildWorkbenchStoreNames(store.stores)),
  activeProducts: computed(() => store.products.filter(product => product.active)),
  productSpecOptions: computed(() =>
    Array.from(new Set([...store.productSpecOptions, ...store.products.map(product => product.spec)].filter(Boolean))),
  ),
  anomalyPreStats: computed(() => {
    const orders = store.ledgerOrders.length ? store.ledgerOrders : store.orders
    return {
      missingStoreMapping: orders.filter(order => {
        if (!order.storeBackendId) return true
        return !store.stores.some(item => item.backendId === order.storeBackendId)
      }).length,
      missingArrivalTime: orders.filter(isMissingArrivalSchedule).length,
      missingProductName: orders.filter(order => !order.service || order.service === '鏈煡浜у搧' || order.service === '-').length,
    }
  }),
})
