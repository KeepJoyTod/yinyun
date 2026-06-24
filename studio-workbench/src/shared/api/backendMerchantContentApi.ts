import { apiRequest, apiRequestBlob, apiRequestRaw, type BlobResponse, type PageResponse } from './request'
import { normalizeBackendId, optionalBackendId, type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { mapMicroFormSubmissionRow } from './backendRowMappers'
import { extractRuoyiRows, type RuoyiTableResponse } from './yingyueAdapter'
import type {
  MerchantDecorationConfig,
  MerchantDecorationDto,
  MerchantDecorationPayload,
  MicroFormDto,
  MicroFormListQuery,
  MicroFormPayload,
  MicroFormSchema,
  MicroFormSubmissionDto,
  MicroFormSubmissionFollowPayload,
  MicroFormSubmissionQuery,
  MicroPageDto,
  MicroPageListQuery,
  MicroPagePayload,
  MicroPageSchema,
  PublicMicroFormDto,
  PublicMicroFormSubmitPayload,
  PublicMicroFormSubmitResult,
  PublicMicroPageDto,
} from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

export const defaultMicroFormSchema = (): MicroFormSchema => ({
  fields: [],
  schemaVersion: 2,
})

export const defaultMicroPageSchema = (): MicroPageSchema => ({
  components: [],
  schemaVersion: 2,
})

export const defaultMerchantDecorationConfig = (): MerchantDecorationConfig => ({
  theme: {
    brandName: '',
    themeColor: '#F58235',
    shareTitle: '',
    shareDesc: '',
    shareIconUrl: '',
  },
  bookingFlow: {
    home: { currentHomepage: 'DEFAULT', homepageTitle: '' },
    appointment: { forceFollowWechat: false, guideImageUrl: '' },
    category: { showProductCategories: false },
    product: { listStyle: 'grid', showRelatedProducts: false, hotKeywords: '' },
    customer: {
      needEmail: false,
      needBirthday: false,
      needIdCard: false,
      needRemark: false,
      remarkRequired: false,
      remarkPlaceholder: '',
      customFields: [],
    },
    confirm: {
      orderNotice: 'disabled',
      couponNotice: 'disabled',
      serviceAgreement: false,
      agreementMode: 'modal',
      agreementContent: '',
    },
  },
  profileMenus: [],
  bottomMenus: [],
  watermark: { enabled: false, imageUrl: '', previewBackground: 'light' },
  platform: {
    wechatMenuTemplates: [],
    activeTemplate: '',
    syncStatus: '未同步',
  },
  wechatMiniProgram: { appId: '', callbackUrl: '', enabled: '', sdkStatus: '', miniProgramPath: '' },
})

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const getData = async <T>(path: string) => {
  const response = await apiRequestRaw<RuoyiResponse<T>>(path)
  if (!response.data) throw new Error(`Empty response data: ${path}`)
  return response.data
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

const parseMicroFormSchema = (schemaJson: unknown): MicroFormSchema => {
  try { return JSON.parse(String(schemaJson || '{}')) as MicroFormSchema } catch { return { fields: [] } }
}

const parseMicroPageSchema = (configJson: unknown): MicroPageSchema => {
  try { return JSON.parse(String(configJson || '{}')) as MicroPageSchema } catch { return { components: [] } }
}

const mapMicroFormRow = (row: Record<string, any>, fallbackStatus = 'DRAFT'): MicroFormDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  formName: String(row.formName ?? ''),
  status: String(row.status ?? fallbackStatus),
  schema: parseMicroFormSchema(row.schemaJson),
  schemaJson: String(row.schemaJson ?? '{}'),
  notifyUsers: String(row.notifyUsers ?? ''),
  publishedAt: String(row.publishedAt ?? ''),
  linkKey: String(row.linkKey ?? ''),
  submissionCount: Number(row.submissionCount ?? 0),
  remark: String(row.remark ?? ''),
})

const mapMicroPageRow = (row: Record<string, any>, fallbackStatus = 'DRAFT'): MicroPageDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  pageTitle: String(row.pageTitle ?? ''),
  pageDesc: String(row.pageDesc ?? ''),
  coverUrl: String(row.coverUrl ?? ''),
  coverOssId: optionalBackendId(row.coverOssId) ?? null,
  backgroundColor: String(row.backgroundColor ?? '#FBF8F2'),
  editMode: String(row.editMode ?? 'COMPONENT'),
  status: String(row.status ?? fallbackStatus),
  schema: parseMicroPageSchema(row.configJson),
  configJson: String(row.configJson ?? '{}'),
  publishedConfigJson: String(row.publishedConfigJson ?? '{}'),
  publishedAt: String(row.publishedAt ?? ''),
  linkKey: String(row.linkKey ?? ''),
  remark: String(row.remark ?? ''),
})

const mapMerchantDecorationRow = (
  row: Record<string, any>,
  fallback: { channelType?: string; status?: string; config?: MerchantDecorationConfig; configJson?: string } = {},
): MerchantDecorationDto => ({
  id: optionalBackendId(row.id) ?? null,
  storeId: optionalBackendId(row.storeId) ?? null,
  channelType: String(row.channelType ?? fallback.channelType ?? 'WECHAT'),
  status: String(row.status ?? fallback.status ?? 'DRAFT'),
  config: fallback.config ?? (() => {
    try { return JSON.parse(String(row.configJson || '{}')) as MerchantDecorationConfig } catch { return defaultMerchantDecorationConfig() }
  })(),
  configJson: String(row.configJson ?? fallback.configJson ?? '{}'),
  publishedConfigJson: String(row.publishedConfigJson ?? ''),
  shareIconOssId: optionalBackendId(row.shareIconOssId) ?? null,
  watermarkOssId: optionalBackendId(row.watermarkOssId) ?? null,
  publishedAt: String(row.publishedAt ?? ''),
  remark: String(row.remark ?? ''),
  previewToken: String(row.previewToken ?? ''),
})

const mapPublicMicroFormRow = (row: Record<string, any>): PublicMicroFormDto => {
  const schemaJson = String(row.schemaJson || '{}')
  return {
    id: normalizeBackendId(row.id),
    storeId: optionalBackendId(row.storeId) ?? null,
    formName: String(row.formName || ''),
    status: String(row.status || 'PUBLISHED'),
    schema: parseMicroFormSchema(schemaJson),
    schemaJson,
    linkKey: String(row.linkKey || ''),
    publishedAt: String(row.publishedAt || ''),
  }
}

const mapPublicMicroPageRow = (row: Record<string, any>): PublicMicroPageDto => {
  const configJson = String(row.configJson || row.publishedConfigJson || '{}')
  return {
    id: normalizeBackendId(row.id),
    storeId: optionalBackendId(row.storeId) ?? null,
    pageTitle: String(row.pageTitle || ''),
    pageDesc: String(row.pageDesc || ''),
    coverUrl: String(row.coverUrl || ''),
    backgroundColor: String(row.backgroundColor || '#FBF8F2'),
    editMode: String(row.editMode || 'COMPONENT'),
    status: String(row.status || 'PUBLISHED'),
    schema: parseMicroPageSchema(configJson),
    configJson,
    linkKey: String(row.linkKey || ''),
    publishedAt: String(row.publishedAt || ''),
  }
}

export const merchantContentApi = {
  async listMicroForms(query: MicroFormListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/microForm/list', {
      formName: query.formName,
      status: query.status,
      storeId: query.storeId,
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
    })
    const items = rows.map(row => mapMicroFormRow(row))
    return {
      items,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      total: items.length,
    } satisfies PageResponse<MicroFormDto>
  },
  async getMicroForm(id: BackendId) {
    const row = await getData<Record<string, any>>(`/yy/microForm/${id}`)
    return mapMicroFormRow(row)
  },
  async createMicroForm(payload: MicroFormPayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      formName: payload.formName,
      status: payload.status ?? 'DRAFT',
      schemaJson: JSON.stringify(payload.schema ?? { fields: [] }),
      notifyUsers: payload.notifyUsers ?? '',
      linkKey: payload.linkKey ?? '',
      remark: payload.remark ?? '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/microForm', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/microForm/list',
      { formName: body.formName },
      item => String(item.formName ?? '') === body.formName,
      '微表单',
    )
    return mapMicroFormRow(row)
  },
  async updateMicroForm(payload: MicroFormPayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      formName: payload.formName,
      status: payload.status ?? 'DRAFT',
      schemaJson: JSON.stringify(payload.schema ?? { fields: [] }),
      notifyUsers: payload.notifyUsers ?? '',
      linkKey: payload.linkKey ?? '',
      remark: payload.remark ?? '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/microForm', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return {
      id: body.id ?? '',
      storeId: body.storeId,
      formName: body.formName,
      status: body.status,
      schema: payload.schema ?? { fields: [] },
      schemaJson: body.schemaJson,
      notifyUsers: body.notifyUsers,
      publishedAt: '',
      linkKey: body.linkKey,
      submissionCount: 0,
      remark: body.remark,
    } satisfies MicroFormDto
  },
  async deleteMicroForm(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/microForm/${id}`, {
      method: 'DELETE',
    })
  },
  async publishMicroForm(id: BackendId) {
    const row = await apiRequest<Record<string, any>>(`/yy/microForm/${id}/publish`, {
      method: 'POST',
    })
    return mapMicroFormRow(row, 'PUBLISHED')
  },
  async offlineMicroForm(id: BackendId) {
    const row = await apiRequest<Record<string, any>>(`/yy/microForm/${id}/offline`, {
      method: 'POST',
    })
    return mapMicroFormRow(row, 'OFFLINE')
  },
  async listMicroFormSubmissions(query: MicroFormSubmissionQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/microFormSubmission/list', {
      formId: query.formId,
      formNameSnapshot: query.formNameSnapshot,
      customerName: query.customerName,
      customerPhone: query.customerPhone,
      followStatus: query.followStatus,
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
    })
    const items = rows.map(mapMicroFormSubmissionRow)
    return {
      items,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      total: items.length,
    } satisfies PageResponse<MicroFormSubmissionDto>
  },
  async getMicroFormSubmission(id: BackendId) {
    const row = await getData<Record<string, any>>(`/yy/microFormSubmission/${id}`)
    return mapMicroFormSubmissionRow(row)
  },
  async exportMicroFormSubmissions(query: { formId?: BackendId }): Promise<BlobResponse> {
    return apiRequestBlob('/yy/microFormSubmission/export', {
      method: 'POST',
      body: JSON.stringify({ formId: query.formId }),
    })
  },
  async updateMicroFormSubmissionFollow(payload: MicroFormSubmissionFollowPayload) {
    await apiRequestRaw<RuoyiResponse<void>>('/yy/microFormSubmission/follow', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  async listMicroPages(query: MicroPageListQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/microPage/list', {
      pageTitle: query.pageTitle,
      status: query.status,
      storeId: query.storeId,
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
    })
    const items = rows.map(row => mapMicroPageRow(row))
    return {
      items,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      total: items.length,
    } satisfies PageResponse<MicroPageDto>
  },
  async createMicroPage(payload: MicroPagePayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      pageTitle: payload.pageTitle,
      pageDesc: payload.pageDesc ?? '',
      coverUrl: payload.coverUrl ?? '',
      coverOssId: payload.coverOssId ?? null,
      backgroundColor: payload.backgroundColor ?? '#FBF8F2',
      editMode: payload.editMode ?? 'COMPONENT',
      status: payload.status ?? 'DRAFT',
      configJson: JSON.stringify(payload.schema ?? { components: [] }),
      linkKey: payload.linkKey ?? '',
      remark: payload.remark ?? '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/microPage', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const row = await findCreatedRecord<Record<string, any>>(
      '/yy/microPage/list',
      { pageTitle: body.pageTitle },
      item => String(item.pageTitle ?? '') === body.pageTitle,
      '微页面',
    )
    return mapMicroPageRow(row)
  },
  async updateMicroPage(payload: MicroPagePayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      pageTitle: payload.pageTitle,
      pageDesc: payload.pageDesc ?? '',
      coverUrl: payload.coverUrl ?? '',
      coverOssId: payload.coverOssId ?? null,
      backgroundColor: payload.backgroundColor ?? '#FBF8F2',
      editMode: payload.editMode ?? 'COMPONENT',
      status: payload.status ?? 'DRAFT',
      configJson: JSON.stringify(payload.schema ?? { components: [] }),
      linkKey: payload.linkKey ?? '',
      remark: payload.remark ?? '',
    }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/microPage', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return {
      id: body.id ?? '',
      storeId: body.storeId,
      pageTitle: body.pageTitle,
      pageDesc: body.pageDesc,
      coverUrl: body.coverUrl,
      coverOssId: body.coverOssId,
      backgroundColor: body.backgroundColor,
      editMode: body.editMode,
      status: body.status,
      schema: payload.schema ?? { components: [] },
      configJson: body.configJson,
      publishedConfigJson: '',
      publishedAt: '',
      linkKey: body.linkKey,
      remark: body.remark,
    } satisfies MicroPageDto
  },
  async deleteMicroPage(id: BackendId) {
    await apiRequestRaw<RuoyiResponse<void>>(`/yy/microPage/${id}`, {
      method: 'DELETE',
    })
  },
  async publishMicroPage(id: BackendId) {
    const row = await apiRequest<Record<string, any>>(`/yy/microPage/${id}/publish`, {
      method: 'POST',
    })
    return mapMicroPageRow(row, 'PUBLISHED')
  },
  async offlineMicroPage(id: BackendId) {
    const row = await apiRequest<Record<string, any>>(`/yy/microPage/${id}/offline`, {
      method: 'POST',
    })
    return mapMicroPageRow(row, 'OFFLINE')
  },
  async getMerchantDecoration(query: { storeId?: string; channelType?: string }) {
    const row = await apiRequest<Record<string, any>>('/yy/merchantDecoration', {}, {
      storeId: query.storeId,
      channelType: query.channelType,
    })
    return mapMerchantDecorationRow(row)
  },
  async saveMerchantDecoration(payload: MerchantDecorationPayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      channelType: payload.channelType,
      configJson: JSON.stringify(payload.config),
      shareIconOssId: payload.shareIconOssId ?? null,
      watermarkOssId: payload.watermarkOssId ?? null,
      remark: payload.remark ?? '',
    }
    const row = await apiRequest<Record<string, any>>('/yy/merchantDecoration', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return mapMerchantDecorationRow(row, {
      channelType: body.channelType,
      status: 'DRAFT',
      config: payload.config,
      configJson: body.configJson,
    })
  },
  async publishMerchantDecoration(payload: MerchantDecorationPayload) {
    const body = {
      id: payload.id,
      storeId: payload.storeId ?? null,
      channelType: payload.channelType,
      configJson: JSON.stringify(payload.config),
      shareIconOssId: payload.shareIconOssId ?? null,
      watermarkOssId: payload.watermarkOssId ?? null,
      remark: payload.remark ?? '',
    }
    const row = await apiRequest<Record<string, any>>('/yy/merchantDecoration/publish', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return {
      ...mapMerchantDecorationRow(row, {
        channelType: body.channelType,
        status: 'PUBLISHED',
        config: payload.config,
        configJson: body.configJson,
      }),
      publishedConfigJson: String(row.publishedConfigJson ?? body.configJson),
      publishedAt: String(row.publishedAt ?? new Date().toISOString()),
    } satisfies MerchantDecorationDto
  },
  async getPublicMicroForm(id: BackendId | string) {
    const row = await apiRequest<Record<string, any>>(`/yy/client/microForm/${id}`)
    return mapPublicMicroFormRow(row)
  },
  async submitPublicMicroForm(id: BackendId | string, payload: PublicMicroFormSubmitPayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/client/microForm/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return {
      submissionId: normalizeBackendId(row.submissionId),
      status: String(row.status || ''),
      submittedAt: String(row.submittedAt || ''),
    } satisfies PublicMicroFormSubmitResult
  },
  async getPublicMicroPage(id: BackendId | string) {
    const row = await apiRequest<Record<string, any>>(`/yy/client/micro-page/${id}`)
    return mapPublicMicroPageRow(row)
  },
}
