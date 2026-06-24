import { apiRequestRaw } from './request'
import { type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { extractRuoyiRows, mapYyProduct, type RuoyiTableResponse, type YyProductVo } from './yingyueAdapter'
import type { ProductDto, ProductPayload, StoreDto } from './backendTypes'
import { buildAlbumProductMetadataLabel } from '../products/albumProductMetadata'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type ProductsApiDeps = {
  getStores: () => StoreDto[]
  getProducts: () => ProductDto[]
  setProducts: (items: ProductDto[]) => void
}

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const findCreatedRecord = async <T>(
  path: string,
  query: Record<string, string | number | boolean | null | undefined>,
  predicate: (row: T) => boolean,
  label: string,
) => {
  const rows = await listRows<T>(path, query)
  const created = rows.find(predicate)
  if (!created) throw new Error(`服务端未返回新建${label}，请刷新后确认`)
  return created
}

const productToYyPayload = (payload: ProductPayload, id?: BackendId, fallbackStoreId = '') => {
  const normalizedBizCategory = String(payload.bizCategory || payload.spec || 'SERVICE').trim().toUpperCase()
  const isAlbumProduct = normalizedBizCategory === 'ALBUM'
  return {
    id,
    storeId: payload.storeId ?? fallbackStoreId,
    productType: normalizedBizCategory,
    productName: payload.name,
    price: payload.priceCents / 100,
    durationMinutes: 60,
    selectionPrice: payload.unitPriceCents / 100,
    albumProductName: isAlbumProduct
      ? buildAlbumProductMetadataLabel(payload.spec, payload.includedCount)
      : payload.description || payload.name,
    status: payload.active ? '0' : '1',
    sort: 0,
    remark: payload.description,
  }
}

export const createProductsApi = (deps: ProductsApiDeps) => {
  const productWithStoreName = (product: ProductDto): ProductDto => ({
    ...product,
    storeName: deps.getStores().find(store => sameId(store.id, product.storeId))?.name ?? product.storeName ?? '',
  })

  const api = {
    async listProducts() {
      const rows = await listRows<YyProductVo>('/yy/product/list')
      const products = rows.map(row => productWithStoreName(mapYyProduct(row)))
      deps.setProducts(products)
      return products
    },
    async createProduct(payload: ProductPayload) {
      const body = productToYyPayload(payload, undefined, deps.getStores()[0]?.id ?? '')
      await apiRequestRaw<RuoyiResponse<void>>('/yy/product', { method: 'POST', body: JSON.stringify(body) })
      const row = await findCreatedRecord<YyProductVo>(
        '/yy/product/list',
        { storeId: body.storeId, productName: body.productName, productType: body.productType },
        item => sameId(item.storeId, body.storeId)
          && String(item.productName ?? '') === body.productName
          && String(item.productType ?? '') === body.productType,
        '产品',
      )
      const product = productWithStoreName(mapYyProduct(row))
      deps.setProducts([product, ...deps.getProducts()])
      return product
    },
    async updateProduct(id: BackendId, payload: ProductPayload) {
      const body = productToYyPayload(payload, id, deps.getStores()[0]?.id ?? '')
      await apiRequestRaw<RuoyiResponse<void>>('/yy/product', { method: 'PUT', body: JSON.stringify(body) })
      const product = productWithStoreName(mapYyProduct({ ...body, id }))
      deps.setProducts(deps.getProducts().map(item => (item.id === id ? product : item)))
      return product
    },
    async updateProductActive(id: BackendId, active: boolean) {
      const current = deps.getProducts().find(product => product.id === id)
      if (!current) throw new Error('未找到产品')
      return api.updateProduct(id, {
        productCode: current.productCode,
        storeId: current.storeId,
        bizCategory: current.rawProductType || current.spec,
        name: current.name,
        coverUrl: current.coverUrl,
        spec: current.spec,
        priceCents: current.priceCents,
        unitPriceCents: current.unitPriceCents,
        includedCount: current.includedCount,
        active,
        description: current.description,
      })
    },
  }

  return api
}
