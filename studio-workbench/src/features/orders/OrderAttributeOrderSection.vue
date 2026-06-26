<template>
  <section class="rounded-3xl border border-amber-100 bg-amber-50/70 px-5 py-4 text-amber-950">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-semibold">订单属性</p>
        <p class="text-xs leading-5 text-amber-800">
          字段来自当前门店模板；保存时会把模板快照和值一起回写到订单，避免后续模板调整影响历史订单回显。
        </p>
      </div>
      <button
        type="button"
        class="rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving || loading || !fields.length"
        @click="save"
      >
        {{ saving ? '保存中...' : '保存订单属性' }}
      </button>
    </div>

    <p v-if="notice" class="mt-3 text-xs" :class="noticeType === 'error' ? 'text-red-700' : 'text-emerald-700'">{{ notice }}</p>

    <div class="mt-4">
      <OrderAttributeFieldsSection
        :fields="fields"
        :loading="loading"
        description="订单详情展示的是模板快照 + 当前订单值；门店模板新增字段后，这里会自动补齐未填写项。"
        @update:fields="fields = $event"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { backendApi } from '../../shared/api/backend'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import { mapOrder } from '../../shared/stores/appStoreTransforms'
import type { OrderAttributeValue } from '../../shared/stores/appStoreTypes'
import { buildOrderAttributeValues, toOrderAttributePayload } from '../../shared/orderAttributes'
import OrderAttributeFieldsSection from './OrderAttributeFieldsSection.vue'

const props = defineProps<{
  order: BookingOrder
}>()

const loading = ref(false)
const saving = ref(false)
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')
const fields = ref<OrderAttributeValue[]>([])

const syncOrderCaches = (next: BookingOrder) => {
  const replace = (orders: BookingOrder[]) =>
    orders.map(order => (order.backendId === next.backendId || order.id === next.id ? next : order))
  appStore.orders = replace(appStore.orders)
  appStore.ledgerOrders = replace(appStore.ledgerOrders)
  appStore.reportOrders = replace(appStore.reportOrders)
  Object.assign(props.order, next)
}

const load = async () => {
  notice.value = ''
  const storeBackendId = props.order.storeBackendId
  if (!storeBackendId) {
    fields.value = props.order.orderAttributes || []
    return
  }
  loading.value = true
  try {
    const templates = await backendApi.listOrderAttributeTemplates(storeBackendId)
    fields.value = buildOrderAttributeValues(templates, props.order.orderAttributes || [])
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '订单属性模板加载失败'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  notice.value = ''
  try {
    const dto = await backendApi.updateOrder({
      id: props.order.backendId,
      storeId: props.order.storeBackendId,
      orderNo: props.order.id,
      orderAttributes: toOrderAttributePayload(fields.value),
      remark: props.order.remark,
    })
    const next = mapOrder(dto, appStore.stores)
    fields.value = next.orderAttributes || []
    syncOrderCaches(next)
    noticeType.value = 'success'
    notice.value = '订单属性已保存'
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '订单属性保存失败'
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.order.backendId, props.order.storeBackendId, props.order.orderAttributeJson].join('|'),
  () => {
    void load()
  },
  { immediate: true },
)
</script>
