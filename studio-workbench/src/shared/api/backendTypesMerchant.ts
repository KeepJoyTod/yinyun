import type { BackendId } from './backendId'

export type DecorationMenuItem = {
  id: string
  label: string
  type: string
  target: string
  visible: boolean
  sort: number
}

export type MerchantDecorationConfig = {
  theme: {
    brandName: string
    themeColor: string
    shareTitle: string
    shareDesc: string
    shareIconUrl: string
  }
  bookingFlow: {
    home: { currentHomepage: string; homepageTitle: string }
    appointment: { forceFollowWechat: boolean; guideImageUrl: string }
    category: { showProductCategories: boolean }
    product: { listStyle: 'grid' | 'list' | 'compact'; showRelatedProducts: boolean; hotKeywords: string }
    customer: {
      needEmail: boolean
      needBirthday: boolean
      needIdCard: boolean
      needRemark: boolean
      remarkRequired: boolean
      remarkPlaceholder: string
      customFields: string[]
    }
    confirm: {
      orderNotice: 'disabled' | 'amount' | 'fixed'
      couponNotice: 'disabled' | 'coupon'
      serviceAgreement: boolean
      agreementMode: 'bottom' | 'modal'
      agreementContent: string
    }
  }
  profileMenus: DecorationMenuItem[]
  bottomMenus: DecorationMenuItem[]
  watermark: { enabled: boolean; imageUrl: string; previewBackground: 'light' | 'dark' | 'gray' }
  platform: {
    wechatMenuTemplates: string[]
    activeTemplate: string
    syncStatus: string
    authMode?: 'NONE' | 'RESERVED' | 'AUTHORIZED'
    lastSyncAt?: string
    lastSyncError?: string
    previewToken?: string
  }
  wechatMiniProgram: { appId: string; callbackUrl: string; enabled: string; sdkStatus: string; miniProgramPath: string }
}

export type MerchantDecorationDto = {
  id: BackendId | null
  storeId: BackendId | null
  channelType: string
  status: string
  config: MerchantDecorationConfig
  configJson: string
  publishedConfigJson: string
  shareIconOssId: BackendId | null
  watermarkOssId: BackendId | null
  publishedAt: string
  remark: string
  previewToken?: string | null
}

export type MerchantDecorationPayload = {
  id?: BackendId | null
  storeId?: BackendId | null
  channelType: string
  config: MerchantDecorationConfig
  shareIconOssId?: BackendId | null
  watermarkOssId?: BackendId | null
  remark?: string
}

export type MicroFormFieldType = 'text' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'label' | 'date'

export type MicroFormFieldSchema = {
  id: string
  label: string
  type: MicroFormFieldType
  required?: boolean
  placeholder?: string
  value?: string
  options?: string[]
  sort?: number
  rules?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    unique?: boolean
    pattern?: string
    message?: string
  }
  visibility?: {
    fieldId?: string
    equals?: string
    notEquals?: string
  }
  binding?: {
    sourceParam?: string
    storeField?: boolean
    serviceGroupField?: boolean
  }
  privacy?: {
    enabled?: boolean
    label?: string
    required?: boolean
  }
}

export type MicroFormSchema = {
  fields: MicroFormFieldSchema[]
  schemaVersion?: number
}

export type MicroFormDto = {
  id: BackendId
  storeId?: BackendId | null
  formName: string
  status: string
  schema: MicroFormSchema
  schemaJson: string
  notifyUsers: string
  publishedAt: string
  linkKey: string
  submissionCount: number
  remark: string
}

export type MicroFormPayload = {
  id?: BackendId | null
  storeId?: BackendId | null
  formName: string
  status?: string
  schema: MicroFormSchema
  notifyUsers?: string
  linkKey?: string
  remark?: string
}

export type MicroFormListQuery = {
  formName?: string
  status?: string
  storeId?: BackendId | null
  pageNum?: number
  pageSize?: number
}

export type MicroFormSubmissionDto = {
  id: BackendId
  formId: BackendId
  formNameSnapshot: string
  customerName: string
  customerPhone: string
  submittedAt: string
  followStatus: string
  followRemark: string
  answers: Record<string, unknown>
  answersJson: string
  orderId?: BackendId | null
  remark: string
  storeId?: BackendId | null
  serviceGroupId?: BackendId | null
  sourceCode?: string
  sourcePath?: string
  qrScene?: string
  assignee?: string
  followTimeline?: Array<{ at: string; action: string; operator?: string; remark?: string }>
  duplicateCustomerHint?: string
}

export type MicroFormSubmissionQuery = {
  formId?: BackendId | null
  formNameSnapshot?: string
  customerName?: string
  customerPhone?: string
  followStatus?: string
  pageNum?: number
  pageSize?: number
}

export type MicroFormSubmissionFollowPayload = {
  id: BackendId
  followStatus: string
  followRemark?: string
  orderId?: BackendId | null
}

export type PublicMicroFormDto = {
  id: BackendId
  storeId?: BackendId | null
  formName: string
  status: string
  schema: MicroFormSchema
  schemaJson: string
  linkKey: string
  publishedAt: string
}

export type PublicMicroFormSubmitPayload = {
  customerName?: string
  customerPhone?: string
  answers: Record<string, unknown>
}

export type PublicMicroFormSubmitResult = {
  submissionId: BackendId
  status: string
  submittedAt: string
}

export type MicroPageComponentType = 'image' | 'masonry' | 'title' | 'textnav' | 'store' | 'spacer' | 'divider'
  | 'product'
  | 'card'
  | 'flashsale'
  | 'ad'
  | 'video'
  | 'tabs'
  | 'print-product'
  | 'music'
  | 'location'
  | 'dock'
  | 'stack'
  | 'work-category'
  | 'work-list'
  | 'brand'
  | 'contact'
  | 'groupbuy'
  | 'unknown'

export type MicroPageCardItem = {
  title?: string
  label?: string
  image?: string
  link?: string
  icon?: string
}

export type MicroPageComponentSchema = {
  id: string
  type: MicroPageComponentType
  title: string
  sort?: number
  props: Record<string, unknown>
  componentVersion?: number
  unknownProps?: Record<string, unknown>
}

export type MicroPageSchema = {
  components: MicroPageComponentSchema[]
  schemaVersion?: number
}

export type MicroPageDto = {
  id: BackendId
  storeId?: BackendId | null
  pageTitle: string
  pageDesc: string
  coverUrl: string
  coverOssId?: BackendId | null
  backgroundColor: string
  editMode: string
  status: string
  schema: MicroPageSchema
  configJson: string
  publishedConfigJson: string
  publishedAt: string
  linkKey: string
  remark: string
}

export type MicroPagePayload = {
  id?: BackendId | null
  storeId?: BackendId | null
  pageTitle: string
  pageDesc?: string
  coverUrl?: string
  coverOssId?: BackendId | null
  backgroundColor?: string
  editMode?: string
  status?: string
  schema: MicroPageSchema
  linkKey?: string
  remark?: string
}

export type MicroPageListQuery = {
  pageTitle?: string
  status?: string
  storeId?: BackendId | null
  pageNum?: number
  pageSize?: number
}

export type PublicMicroPageDto = {
  id: BackendId
  storeId?: BackendId | null
  pageTitle: string
  pageDesc: string
  coverUrl: string
  backgroundColor: string
  editMode: string
  status: string
  schema: MicroPageSchema
  configJson: string
  linkKey: string
  publishedAt: string
}

export type ScheduleRuleDto = {
  id: BackendId
  storeId: BackendId
  serviceGroupId: BackendId
  weekday: number
  startTime: string
  endTime: string
  capacity: number
  enabled: string
  remark: string
}

export type ScheduleRulePayload = {
  id?: BackendId
  storeId: BackendId
  serviceGroupId: BackendId
  weekday: number
  startTime: string
  endTime: string
  capacity?: number
  enabled?: string
  remark?: string
}
