import { describe, expect, it } from 'vitest'
import employeesSource from './EmployeesView.vue?raw'
import operationsSource from './employeesOperations.ts?raw'

const employeesContractSource = `${employeesSource}\n${operationsSource}`

describe('employees page contract', () => {
  it('shows an employee operations board before the roster list', () => {
    expect(employeesSource).toContain('employee-ops-board')
    expect(employeesSource).toContain('员工管理')
    expect(employeesContractSource).toContain('在岗员工')
    expect(employeesContractSource).toContain('今日可排班')
    expect(employeesContractSource).toContain('技能覆盖')
  })

  it('offers staff-friendly filters and an add employee action', () => {
    expect(employeesSource).toContain('quickEmployeeFilters')
    expect(employeesSource).toContain('新增员工')
    expect(employeesContractSource).toContain('全部员工')
    expect(employeesContractSource).toContain('摄影 / 修图')
    expect(employeesContractSource).toContain('停用')
  })

  it('aligns employee filters and columns with the yuyue123 reference without fake create dates', () => {
    expect(employeesSource).toContain('选择门店')
    expect(employeesSource).toContain('选择状态')
    expect(employeesSource).toContain('请输入手机、工号、姓名、职位')
    expect(employeesSource).toContain('姓名')
    expect(employeesSource).toContain('手机')
    expect(employeesSource).toContain('角色')
    expect(employeesSource).toContain('添加日期')
    expect(employeesContractSource).toContain('formatEmployeeCreatedAt')
    expect(employeesContractSource).toContain('未接入')
  })

  it('uses the app store employee api with loading, empty and modal states', () => {
    expect(employeesSource).toContain('appStore.loadEmployees')
    expect(employeesSource).toContain('appStore.saveEmployee')
    expect(employeesSource).toContain('loading')
    expect(employeesSource).toContain('当前筛选下没有员工')
    expect(employeesSource).toContain('保存员工')
  })

  it('keeps employee all-store filtering admin-only and scopes staff metrics to concrete stores', () => {
    expect(employeesSource).toContain('studioAccessStore')
    expect(employeesSource).toContain('canUseGlobalStoreScope')
    expect(employeesSource).toContain('concreteStoreOptions')
    expect(employeesContractSource).toContain('normalizeStoreFilter')
    expect(employeesSource).toContain('scopedEmployees')
    expect(employeesSource).toContain('<option v-if="canUseGlobalStoreScope" value="all">全部门店</option>')
    expect(employeesSource).toContain("if (!canUseGlobalStoreScope.value && storeFilter.value === 'all')")
    expect(employeesSource).toContain("storeFilter.value = normalizeStoreFilter()")
  })

  it('uses the shared notice banner for save feedback', () => {
    expect(employeesSource).toContain('NoticeBanner')
  })

  it('lets staff copy an employee handoff card from each row', () => {
    expect(employeesSource).toContain('复制资料')
    expect(employeesSource).toContain('copyEmployeeSummary')
    expect(employeesContractSource).toContain('formatEmployeeSummary')
    expect(employeesSource).toContain('copyingEmployeeKey')
    expect(employeesSource).toContain('copiedEmployeeKey')
  })
})
