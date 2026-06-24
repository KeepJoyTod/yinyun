import { defineComponent, h } from 'vue'
import type { CardProductItem } from '../../../shared/stores/appStore'

export type ProductOption = {
  id: string
  name: string
  bizCategory?: string
}

export const PanelBlock = defineComponent({
  name: 'PanelBlock',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('section', { class: 'rounded-[24px] border border-amber-topbar-border bg-white/80 p-5' }, [
        h('div', { class: 'border-b border-amber-topbar-border pb-4' }, [
          h('div', { class: 'text-[15px] font-semibold text-amber-dark' }, props.title),
          props.description ? h('p', { class: 'mt-2 text-[11px] leading-relaxed text-amber-text-muted' }, props.description) : null,
        ]),
        h('div', { class: 'pt-4' }, slots.default?.()),
      ])
  },
})

export const FieldBlock = defineComponent({
  name: 'FieldBlock',
  props: {
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      h('label', { class: 'flex flex-col gap-2' }, [
        h('span', { class: 'text-[11px] font-semibold text-amber-dark' }, props.required ? `${props.label} *` : props.label),
        slots.default?.(),
      ])
  },
})

export const RadioChip = defineComponent({
  name: 'RadioChip',
  props: {
    modelValue: { type: [String, Boolean, Number], required: true },
    value: { type: [String, Boolean, Number], required: true },
    label: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          class: [
            'yy-action rounded-full border px-4 py-2 text-[11px] transition-all',
            props.modelValue === props.value
              ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
              : 'border-amber-topbar-border bg-white text-amber-dark hover:bg-black/5',
          ],
          type: 'button',
          onClick: () => emit('update:modelValue', props.value),
        },
        props.label,
      )
  },
})

export const ChoiceCard = defineComponent({
  name: 'ChoiceCard',
  props: {
    modelValue: { type: [String, Boolean, Number], required: true },
    value: { type: [String, Boolean, Number], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          class: [
            'yy-action w-full rounded-[18px] border px-4 py-4 text-left transition-all',
            props.modelValue === props.value
              ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]'
              : 'border-amber-topbar-border bg-[#FBF7F0] text-amber-dark hover:bg-white',
          ],
          type: 'button',
          onClick: () => emit('update:modelValue', props.value),
        },
        [
          h('div', { class: 'text-[12px] font-semibold' }, props.title),
          h(
            'div',
            {
              class: [
                'mt-2 text-[10px] leading-relaxed',
                props.modelValue === props.value ? 'text-[#F4EFE6]/75' : 'text-amber-text-muted',
              ],
            },
            props.description,
          ),
        ],
      )
  },
})

export const SummaryCard = defineComponent({
  name: 'SummaryCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] px-4 py-4' }, [
        h('div', { class: 'text-[10px] uppercase tracking-[0.16em] text-amber-text-muted' }, props.label),
        h('div', { class: 'mt-2 text-[12px] font-semibold leading-relaxed text-amber-dark' }, props.value || '-'),
      ])
  },
})

export const AmountInput = defineComponent({
  name: 'AmountInput',
  props: {
    modelValue: { type: String, required: true },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'flex overflow-hidden rounded-[16px] border border-amber-topbar-border bg-white' }, [
        h('input', {
          class: 'h-11 min-w-0 flex-1 bg-transparent px-4 text-[12px] text-amber-dark outline-none',
          min: '0',
          placeholder: props.placeholder,
          step: '0.01',
          type: 'number',
          value: props.modelValue,
          onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
        }),
        h('span', { class: 'inline-flex w-[68px] items-center justify-center border-l border-amber-topbar-border text-[12px] font-semibold text-amber-text-muted' }, '元'),
      ])
  },
})

export const ServiceItemRow = defineComponent({
  name: 'ServiceItemRow',
  props: {
    item: {
      type: Object as () => CardProductItem,
      required: true,
    },
    options: {
      type: Array as () => ProductOption[],
      default: () => [],
    },
    labelPrefix: {
      type: String,
      default: '服务',
    },
    countEnabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'remove'],
  setup(props, { emit }) {
    const onProductChange = (event: Event) => {
      const target = event.target as HTMLSelectElement
      const option = props.options.find(item => item.id === target.value)
      emit('change', {
        productId: target.value,
        productName: option?.name ?? '',
        count: props.item.count ?? 1,
      })
    }

    const onCountChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('change', {
        productId: props.item.productId,
        productName: props.item.productName,
        count: Number(target.value) || 0,
      })
    }

    return () =>
      h('div', { class: 'rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] p-4' }, [
        h('div', { class: 'grid gap-3 md:grid-cols-[1fr_120px_auto]' }, [
          h('select', {
            class: 'h-11 rounded-[14px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none',
            value: props.item.productId ?? '',
            onChange: onProductChange,
          }, [
            h('option', { value: '' }, `请选择${props.labelPrefix}项目`),
            ...props.options.map(option =>
              h('option', { key: option.id, value: option.id }, `${option.name}${option.bizCategory ? ` / ${option.bizCategory}` : ''}`),
            ),
          ]),
          props.countEnabled
            ? h('input', {
                class: 'h-11 rounded-[14px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none',
                min: '1',
                placeholder: '次数',
                step: '1',
                type: 'number',
                value: String(props.item.count ?? 1),
                onInput: onCountChange,
              })
            : h('div', { class: 'flex items-center rounded-[14px] border border-amber-topbar-border bg-white px-4 text-[11px] text-amber-text-muted' }, '按配置范围使用'),
          h(
            'button',
            {
              class: 'yy-action h-11 rounded-[14px] border border-amber-topbar-border px-4 text-[11px] text-amber-text-muted hover:bg-black/5 hover:text-amber-dark',
              type: 'button',
              onClick: () => emit('remove'),
            },
            '删除',
          ),
        ]),
      ])
  },
})
