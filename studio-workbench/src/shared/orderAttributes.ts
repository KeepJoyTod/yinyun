import type { OrderAttributeTemplateDto, OrderAttributeValuePayload } from './api/backendTypes'
import type { OrderAttributeValue } from './stores/appStoreTypes'

export const ORDER_ATTRIBUTE_FIELD_OPTIONS = [
  { value: 'TEXT', label: '单行文本' },
  { value: 'TEXTAREA', label: '多行文本' },
  { value: 'PHONE', label: '手机号' },
  { value: 'DATE', label: '日期' },
  { value: 'NUMBER', label: '数字' },
  { value: 'SELECT', label: '下拉单选' },
  { value: 'CHECKBOX', label: '多选框' },
] as const

export const getOrderAttributeFieldLabel = (fieldType: string) =>
  ORDER_ATTRIBUTE_FIELD_OPTIONS.find(option => option.value === fieldType)?.label ?? fieldType

const normalizeCheckboxValue = (value: unknown) => {
  if (Array.isArray(value)) return value.map(item => String(item ?? '')).filter(Boolean)
  if (typeof value === 'string') return value ? [value] : []
  return []
}

const normalizeScalarValue = (value: unknown) => {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return value == null ? '' : String(value)
}

export const normalizeOrderAttributeValue = (
  fieldType: string,
  value: unknown,
): OrderAttributeValue['value'] => (fieldType === 'CHECKBOX'
  ? normalizeCheckboxValue(value)
  : normalizeScalarValue(value))

export const buildOrderAttributeValues = (
  templates: OrderAttributeTemplateDto[],
  existing: OrderAttributeValue[] = [],
): OrderAttributeValue[] => {
  const existingFields = existing.map(field => ({
    fieldCode: field.fieldCode,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    sort: Number(field.sort ?? 0),
    value: normalizeOrderAttributeValue(field.fieldType, field.value),
  }))
  const existingCodes = new Set(existingFields.map(field => field.fieldCode))
  const appendedTemplateFields = templates
    .filter(template => template.status !== 'DISABLED')
    .filter(template => !existingCodes.has(template.fieldCode))
    .map(template => ({
      fieldCode: template.fieldCode,
      fieldLabel: template.fieldLabel,
      fieldType: template.fieldType,
      required: template.required === '1',
      options: template.options || [],
      sort: Number(template.sort ?? 0),
      value: template.fieldType === 'CHECKBOX' ? [] : '',
    } satisfies OrderAttributeValue))
  return [...existingFields, ...appendedTemplateFields]
    .sort((a, b) => a.sort - b.sort || a.fieldCode.localeCompare(b.fieldCode))
}

export const toOrderAttributePayload = (values: OrderAttributeValue[]): OrderAttributeValuePayload[] =>
  values.map(field => ({
    fieldCode: field.fieldCode,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType as OrderAttributeValuePayload['fieldType'],
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    sort: Number(field.sort ?? 0),
    value: field.fieldType === 'CHECKBOX'
      ? normalizeCheckboxValue(field.value)
      : normalizeScalarValue(field.value).trim() || null,
  }))

export const updateOrderAttributeValues = (
  values: OrderAttributeValue[],
  fieldCode: string,
  nextValue: OrderAttributeValue['value'],
) => values.map(field => (field.fieldCode === fieldCode ? { ...field, value: nextValue } : field))
