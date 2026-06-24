import type { MicroPageComponentSchema } from '../../../shared/api/backend'
import { getSamplePhotoImage, workbenchImages } from '../../../shared/stores/workbenchAssets'

export type LinkItem = {
  label: string
  link: string
}

export type GalleryItem = {
  title: string
  image: string
}

export const readString = (value: unknown) => String(value ?? '').trim()

export const componentProps = (component: MicroPageComponentSchema) =>
  (component.props || {}) as Record<string, unknown>

export const componentText = (component: MicroPageComponentSchema, fallback: string) => {
  const data = componentProps(component)
  const text = readString(data.text || data.title || data.label || component.title)
  if (!text || ['页面标题', '图片组件', '宫格组件', '文本导航', '辅助线', '辅助空白'].includes(text)) return fallback
  return text
}

export const componentDescription = (component: MicroPageComponentSchema, fallback: string) => {
  const data = componentProps(component)
  const description = readString(data.description || data.subtitle || data.desc)
  if (!description || ['cover', '主标题', '快捷入口导航', '地址电话营业时间', '双列图文宫格'].includes(description)) return fallback
  return description
}

export const titleAlignClass = (component: MicroPageComponentSchema) => {
  const align = readString(componentProps(component).align)
  if (align === 'center') return 'yy-micro-title--center'
  if (align === 'right') return 'yy-micro-title--right'
  return ''
}

export const titleKicker = (component: MicroPageComponentSchema) => {
  const title = readString(component.title)
  if (!title || ['标题', '页面标题'].includes(title)) return '影约云 · 预约拍摄'
  return title
}

export const imageUrl = (component: MicroPageComponentSchema, coverUrl: string) => {
  const data = componentProps(component)
  return readString(data.url || data.image || data.coverUrl || coverUrl) || workbenchImages.storeFront
}

export const imageHeight = (component: MicroPageComponentSchema, preview: boolean) => {
  const height = Number(componentProps(component).height)
  if (!Number.isFinite(height)) return preview ? 220 : 280
  return Math.min(Math.max(height, 160), 620)
}

export const normalizeItems = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value) ? value.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>> : []

export const navItems = (component: MicroPageComponentSchema): LinkItem[] => {
  const items = normalizeItems(componentProps(component).items)
    .map(item => ({
      label: readString(item.label || item.title || item.text),
      link: readString(item.link || item.url || item.path),
    }))
    .filter(item => item.label && !/^nav\s*\d+$/i.test(item.label))
  if (items.length) return items
  return [
    { label: '立即预约', link: '' },
    { label: '查看样片', link: '#samples' },
    { label: '联系门店', link: '#store' },
  ]
}

export const galleryItems = (component: MicroPageComponentSchema): GalleryItem[] => {
  const items = normalizeItems(componentProps(component).items)
    .map((item, index) => ({
      title: readString(item.title || item.label || item.text) || `样片 ${index + 1}`,
      image: readString(item.image || item.url || item.coverUrl) || getSamplePhotoImage(index),
    }))
    .filter(item => item.image)
  if (items.length) return items
  return ['证件照', '职业形象照', '精修样片', '门店场景'].map((title, index) => ({
    title,
    image: getSamplePhotoImage(index),
  }))
}

export const storeRows = (component: MicroPageComponentSchema) => {
  const data = componentProps(component)
  const address = readString(data.address || data.storeAddress) || '到店后由店员引导拍摄'
  const phone = readString(data.phone || data.mobile || data.tel) || '请通过预约入口联系门店'
  const hours = readString(data.openingHours || data.businessHours || data.hours) || '每日营业时间以门店排期为准'
  return [
    { label: '地址', value: address },
    { label: '电话', value: phone },
    { label: '营业', value: hours },
  ].filter(item => item.value)
}

export const spacerHeight = (component: MicroPageComponentSchema) => {
  const height = Number(componentProps(component).height)
  if (!Number.isFinite(height)) return 18
  return Math.min(Math.max(height, 8), 96)
}

export const appendQueryParam = (url: string, key: string, value?: string) => {
  const normalized = readString(value)
  if (!normalized) return url
  const encodedKey = encodeURIComponent(key)
  const encodedValue = encodeURIComponent(normalized)
  const insertPair = (segment: string) => {
    if (!segment) return `?${encodedKey}=${encodedValue}`
    const [path, query = ''] = segment.split('?')
    const params = new URLSearchParams(query)
    if (params.has(key)) return segment
    params.set(key, normalized)
    return `${path}?${params.toString()}`
  }

  const hashIndex = url.indexOf('#')
  if (hashIndex >= 0) {
    const prefix = url.slice(0, hashIndex)
    const hash = url.slice(hashIndex + 1)
    return `${prefix}#${insertPair(hash)}`
  }

  if (/^[a-z]+:/i.test(url)) {
    try {
      const parsed = new URL(url)
      if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, normalized)
      return parsed.toString()
    } catch {
      return `${url}${url.includes('?') ? '&' : '?'}${encodedKey}=${encodedValue}`
    }
  }

  const [path, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  if (params.has(key)) return url
  params.set(key, normalized)
  return `${path}?${params.toString()}`
}

export const isMicroFormPath = (link: string) =>
  /\/public\/micro-form\//.test(link) || /(?:[?#&])formId=/.test(link)

export const resolveMicroPageNavLink = (link: string, storeId: string) =>
  isMicroFormPath(link) ? appendQueryParam(link, 'storeId', storeId) : link
