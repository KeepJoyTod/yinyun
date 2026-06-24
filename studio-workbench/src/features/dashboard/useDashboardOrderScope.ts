import { computed, type ComputedRef } from 'vue'
import { appStore, type Album, type BookingOrder, type SelectionLink } from '../../shared/stores/appStore'
import { getOrderOperationalDate } from '../orders/orderOperations'

type UseDashboardOrderScopeOptions = {
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
}

const dedupeOrders = (rows: BookingOrder[]) => {
  const seen = new Set<string>()
  return rows.filter(order => {
    const key = order.backendId || order.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const resolveOrderForAlbumFrom = (orders: BookingOrder[], album: Album) =>
  orders.find(order =>
    (album.orderBackendId && order.backendId === album.orderBackendId)
    || (album.orderId && order.id === album.orderId),
  )

const resolveOrderForSelectionLinkFrom = (
  orders: BookingOrder[],
  albums: Album[],
  link: SelectionLink,
) => {
  const directOrder = orders.find(order =>
    (link.orderBackendId && order.backendId === link.orderBackendId)
    || (link.orderId && order.id === link.orderId),
  )
  if (directOrder) return directOrder
  const album = albums.find(item =>
    (link.albumBackendId && item.backendId === link.albumBackendId)
    || (link.albumId && item.id === link.albumId),
  )
  return album ? resolveOrderForAlbumFrom(orders, album) : undefined
}

export const matchesDashboardDate = (order: BookingOrder, date: string) => {
  const operationalDate = getOrderOperationalDate(order)
  return operationalDate === date || (!operationalDate && order.orderDate === date)
}

export const useDashboardOrderScope = ({
  selectedDateValue,
  selectedDashboardStoreBackendId,
}: UseDashboardOrderScopeOptions) => {
  const ledgerOrders = computed(() =>
    dedupeOrders([...appStore.reportOrders, ...appStore.ledgerOrders, ...appStore.orders]),
  )
  const allKnownOrders = computed(() =>
    dedupeOrders([...ledgerOrders.value, ...appStore.orders]),
  )
  const scopedLedgerOrders = computed(() => {
    const storeId = selectedDashboardStoreBackendId.value
    if (!storeId) return ledgerOrders.value
    return ledgerOrders.value.filter(order => order.storeBackendId === storeId)
  })
  const matchesSelectedStore = (storeBackendId?: string) =>
    !selectedDashboardStoreBackendId.value || storeBackendId === selectedDashboardStoreBackendId.value
  const resolveOrderForAlbum = (album: Album) =>
    resolveOrderForAlbumFrom(allKnownOrders.value, album)
  const resolveOrderForSelectionLink = (link: SelectionLink) =>
    resolveOrderForSelectionLinkFrom(allKnownOrders.value, appStore.albums, link)
  const selectedDateOrders = computed(() =>
    scopedLedgerOrders.value.filter(order => matchesDashboardDate(order, selectedDateValue.value)),
  )

  return {
    ledgerOrders,
    allKnownOrders,
    scopedLedgerOrders,
    matchesSelectedStore,
    resolveOrderForAlbum,
    resolveOrderForSelectionLink,
    matchesDashboardDate,
    selectedDateOrders,
  }
}
