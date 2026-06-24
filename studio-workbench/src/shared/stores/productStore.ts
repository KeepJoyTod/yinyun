import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { ProductConfig } from './appStoreTypes'
import { mapProduct, productPayload } from './appStoreTransforms'
import { createDemoBackendId } from './appStoreTransforms'
import { getProductFallbackImage } from './workbenchAssets'

export const productStore = reactive({
  products: [] as ProductConfig[],
  productSpecOptions: [] as string[],

  reset() {
    this.products = []
    this.productSpecOptions = []
  },

  loadFromDto(products: ProductConfig[], specOptions: string[]) {
    this.products = products
    this.productSpecOptions = specOptions
  },

  loadDemo() {
    this.products = [
      {
        backendId: '101',
        id: 'YY_PHOTO_IDCARD_001',
        name: '证件照精修套餐',
        image: getProductFallbackImage(0),
        spec: '证件照',
        price: '129',
        unitPrice: '39',
        includedCount: 6,
        active: true,
        desc: '含拍摄、精修、电子底片交付',
      },
      {
        backendId: '102',
        id: 'YY_PHOTO_PORTRAIT_001',
        name: '个人形象照套餐',
        image: getProductFallbackImage(1),
        spec: '形象照',
        price: '399',
        unitPrice: '89',
        includedCount: 12,
        active: true,
        desc: '适合简历、职业头像、社媒头像',
      },
    ]
    this.productSpecOptions = ['证件照', '形象照', '亲子照', '婚纱照']
  },

  async refresh() {
    const [products, specOptions] = await Promise.all([
      backendApi.listProducts(),
      backendApi.listProductSpecOptions(),
    ])
    this.products = products.map(mapProduct)
    this.productSpecOptions = specOptions
  },

  async uploadProductCover(file: File) {
    return backendApi.uploadOssFile(file)
  },

  async updateProduct(data: ProductConfig) {
    const dto = data.backendId
      ? await backendApi.updateProduct(data.backendId, productPayload(data))
      : await backendApi.createProduct(productPayload(data))
    const product = mapProduct(dto)
    const idx = this.products.findIndex(p => p.backendId === product.backendId || p.id === product.id)
    if (idx === -1) {
      this.products = [product, ...this.products]
    } else {
      this.products[idx] = product
    }
    this.productSpecOptions = Array.from(new Set([...this.productSpecOptions, product.spec].filter(Boolean)))
    return product
  },

  updateProductDemo(data: ProductConfig) {
    const product = { ...data, backendId: data.backendId ?? createDemoBackendId('product') }
    const idx = this.products.findIndex(p => p.backendId === product.backendId || p.id === product.id)
    if (idx === -1) this.products = [product, ...this.products]
    else this.products[idx] = product
    this.productSpecOptions = Array.from(new Set([...this.productSpecOptions, product.spec].filter(Boolean)))
    return product
  },

  async toggleProductActive(product: ProductConfig) {
    if (!product.backendId) {
      return this.updateProduct({ ...product, active: !product.active })
    }
    const original = product.active
    product.active = !product.active
    try {
      const dto = await backendApi.updateProductActive(product.backendId, product.active)
      const next = mapProduct(dto)
      const idx = this.products.findIndex(p => p.backendId === next.backendId)
      if (idx !== -1) this.products[idx] = next
      return next
    } catch (error) {
      product.active = original
      throw error
    }
  },

  toggleProductActiveDemo(product: ProductConfig) {
    product.active = !product.active
    return product
  },
})
