<template>
  <section class="rounded-xl border border-amber-topbar-border bg-white/70 p-4" :data-testid="testId">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h4 class="text-[12px] font-semibold text-amber-dark">{{ title }}</h4>
        <p class="mt-1 text-[11px] text-amber-text-muted">{{ description }}</p>
      </div>
      <span v-if="loading" class="text-[11px] text-amber-text-muted">加载中...</span>
    </div>

    <div v-if="!loading && !fields.length" class="mt-4 rounded-lg border border-dashed border-amber-topbar-border px-3 py-4 text-[11px] text-amber-text-muted">
      {{ emptyText }}
    </div>

    <div v-else class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label
        v-for="field in fields"
        :key="field.fieldCode"
        class="flex flex-col gap-1.5 text-[11px] font-medium text-amber-text-muted"
        :class="field.fieldType === 'TEXTAREA' || field.fieldType === 'CHECKBOX' ? 'sm:col-span-2' : ''"
      >
        <span class="flex items-center gap-1">
          <span>{{ field.fieldLabel }}</span>
          <span v-if="field.required" class="text-[var(--color-status-danger)]">*</span>
        </span>

        <textarea
          v-if="field.fieldType === 'TEXTAREA'"
          :value="readTextValue(field.value)"
          class="min-h-[72px] rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none"
          @input="updateField(field.fieldCode, ($event.target as HTMLTextAreaElement).value)"
        />

        <select
          v-else-if="field.fieldType === 'SELECT'"
          :value="readTextValue(field.value)"
          class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none"
          @change="updateField(field.fieldCode, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">请选择</option>
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>

        <div v-else-if="field.fieldType === 'CHECKBOX'" class="grid gap-2 rounded-md border border-amber-topbar-border bg-white px-3 py-3">
          <label v-for="option in field.options" :key="option" class="flex items-center gap-2 text-[12px] text-amber-dark">
            <input
              type="checkbox"
              class="h-4 w-4 accent-amber-dark"
              :checked="readArrayValue(field.value).includes(option)"
              @change="toggleCheckbox(field.fieldCode, option, ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ option }}</span>
          </label>
        </div>

        <input
          v-else
          :type="resolveInputType(field.fieldType)"
          :inputmode="field.fieldType === 'NUMBER' ? 'decimal' : field.fieldType === 'PHONE' ? 'tel' : undefined"
          :value="readTextValue(field.value)"
          class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none"
          @input="updateField(field.fieldCode, ($event.target as HTMLInputElement).value)"
        />

        <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">{{ getOrderAttributeFieldLabel(field.fieldType) }}</span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrderAttributeValue } from '../../shared/stores/appStoreTypes'
import { getOrderAttributeFieldLabel, updateOrderAttributeValues } from '../../shared/orderAttributes'

const props = withDefaults(defineProps<{
  fields: OrderAttributeValue[]
  title?: string
  description?: string
  emptyText?: string
  loading?: boolean
  testId?: string
}>(), {
  title: '订单属性',
  description: '这些字段来自当前门店的订单属性模板，保存时会一并写入订单快照。',
  emptyText: '当前门店还没有启用订单属性模板。',
  loading: false,
  testId: 'order-attribute-fields',
})

const emit = defineEmits<{
  'update:fields': [value: OrderAttributeValue[]]
}>()

const readTextValue = (value: OrderAttributeValue['value']) =>
  Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

const readArrayValue = (value: OrderAttributeValue['value']) =>
  Array.isArray(value) ? value.map(item => String(item ?? '')).filter(Boolean) : []

const updateField = (fieldCode: string, value: string) => {
  emit('update:fields', updateOrderAttributeValues(props.fields, fieldCode, value))
}

const toggleCheckbox = (fieldCode: string, option: string, checked: boolean) => {
  const current = readArrayValue(props.fields.find(field => field.fieldCode === fieldCode)?.value ?? [])
  const nextValue = checked
    ? [...new Set([...current, option])]
    : current.filter(item => item !== option)
  emit('update:fields', updateOrderAttributeValues(props.fields, fieldCode, nextValue))
}

const resolveInputType = (fieldType: string) => {
  if (fieldType === 'DATE') return 'date'
  if (fieldType === 'NUMBER') return 'number'
  if (fieldType === 'PHONE') return 'tel'
  return 'text'
}
</script>
