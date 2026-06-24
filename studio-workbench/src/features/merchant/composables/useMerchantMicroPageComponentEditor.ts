import type { MicroFormDto, MicroPageComponentSchema } from '../../../shared/api/backend'
import {
  componentItems,
  componentProps,
  microFormLink,
} from '../merchantMicroPagesOperations'

export const useMerchantMicroPageComponentEditor = ({
  getPublicMicroFormBaseUrl,
  getStoreId,
  getPublishedMicroForms,
  pushHistory,
}: {
  getPublicMicroFormBaseUrl: () => string
  getStoreId: () => string | null | undefined
  getPublishedMicroForms: () => MicroFormDto[]
  pushHistory: () => void
}) => {
  const updateComponentProp = (component: MicroPageComponentSchema, key: string, value: unknown) => {
    component.props = { ...componentProps(component), [key]: value }
    pushHistory()
  }

  const updateComponentTitle = (component: MicroPageComponentSchema, value: string) => {
    component.title = value.trim()
    pushHistory()
  }

  const updateComponentNumberProp = (component: MicroPageComponentSchema, key: string, value: string) => {
    const parsed = Number(value)
    updateComponentProp(component, key, Number.isFinite(parsed) ? parsed : '')
  }

  const updateListItem = (component: MicroPageComponentSchema, key: string, index: number, field: string, value: string) => {
    const items = componentItems(component, key).map(item => ({ ...item }))
    if (!items[index]) return
    items[index][field] = value
    updateComponentProp(component, key, items)
  }

  const bindMicroFormLink = (component: MicroPageComponentSchema, index: number, formId: string) => {
    const form = getPublishedMicroForms().find(item => item.id === formId)
    updateListItem(component, 'items', index, 'link', form ? microFormLink(form, getPublicMicroFormBaseUrl(), getStoreId()) : '#store')
  }

  const addListItem = (component: MicroPageComponentSchema, key: string, item: Record<string, unknown>) => {
    updateComponentProp(component, key, [...componentItems(component, key), item])
  }

  const removeListItem = (component: MicroPageComponentSchema, key: string, index: number) => {
    updateComponentProp(component, key, componentItems(component, key).filter((_, itemIndex) => itemIndex !== index))
  }

  const updatePrimaryText = (component: MicroPageComponentSchema, value: string) => {
    component.props = { ...(component.props || {}), text: value }
    pushHistory()
  }

  const updateSecondaryText = (component: MicroPageComponentSchema, value: string) => {
    component.props = { ...(component.props || {}), description: value }
    pushHistory()
  }

  return {
    updateComponentProp,
    updateComponentTitle,
    updateComponentNumberProp,
    updateListItem,
    bindMicroFormLink,
    addListItem,
    removeListItem,
    updatePrimaryText,
    updateSecondaryText,
  }
}
