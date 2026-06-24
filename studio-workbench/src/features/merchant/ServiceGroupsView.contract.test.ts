import { describe, expect, it } from 'vitest'
import serviceGroupsViewSource from './ServiceGroupsView.vue?raw'
import deleteDialogSource from './components/ServiceGroupDeleteDialog.vue?raw'
import formDialogSource from './components/ServiceGroupFormDialog.vue?raw'
import scheduleDrawerSource from './components/ServiceGroupScheduleDrawer.vue?raw'
import tableSource from './components/ServiceGroupsTable.vue?raw'
import moduleViewSource from './modules/config/MerchantConfigView.vue?raw'
import scopeBarSource from './modules/config/components/MerchantConfigScopeBar.vue?raw'
import stateSource from './modules/config/composables/useMerchantConfigState.ts?raw'
import moduleOperationsSource from './modules/config/merchantConfigOperations.ts?raw'
import serviceGroupOperationsSource from './serviceGroupOperations?raw'

const serviceGroupsSource = [
  serviceGroupsViewSource,
  tableSource,
  formDialogSource,
  scheduleDrawerSource,
  deleteDialogSource,
  moduleViewSource,
  scopeBarSource,
  stateSource,
  moduleOperationsSource,
  serviceGroupOperationsSource,
].join('\n')

describe('merchant service groups contract', () => {
  it('uses the shared merchant chrome, module owner, and service group table', () => {
    expect(serviceGroupsSource).toContain('MerchantModuleChrome')
    expect(moduleViewSource).toContain('ServiceGroupsView')
    expect(serviceGroupsSource).toContain('MerchantConfigScopeBar')
    expect(serviceGroupsSource).toContain('ServiceGroupsTable')
  })

  it('preserves backend-backed loading, filtering, save, and delete flow', () => {
    expect(serviceGroupsSource).toContain('appStore.loadServiceGroups')
    expect(serviceGroupsSource).toContain('appStore.saveServiceGroup')
    expect(serviceGroupsSource).toContain('appStore.deleteServiceGroup')
    expect(serviceGroupsSource).toContain('useMerchantConfigState')
    expect(serviceGroupsSource).toContain('filterServiceGroups')
  })

  it('keeps concrete-store scope helpers in the module scaffold', () => {
    expect(serviceGroupsSource).toContain('concreteStoreOptions')
    expect(serviceGroupsSource).toContain('applyStoreScope')
    expect(serviceGroupsSource).toContain('ensureWorkbenchStores')
    expect(serviceGroupsSource).not.toContain('<option value="all">全部门店</option>')
  })

  it('keeps the create and edit modal wired to service group fields', () => {
    expect(serviceGroupsSource).toContain('modalOpen')
    expect(serviceGroupsSource).toContain('openCreate')
    expect(serviceGroupsSource).toContain('openEdit')
    expect(serviceGroupsSource).toContain('form.durationMinutes')
    expect(serviceGroupsSource).toContain('form.capacity')
  })

  it('keeps the schedule drawer and inventory deep link flow', () => {
    expect(serviceGroupsSource).toContain('@schedule="openScheduleDrawer"')
    expect(serviceGroupsSource).toContain('backendApi.listScheduleRules')
    expect(serviceGroupsSource).toContain('backendApi.listBookingInventory')
    expect(serviceGroupsSource).toContain('saveScheduleRule')
  })
})
