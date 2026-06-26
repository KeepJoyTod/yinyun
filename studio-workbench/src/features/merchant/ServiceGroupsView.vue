<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-5 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <div class="yy-eyebrow">服务组</div>
          <h2 class="mt-2 font-serif text-[22px] leading-none text-amber-dark">服务组管理</h2>
        </div>
        <button class="yy-action inline-flex items-center gap-2 bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6]" type="button" @click="openCreate">
          <Plus :size="14" :stroke-width="1.9" />
          新增服务组
        </button>
      </div>

      <NoticeBar :notice="notice" />

      <MerchantConfigScopeBar
        v-model:active-filter="activeFilter"
        v-model:search-query="searchQuery"
        v-model:store-filter="storeFilter"
        :concrete-store-options="concreteStoreOptions"
        :loading="loading"
        @reload="reload"
        @reset="resetFilters"
      />

      <ServiceGroupsTable
        :groups="filteredGroups"
        :is-row-busy="isRowBusy"
        :product-hint="productHint"
        :service-mode="serviceMode"
        :updated-at-hint="updatedAtHint"
        @delete="openDeleteDialog"
        @edit="openEdit"
        @schedule="openScheduleDrawer"
        @toggle="toggleGroupStatus"
      />
    </section>

    <ServiceGroupFormDialog
      :editing-id="editingId"
      :errors="formErrors"
      :form="form"
      :open="modalOpen"
      :saving="saving"
      :stores="concreteStoreOptions"
      @close="modalOpen = false"
      @submit="submit"
    />

    <ServiceGroupScheduleDrawer
      :form="scheduleRuleForm"
      :inventory-conflicts="inventoryConflicts"
      :inventory-loading="inventoryLoading"
      :inventory-summary-cards="inventorySummaryCards"
      :rules="scheduleRules"
      :schedule-loading="scheduleLoading"
      :schedule-saving="scheduleSaving"
      :target="scheduleDrawerTarget"
      :weekday-label="weekdayLabel"
      :weekday-options="weekdayOptions"
      @close="closeScheduleDrawer"
      @create-rule="openScheduleRuleCreate"
      @edit-rule="openScheduleRuleEdit"
      @go-inventory="goInventoryDeepLink"
      @reload-inventory="loadScheduleInventory"
      @remove-rule="removeScheduleRule"
      @reset-rule="resetScheduleRuleForm"
      @save-rule="saveScheduleRule"
    />

    <ServiceGroupDeleteDialog
      :busy="isDeleteBusy"
      :target="deleteTarget"
      @close="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import ServiceGroupDeleteDialog from './components/ServiceGroupDeleteDialog.vue'
import ServiceGroupFormDialog from './components/ServiceGroupFormDialog.vue'
import ServiceGroupScheduleDrawer from './components/ServiceGroupScheduleDrawer.vue'
import ServiceGroupsTable from './components/ServiceGroupsTable.vue'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import MerchantConfigScopeBar from './modules/config/components/MerchantConfigScopeBar.vue'
import { useMerchantConfigState } from './modules/config/composables/useMerchantConfigState'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { useNotice } from '../../shared/composables/useNotice'
import { appStore, type ServiceGroupInfo } from '../../shared/stores/appStore'
import { backendApi, type BookingInventoryDto, type ScheduleRuleDto } from '../../shared/api/backend'
import {
  buildInventorySummaryCards,
  filterServiceGroups,
  resolveServiceGroupProductHint,
  resolveServiceGroupUpdatedAtHint,
  resolveServiceMode,
  resolveWeekdayLabel,
  type ScheduleRuleFormDraft,
  type ServiceGroupFormDraft,
} from './serviceGroupOperations'

const router = useRouter()
const route = useRoute()
const { notice, pushNotice } = useNotice()

const {
  loading,
  searchQuery,
  storeFilter,
  activeFilter,
  groups,
  concreteStoreOptions,
  reload,
  resetFilters,
} = useMerchantConfigState({
  initialStoreId: String(route.query.storeId ?? ''),
  pushError: message => pushNotice('error', message),
})

const saving = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<ServiceGroupInfo | null>(null)
const rowActionState = ref<{ id: string; action: 'toggle' | 'delete' } | null>(null)

const scheduleDrawerTarget = ref<ServiceGroupInfo | null>(null)
const scheduleLoading = ref(false)
const scheduleSaving = ref(false)
const inventoryLoading = ref(false)
const scheduleRules = ref<ScheduleRuleDto[]>([])
const inventoryOverview = ref<BookingInventoryDto[]>([])

const form = reactive<ServiceGroupFormDraft>({
  storeBackendId: '',
  code: '',
  name: '',
  capacity: 0,
  durationMinutes: 0,
  serviceMode: 'HORIZONTAL',
  status: 'ACTIVE',
  sort: 0,
  remark: '',
})

const formErrors = reactive<Record<string, string>>({
  name: '',
  code: '',
  storeBackendId: '',
})

const scheduleRuleForm = reactive<ScheduleRuleFormDraft>({
  id: '',
  weekday: 1,
  startTime: '09:00',
  endTime: '18:00',
  capacity: 0,
  enabled: 'Y',
  remark: '',
})

const weekdayOptions = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' },
]

const filteredGroups = computed(() => filterServiceGroups({
  groups: groups.value,
  storeFilter: storeFilter.value,
  activeFilter: activeFilter.value,
  searchQuery: searchQuery.value,
}))

const isRowBusy = (backendId: string) => rowActionState.value?.id === backendId
const isDeleteBusy = computed(() =>
  rowActionState.value?.action === 'delete' && rowActionState.value?.id === deleteTarget.value?.backendId,
)
const inventoryConflicts = computed(() => inventoryOverview.value.filter(item => Number(item.conflictCount ?? 0) > 0))
const inventorySummaryCards = computed(() => buildInventorySummaryCards(inventoryOverview.value, formatDateKey(0)))

const validateForm = () => {
  formErrors.name = form.name.trim() ? '' : '服务组名称不能为空'
  formErrors.code = form.code.trim() ? '' : '服务组编码不能为空'
  formErrors.storeBackendId = form.storeBackendId ? '' : '请选择门店'
  return !formErrors.name && !formErrors.code && !formErrors.storeBackendId
}

const resetForm = () => {
  editingId.value = null
  form.storeBackendId = storeFilter.value || String(concreteStoreOptions.value[0]?.backendId ?? '')
  form.code = ''
  form.name = ''
  form.capacity = 3
  form.durationMinutes = 60
  form.serviceMode = 'HORIZONTAL'
  form.status = 'ACTIVE'
  form.sort = 10
  form.remark = ''
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const openEdit = (group: ServiceGroupInfo) => {
  editingId.value = group.backendId
  form.storeBackendId = group.storeBackendId
  form.code = group.code
  form.name = group.name
  form.capacity = group.capacity
  form.durationMinutes = group.durationMinutes
  form.serviceMode = group.serviceMode === 'VERTICAL' ? 'VERTICAL' : 'HORIZONTAL'
  form.status = group.status
  form.sort = group.sort
  form.remark = group.remark
  modalOpen.value = true
}

const openDeleteDialog = (group: ServiceGroupInfo) => {
  deleteTarget.value = group
}

const closeDeleteDialog = () => {
  if (isDeleteBusy.value) return
  deleteTarget.value = null
}

const toggleGroupStatus = async (group: ServiceGroupInfo) => {
  rowActionState.value = { id: group.backendId, action: 'toggle' }
  try {
    const next = await appStore.saveServiceGroup({
      id: group.backendId,
      storeBackendId: group.storeBackendId,
      code: group.code,
      name: group.name,
      capacity: group.capacity,
      durationMinutes: group.durationMinutes,
      serviceMode: group.serviceMode === 'VERTICAL' ? 'VERTICAL' : 'HORIZONTAL',
      status: group.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
      sort: group.sort,
      remark: group.remark,
    })
    await reload()
    pushNotice('success', next.status === 'ACTIVE' ? `${next.name} 已启用` : `${next.name} 已停用`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '服务组状态更新失败')
  } finally {
    rowActionState.value = null
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  rowActionState.value = { id: deleteTarget.value.backendId, action: 'delete' }
  try {
    const targetName = deleteTarget.value.name
    await appStore.deleteServiceGroup(deleteTarget.value.backendId)
    deleteTarget.value = null
    await reload()
    pushNotice('success', `${targetName} 已删除`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '服务组删除失败')
  } finally {
    rowActionState.value = null
  }
}

const submit = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const next = await appStore.saveServiceGroup({
      id: editingId.value ?? undefined,
      storeBackendId: form.storeBackendId,
      code: form.code,
      name: form.name,
      capacity: form.capacity,
      durationMinutes: form.durationMinutes,
      serviceMode: form.serviceMode,
      status: form.status,
      sort: form.sort,
      remark: form.remark,
    })
    modalOpen.value = false
    await reload()
    pushNotice('success', `${next.name} 已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '服务组保存失败')
  } finally {
    saving.value = false
  }
}

const serviceMode = resolveServiceMode
const productHint = resolveServiceGroupProductHint
const updatedAtHint = resolveServiceGroupUpdatedAtHint
const weekdayLabel = (weekday: number) => resolveWeekdayLabel(weekday, weekdayOptions)

const resetScheduleRuleForm = () => {
  scheduleRuleForm.id = ''
  scheduleRuleForm.weekday = 1
  scheduleRuleForm.startTime = '09:00'
  scheduleRuleForm.endTime = '18:00'
  scheduleRuleForm.capacity = scheduleDrawerTarget.value?.capacity || 0
  scheduleRuleForm.enabled = 'Y'
  scheduleRuleForm.remark = ''
}

const loadScheduleRules = async () => {
  if (!scheduleDrawerTarget.value) return
  scheduleLoading.value = true
  try {
    scheduleRules.value = await backendApi.listScheduleRules({
      storeId: scheduleDrawerTarget.value.storeBackendId,
      serviceGroupId: scheduleDrawerTarget.value.backendId,
    })
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '档期规则加载失败')
  } finally {
    scheduleLoading.value = false
  }
}

const formatDateKey = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const loadScheduleInventory = async () => {
  if (!scheduleDrawerTarget.value) return
  inventoryLoading.value = true
  try {
    inventoryOverview.value = await backendApi.listBookingInventory({
      storeId: scheduleDrawerTarget.value.storeBackendId,
      serviceGroupId: scheduleDrawerTarget.value.backendId,
      beginBizDate: formatDateKey(0),
      endBizDate: formatDateKey(30),
    })
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '库存概览加载失败')
  } finally {
    inventoryLoading.value = false
  }
}

const openScheduleDrawer = async (group: ServiceGroupInfo) => {
  scheduleDrawerTarget.value = group
  resetScheduleRuleForm()
  await Promise.all([loadScheduleRules(), loadScheduleInventory()])
}

const closeScheduleDrawer = () => {
  scheduleDrawerTarget.value = null
  scheduleRules.value = []
  inventoryOverview.value = []
  resetScheduleRuleForm()
}

const openScheduleRuleCreate = () => {
  resetScheduleRuleForm()
}

const openScheduleRuleEdit = (rule: ScheduleRuleDto) => {
  scheduleRuleForm.id = rule.id
  scheduleRuleForm.weekday = Number(rule.weekday || 1)
  scheduleRuleForm.startTime = rule.startTime
  scheduleRuleForm.endTime = rule.endTime
  scheduleRuleForm.capacity = Number(rule.capacity || scheduleDrawerTarget.value?.capacity || 0)
  scheduleRuleForm.enabled = rule.enabled || 'Y'
  scheduleRuleForm.remark = rule.remark || ''
}

const saveScheduleRule = async () => {
  if (!scheduleDrawerTarget.value) return
  if (!scheduleRuleForm.startTime || !scheduleRuleForm.endTime) {
    pushNotice('error', '请填写完整的开始和结束时间')
    return
  }
  scheduleSaving.value = true
  try {
    const payload = {
      id: scheduleRuleForm.id || undefined,
      storeId: scheduleDrawerTarget.value.storeBackendId,
      serviceGroupId: scheduleDrawerTarget.value.backendId,
      weekday: scheduleRuleForm.weekday,
      startTime: scheduleRuleForm.startTime,
      endTime: scheduleRuleForm.endTime,
      capacity: scheduleRuleForm.capacity,
      enabled: scheduleRuleForm.enabled,
      remark: scheduleRuleForm.remark,
    }
    if (scheduleRuleForm.id) await backendApi.updateScheduleRule(payload)
    else await backendApi.createScheduleRule(payload)
    await Promise.all([loadScheduleRules(), loadScheduleInventory()])
    resetScheduleRuleForm()
    pushNotice('success', '档期规则已保存')
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '档期规则保存失败')
  } finally {
    scheduleSaving.value = false
  }
}

const removeScheduleRule = async (id: string) => {
  const confirmed = globalThis.confirm('确认删除这条档期规则吗？')
  if (!confirmed) return
  try {
    await backendApi.deleteScheduleRule(id)
    await Promise.all([loadScheduleRules(), loadScheduleInventory()])
    if (scheduleRuleForm.id === id) resetScheduleRuleForm()
    pushNotice('success', '档期规则已删除')
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '档期规则删除失败')
  }
}

const goInventoryDeepLink = () => {
  if (!scheduleDrawerTarget.value) return
  router.push({
    path: '/merchant/inventory',
    query: {
      serviceGroupId: scheduleDrawerTarget.value.backendId,
      storeId: scheduleDrawerTarget.value.storeBackendId,
    },
  })
}

void reload()
</script>
