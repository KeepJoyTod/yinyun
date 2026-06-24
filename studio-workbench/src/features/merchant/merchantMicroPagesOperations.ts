import {
  defaultMicroPageSchema,
  type MicroFormDto,
  type MicroPageComponentSchema,
  type MicroPageDto,
  type MicroPagePayload,
} from '../../shared/api/backend'
import { getSamplePhotoImage, workbenchImages } from '../../shared/stores/workbenchAssets'

export const templates = [
  { key: 'campaign', label: '营销活动页', description: '适合活动曝光、优惠券和快速预约入口。' },
  { key: 'product', label: '产品详情页', description: '适合产品卖点、图文介绍和门店承接。' },
] as const

export type MicroPageTemplateKey = typeof templates[number]['key']

export const backendSupportedComponentTypes = ['image', 'masonry', 'title', 'textnav', 'store', 'spacer', 'divider'] as const
export type BackendSupportedComponentType = typeof backendSupportedComponentTypes[number]

export const componentCatalog: Array<{ type: BackendSupportedComponentType; label: string }> = [
  { type: 'image', label: '图片' },
  { type: 'masonry', label: '宫格' },
  { type: 'title', label: '标题' },
  { type: 'textnav', label: '文本导航' },
  { type: 'store', label: '门店信息' },
  { type: 'spacer', label: '辅助空白' },
  { type: 'divider', label: '辅助线' },
]

export type MicroPageDraftField = 'pageTitle' | 'pageDesc' | 'coverUrl' | 'backgroundColor'

export const cloneSchema = (schema: MicroPageDto['schema']) =>
  JSON.parse(JSON.stringify(schema)) as MicroPageDto['schema']

export const emptyMicroPageDraft = (): MicroPagePayload => ({
  pageTitle: '',
  pageDesc: '',
  coverUrl: '',
  backgroundColor: '#FBF8F2',
  editMode: 'COMPONENT',
  status: 'DRAFT',
  schema: defaultMicroPageSchema(),
  remark: '',
})

export const draftAsPage = (editorDraft: MicroPagePayload): MicroPageDto => ({
  id: editorDraft.id || 'draft',
  storeId: editorDraft.storeId ?? null,
  pageTitle: editorDraft.pageTitle,
  pageDesc: editorDraft.pageDesc || '',
  coverUrl: editorDraft.coverUrl || '',
  coverOssId: editorDraft.coverOssId ?? null,
  backgroundColor: editorDraft.backgroundColor || '#FBF8F2',
  editMode: editorDraft.editMode || 'COMPONENT',
  status: editorDraft.status || 'DRAFT',
  schema: cloneSchema(editorDraft.schema),
  configJson: '',
  publishedConfigJson: '',
  publishedAt: '',
  linkKey: editorDraft.linkKey || '',
  remark: editorDraft.remark || '',
})

export const appendMicroFormQuery = (url: string, key: string, value?: string | null) => {
  const normalized = String(value || '').trim()
  if (!normalized) return url
  const pair = `${encodeURIComponent(key)}=${encodeURIComponent(normalized)}`
  const hashIndex = url.indexOf('#')
  if (hashIndex >= 0) {
    const prefix = url.slice(0, hashIndex)
    const hash = url.slice(hashIndex + 1)
    const separator = hash.includes('?') ? '&' : '?'
    return `${prefix}#${hash}${separator}${pair}`
  }
  return `${url}${url.includes('?') ? '&' : '?'}${pair}`
}

export const appendStoreScope = (url: string, storeId?: string | null) =>
  appendMicroFormQuery(url, 'storeId', storeId)

export const buildMicroPageLink = (
  page: Pick<MicroPageDto, 'id' | 'linkKey' | 'storeId'>,
  publicBaseUrl: string,
) => {
  const key = encodeURIComponent(page.linkKey || page.id)
  const base = publicBaseUrl.trim()
  const pageLinkBase = base.includes('{id}') ? base.replace('{id}', key) : `${base.replace(/\/$/, '')}/${key}`
  return appendStoreScope(pageLinkBase, page.storeId)
}

export const microFormLink = (form: MicroFormDto, publicMicroFormBaseUrl: string, storeId?: string | null) => {
  const key = encodeURIComponent(form.linkKey || form.id)
  const base = publicMicroFormBaseUrl.trim()
  const link = (() => {
    if (base.includes('{id}')) return base.replace('{id}', key)
    const hashIndex = base.indexOf('#')
    if (hashIndex >= 0) {
      const prefix = base.slice(0, hashIndex)
      const hash = base.slice(hashIndex + 1)
      const separator = hash.includes('?') ? '&' : '?'
      return `${prefix}#${hash}${separator}formId=${key}`
    }
    return `${base.replace(/\/$/, '')}/public/micro-form/${key}`
  })()
  return appendStoreScope(link, form.storeId || storeId)
}

export const statusLabel = (value: string) => {
  if (value === 'PUBLISHED') return '已发布'
  if (value === 'OFFLINE') return '已下线'
  return '草稿'
}

export const statusClass = (value: string) => {
  if (value === 'PUBLISHED') return 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]'
  if (value === 'OFFLINE') return 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'
  return 'bg-[var(--color-status-warn-bg)] text-[var(--color-status-warn)]'
}

export const componentProps = (component: MicroPageComponentSchema) =>
  (component.props || {}) as Record<string, unknown>

export const componentPrimaryText = (component: MicroPageComponentSchema) => String(componentProps(component).text || '')
export const componentSecondaryText = (component: MicroPageComponentSchema) => String(componentProps(component).description || '')
export const componentProp = (component: MicroPageComponentSchema, key: string) => String(componentProps(component)[key] ?? '')

export const componentItems = (component: MicroPageComponentSchema, key = 'items') => {
  const value = componentProps(component)[key]
  return Array.isArray(value)
    ? value.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>>
    : []
}

export const listItemValue = (item: Record<string, unknown>, key: string) => String(item[key] ?? '')

const componentId = (type: BackendSupportedComponentType) =>
  `${type}-${globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 8) || Date.now()}`

export const createMicroPageComponent = ({
  type,
  currentCount,
  defaultBookingLink,
}: {
  type: BackendSupportedComponentType
  currentCount: number
  defaultBookingLink: string
}): MicroPageComponentSchema => {
  const base = {
    id: componentId(type),
    type,
    title: componentCatalog.find(item => item.type === type)?.label || '组件',
    sort: currentCount + 1,
    componentVersion: 1,
  } satisfies Partial<MicroPageComponentSchema>
  const propsMap: Record<BackendSupportedComponentType, Record<string, unknown>> = {
    image: { text: '门店拍摄环境', url: workbenchImages.storeFront, height: 280 },
    masonry: {
      text: '样片展示',
      description: '证件照、形象照和精修交付效果',
      items: [
        { title: '证件照', image: getSamplePhotoImage(0) },
        { title: '职业形象照', image: getSamplePhotoImage(1) },
        { title: '精修样片', image: getSamplePhotoImage(2) },
        { title: '门店场景', image: getSamplePhotoImage(3) },
      ],
    },
    title: { text: '影约云预约拍摄', description: '选择门店与时段，到店完成拍摄和取片。', align: '' },
    textnav: {
      text: '快捷入口',
      description: '客户常用操作',
      items: [
        { label: '立即预约', link: defaultBookingLink },
        { label: '查看样片', link: '#samples' },
        { label: '联系门店', link: '#store' },
      ],
    },
    store: {
      text: '门店信息',
      description: '到店前请确认营业时间和预约时段',
      address: '请在商户后台填写真实门店地址',
      phone: '请填写门店联系电话',
      businessHours: '09:00-21:00',
    },
    spacer: { text: '', description: '', height: 18 },
    divider: { text: '', description: '' },
  }
  return {
    ...base,
    props: propsMap[type],
  } as MicroPageComponentSchema
}

export const buildTemplateSchema = (key: MicroPageTemplateKey, defaultBookingLink: string) => {
  const schema = defaultMicroPageSchema()
  const types: BackendSupportedComponentType[] = key === 'campaign'
    ? ['title', 'image', 'textnav', 'masonry', 'store']
    : ['title', 'image', 'masonry', 'textnav', 'divider', 'store']
  schema.components = types.map((type, index) => createMicroPageComponent({
    type,
    currentCount: index,
    defaultBookingLink,
  }))
  schema.components.forEach((item, index) => { item.sort = index + 1 })
  return schema
}

export const duplicateMicroPageComponent = (source: MicroPageComponentSchema): MicroPageComponentSchema => {
  const clone = JSON.parse(JSON.stringify(source)) as MicroPageComponentSchema
  clone.id = componentId(source.type as BackendSupportedComponentType)
  clone.title = `${source.title} Copy`
  return clone
}

export const validateDraft = (editorDraft: MicroPagePayload) => {
  if (!editorDraft.pageTitle?.trim()) return '请输入页面标题'
  if (!editorDraft.backgroundColor?.match(/^#[0-9a-fA-F]{6}$/)) return '背景颜色需为 6 位十六进制颜色值'
  if (!editorDraft.schema.components.length) return '请至少添加一个组件'
  const invalid = editorDraft.schema.components.find(component => !component.title.trim())
  if (invalid) return '组件标题不能为空'
  return ''
}

export const microPageSavePayload = (editorDraft: MicroPagePayload): MicroPagePayload => ({
  ...editorDraft,
  schema: {
    schemaVersion: 2,
    components: editorDraft.schema.components.map((component, index) => ({
      ...component,
      sort: index + 1,
      componentVersion: component.componentVersion ?? 1,
      unknownProps: component.unknownProps,
    })),
  },
})
