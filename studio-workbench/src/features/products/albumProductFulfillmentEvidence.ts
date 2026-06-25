import type { Album, BookingOrder, ProductConfig, SelectionLink } from '../../shared/stores/appStore'

export type AlbumFulfillmentEvidenceTone = 'ready' | 'pending'

export type AlbumFulfillmentEvidenceItem = {
  key: 'orders' | 'selection' | 'delivery'
  label: string
  tone: AlbumFulfillmentEvidenceTone
  detail: string
}

export type AlbumProductFulfillmentEvidence = {
  summary: string
  orderCount: number
  albumCount: number
  selectionLinkCount: number
  completedAlbumCount: number
  items: AlbumFulfillmentEvidenceItem[]
}

type BuildInput = {
  product: ProductConfig
  orders: BookingOrder[]
  albums: Album[]
  selectionLinks: SelectionLink[]
}

const sameId = (left: unknown, right: unknown) =>
  left != null && right != null && String(left) === String(right)

const matchesProductOrder = (product: ProductConfig, order: BookingOrder) =>
  sameId(order.productBackendId, product.backendId)
  || sameId(order.externalProductId, product.backendId)
  || sameId(order.externalSkuId, product.backendId)

export const buildAlbumProductFulfillmentEvidence = ({
  product,
  orders,
  albums,
  selectionLinks,
}: BuildInput): AlbumProductFulfillmentEvidence => {
  const matchedOrders = orders.filter(order => matchesProductOrder(product, order))
  const orderBackendIds = new Set(matchedOrders.map(order => String(order.backendId)))
  const orderIds = new Set(matchedOrders.map(order => order.id).filter(Boolean))
  const matchedAlbums = albums.filter(album =>
    (album.orderBackendId != null && orderBackendIds.has(String(album.orderBackendId)))
    || orderIds.has(album.orderId),
  )
  const albumBackendIds = new Set(matchedAlbums.map(album => String(album.backendId)))
  const albumIds = new Set(matchedAlbums.map(album => album.id).filter(Boolean))
  const matchedSelectionLinks = selectionLinks.filter(link =>
    (link.orderBackendId != null && orderBackendIds.has(String(link.orderBackendId)))
    || (link.orderId != null && orderIds.has(link.orderId))
    || (link.albumBackendId != null && albumBackendIds.has(String(link.albumBackendId)))
    || (link.albumId != null && albumIds.has(link.albumId)),
  )
  const completedAlbumCount = matchedAlbums.filter(album => album.status === '已交付').length

  const items: AlbumFulfillmentEvidenceItem[] = [
    {
      key: 'orders',
      label: '订单关联',
      tone: matchedOrders.length ? 'ready' : 'pending',
      detail: matchedOrders.length ? `已关联 ${matchedOrders.length} 个真实订单。` : '暂无真实订单关联到该入册商品。',
    },
    {
      key: 'selection',
      label: '选片证据',
      tone: matchedSelectionLinks.length || matchedAlbums.some(album => album.selectedCount > 0) ? 'ready' : 'pending',
      detail: matchedSelectionLinks.length
        ? `已有 ${matchedSelectionLinks.length} 个选片入口。`
        : '还没有选片链接或已选照片记录。',
    },
    {
      key: 'delivery',
      label: '交付证据',
      tone: completedAlbumCount ? 'ready' : 'pending',
      detail: completedAlbumCount ? `已有 ${completedAlbumCount} 个相册完成交付。` : '还没有已交付相册记录。',
    },
  ]

  const readyCount = items.filter(item => item.tone === 'ready').length
  const summary = readyCount === items.length
    ? '订单履约证据已闭环'
    : matchedOrders.length
      ? `已有订单证据，还差 ${items.length - readyCount} 项履约证据`
      : '暂无订单履约证据'

  return {
    summary,
    orderCount: matchedOrders.length,
    albumCount: matchedAlbums.length,
    selectionLinkCount: matchedSelectionLinks.length,
    completedAlbumCount,
    items,
  }
}
