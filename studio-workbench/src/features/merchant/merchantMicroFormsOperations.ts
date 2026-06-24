import type { MicroFormDto, MicroFormSubmissionDto } from '../../shared/api/backend'

export type MicroFormStoreOption = {
  backendId?: string | number | null
  name?: string
}

export type SubmissionFollowDraft = {
  followStatus: string
  followRemark: string
}

export const normalizeStoreFilter = (preferred: string, concreteStoreOptions: MicroFormStoreOption[]) => {
  const matched = concreteStoreOptions.find(store => String(store.backendId) === preferred)
  return String(matched?.backendId ?? concreteStoreOptions[0]?.backendId ?? '')
}

export const storeNameForForm = (form: MicroFormDto, stores: MicroFormStoreOption[]) => {
  if (!form.storeId) return '全部门店'
  return stores.find(store => store.backendId === form.storeId)?.name ?? `门店 #${form.storeId}`
}

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

export const buildMicroFormLink = (form: MicroFormDto, baseUrl: string, storeFilter: string) => {
  const key = encodeURIComponent(form.linkKey || form.id)
  const base = baseUrl.trim()
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
  const effectiveStoreId = form.storeId || storeFilter
  return appendStoreScope(link, effectiveStoreId)
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

export const filterMicroForms = (forms: MicroFormDto[], storeFilter: string) =>
  forms.filter(form => !storeFilter || form.storeId === storeFilter)

export const selectMicroFormId = (currentId: string, forms: MicroFormDto[]) =>
  currentId && forms.some(form => form.id === currentId) ? currentId : forms[0]?.id ?? ''

export const selectSubmissionId = (currentId: string, items: MicroFormSubmissionDto[]) =>
  items.some(item => item.id === currentId) ? currentId : items[0]?.id ?? ''

export const fillSubmissionFollowDraft = (
  draft: SubmissionFollowDraft,
  submission: MicroFormSubmissionDto | null | undefined,
) => {
  draft.followStatus = submission?.followStatus || 'PENDING'
  draft.followRemark = submission?.followRemark || ''
}
