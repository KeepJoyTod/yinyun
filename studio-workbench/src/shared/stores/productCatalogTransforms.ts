import type { ProductCatalogDto, ProductScaffoldOwner } from '../api/backendProductConfigTypes'

export type ProductCatalogSummary = {
  productId: string
  name: string
  type: string
  status: string
  skuCount: number
  relationCount: number
  channelCount: number
  readiness: string
}

export const productScaffoldOwners: ProductScaffoldOwner[] = [
  { key: 'catalog', label: 'Catalog', path: '/product/catalog', apiPath: '/yy/productCatalog/{productId}', layer: 'control', status: 'scaffold-ready' },
  { key: 'sku', label: 'SKU', path: '/product/sku', apiPath: '/yy/productSku', layer: 'control', status: 'scaffold-ready' },
  { key: 'category', label: 'Category', path: '/product/category', apiPath: '/yy/productCategory', layer: 'control', status: 'scaffold-ready' },
  { key: 'relation', label: 'Relation', path: '/product/relation', apiPath: '/yy/productRelation', layer: 'control', status: 'scaffold-ready' },
  { key: 'booking-rules', label: 'Booking Rules', path: '/product/booking-rules', apiPath: '/yy/productBookingRule', layer: 'control', status: 'scaffold-ready' },
  { key: 'channel', label: 'Channel Config', path: '/product/channel', apiPath: '/yy/productChannelConfig', layer: 'control', status: 'scaffold-ready' },
  { key: 'cards', label: 'Card Products', path: '/product/cards', apiPath: '/yy/productCatalog/{productId}/benefit-binding', layer: 'control', status: 'readiness-scaffold' },
]

export const toCatalogSummary = (catalog: ProductCatalogDto | null): ProductCatalogSummary | null => {
  if (!catalog) return null
  return {
    productId: String(catalog.productId),
    name: catalog.productName || 'Unnamed product',
    type: catalog.productType || 'SERVICE',
    status: catalog.status || '0',
    skuCount: catalog.skus?.length ?? 0,
    relationCount: catalog.relations?.length ?? 0,
    channelCount: catalog.channelConfigs?.length ?? 0,
    readiness: catalog.orderReadiness?.status || catalog.orderReadiness?.reason || 'READONLY_SCAFFOLD',
  }
}
