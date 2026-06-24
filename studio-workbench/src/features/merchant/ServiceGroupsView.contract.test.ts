import { describe, expect, it } from 'vitest'
import serviceGroupsViewSource from './ServiceGroupsView.vue?raw'
import deleteDialogSource from './components/ServiceGroupDeleteDialog.vue?raw'
import formDialogSource from './components/ServiceGroupFormDialog.vue?raw'
import scheduleDrawerSource from './components/ServiceGroupScheduleDrawer.vue?raw'
import tableSource from './components/ServiceGroupsTable.vue?raw'
import serviceGroupOperationsSource from './serviceGroupOperations?raw'

const serviceGroupsSource = [
  serviceGroupsViewSource,
  tableSource,
  formDialogSource,
  scheduleDrawerSource,
  deleteDialogSource,
  serviceGroupOperationsSource,
].join('\n')

describe('merchant service groups contract', () => {
  it('uses the shared merchant chrome and service group table', () => {
    expect(serviceGroupsSource).toContain('MerchantModuleChrome')
    expect(serviceGroupsSource).toContain('服务组')
    expect(serviceGroupsSource).not.toContain('Service Groups')
    expect(serviceGroupsSource).toContain('服务组管理')
    expect(serviceGroupsSource).toContain('新增服务组')
    expect(serviceGroupsSource).toContain('服务组名称')
    expect(serviceGroupsSource).toContain('所属门店')
    expect(serviceGroupsSource).toContain('默认容量')
  })

  it('preserves backend-backed loading, filtering, save, and delete flow', () => {
    expect(serviceGroupsSource).toContain('appStore.loadServiceGroups')
    expect(serviceGroupsSource).toContain('appStore.saveServiceGroup')
    expect(serviceGroupsSource).toContain('appStore.deleteServiceGroup')
    expect(serviceGroupsSource).toContain('filteredGroups')
    expect(serviceGroupsSource).toContain('storeFilter')
    expect(serviceGroupsSource).toContain('activeFilter')
    expect(serviceGroupsSource).toContain('searchQuery')
    expect(serviceGroupsSource).toContain('resetFilters')
  })

  it('scopes service group management to a concrete store instead of all stores', () => {
    expect(serviceGroupsSource).toContain('concreteStoreOptions')
    expect(serviceGroupsSource).toContain('normalizeStoreFilter')
    expect(serviceGroupsSource).toContain('ensureWorkbenchStores')
    expect(serviceGroupsSource).toContain('await ensureWorkbenchStores()')
    expect(serviceGroupsSource).toContain('storeFilter.value = normalizeStoreFilter()')
    expect(serviceGroupsSource).not.toContain('<option value="all">全部门店</option>')
    expect(serviceGroupsSource).not.toContain("storeFilter.value !== 'all'")
    expect(serviceGroupsSource).not.toContain('切回全部门店')
  })

  it('keeps the create and edit modal wired to service group fields', () => {
    expect(serviceGroupsSource).toContain('modalOpen')
    expect(serviceGroupsSource).toContain('openCreate')
    expect(serviceGroupsSource).toContain('openEdit')
    expect(serviceGroupsSource).toContain('form.durationMinutes')
    expect(serviceGroupsSource).toContain('form.capacity')
    expect(serviceGroupsSource).toContain('保存服务组')
  })

  it('replaces the placeholder with a real schedule drawer and inventory deep link', () => {
    expect(serviceGroupsSource).toContain('@schedule="openScheduleDrawer"')
    expect(serviceGroupsSource).toContain('backendApi.listScheduleRules')
    expect(serviceGroupsSource).toContain('backendApi.listBookingInventory')
    expect(serviceGroupsSource).toContain('前往库存页')
    expect(serviceGroupsSource).toContain('saveScheduleRule')
    expect(serviceGroupsSource).toContain('确认删除服务组')
  })
})
