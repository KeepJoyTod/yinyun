import type { MicroFormDto, MicroFormFieldSchema, MicroFormFieldType, MicroFormPayload } from '../../shared/api/backend'

export const needsOptions = (type: MicroFormFieldType) => type === 'select' || type === 'checkbox' || type === 'radio'

export const createMicroFormFieldId = (type: MicroFormFieldType) =>
  `${type}-${globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 10) || Date.now()}`

export const cloneMicroFormSchema = (schema: MicroFormDto['schema']) =>
  JSON.parse(JSON.stringify(schema)) as MicroFormDto['schema']

export const ensureFieldExtensions = (field: MicroFormFieldSchema) => {
  field.rules ??= {}
  field.visibility ??= {}
  field.binding ??= {}
  field.privacy ??= {}
  return field
}

export const safeRegExp = (pattern: string) => {
  try {
    return new RegExp(pattern)
  } catch {
    return null
  }
}

export const validateMicroFormDraft = (
  draft: MicroFormPayload,
  canUseGlobalStoreScope: boolean,
  normalizeDraftStoreId: () => string | number | null,
) => {
  if (!draft.formName.trim()) return '请输入表单名称'
  if (!canUseGlobalStoreScope && !normalizeDraftStoreId()) return '当前账号没有可用门店，无法保存表单'
  if (!draft.schema.fields.length) return '请至少添加一个字段'
  const invalidField = draft.schema.fields.find(field => !field.label.trim() || !field.id.trim())
  if (invalidField) return '字段标题不能为空'
  const invalidOptions = draft.schema.fields.find(field => needsOptions(field.type) && !field.options?.length)
  if (invalidOptions) return `${invalidOptions.label} 至少需要一个选项`
  const invalidPattern = draft.schema.fields.find(field => field.rules?.pattern && field.rules.pattern.trim() && !safeRegExp(field.rules.pattern.trim()))
  if (invalidPattern) return `${invalidPattern.label} 的正则表达式无效`
  return ''
}

export const normalizeField = (field: MicroFormFieldSchema, index: number): MicroFormFieldSchema => {
  const rules = field.rules || {}
  const visibility = field.visibility || {}
  const binding = field.binding || {}
  const privacy = field.privacy || {}

  return {
    id: field.id,
    type: field.type,
    label: field.label,
    required: field.type === 'label' ? false : field.required === true,
    placeholder: field.type === 'label' ? '' : field.placeholder || '',
    options: needsOptions(field.type) ? (field.options ?? []).filter(Boolean) : [],
    sort: index + 1,
    rules: field.type === 'label' ? undefined : {
      required: field.required === true || rules.required === true,
      minLength: Number(rules.minLength ?? 0) || undefined,
      maxLength: Number(rules.maxLength ?? 0) || undefined,
      unique: rules.unique === true,
      pattern: String(rules.pattern || '').trim() || undefined,
      message: String(rules.message || '').trim() || undefined,
    },
    visibility: visibility.fieldId
      ? {
          fieldId: visibility.fieldId,
          equals: String(visibility.equals || '').trim() || undefined,
          notEquals: String(visibility.notEquals || '').trim() || undefined,
        }
      : undefined,
    binding: binding.sourceParam || binding.storeField || binding.serviceGroupField
      ? {
          sourceParam: String(binding.sourceParam || '').trim() || undefined,
          storeField: binding.storeField === true,
          serviceGroupField: binding.serviceGroupField === true,
        }
      : undefined,
    privacy: privacy.enabled
      ? {
          enabled: true,
          label: String(privacy.label || '').trim() || '我已阅读并同意隐私协议',
          required: privacy.required !== false,
        }
      : undefined,
  }
}
