import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { EmployeePayload, NotificationTemplatePayload } from '../api/backend'
import type { BackendId } from '../api/backendId'
import type { EmployeeInfo, NotificationLogInfo, NotificationTemplateInfo, ServiceGroupInfo, StoreInfo } from './appStoreTypes'
import {
  createDemoBackendId,
  mapEmployee,
  mapNotificationLog,
  mapNotificationTemplate,
  mapServiceGroup,
  splitTags,
} from './appStoreTransforms'

const requireValue = (value: string, message: string) => {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(message)
  return trimmed
}

export type ServiceGroupInput = {
  id?: BackendId
  storeBackendId: BackendId
  code: string
  name: string
  capacity: number
  durationMinutes: number
  serviceMode: 'HORIZONTAL' | 'VERTICAL'
  status: string
  sort: number
  remark: string
}

export type EmployeeInput = {
  id?: BackendId
  storeBackendId: BackendId
  employeeNo: string
  name: string
  mobile: string
  roleType: string
  skillTags: string
  status: string
  sort: number
  remark: string
}

export type NotificationTemplateInput = {
  id?: BackendId
  templateCode: string
  scene: string
  channelType: string
  title: string
  content: string
  providerTemplateId: string
  enabled: string
  remark: string
}

export const settingsStore = reactive({
  employees: [] as EmployeeInfo[],
  serviceGroups: [] as ServiceGroupInfo[],
  notificationTemplates: [] as NotificationTemplateInfo[],
  notificationLogs: [] as NotificationLogInfo[],

  reset() {
    this.employees = []
    this.serviceGroups = []
    this.notificationTemplates = []
    this.notificationLogs = []
  },

  async refreshEmployees(stores: StoreInfo[]) {
    const employees = await backendApi.listEmployees()
    this.employees = employees.map(item => mapEmployee(item, stores))
    return this.employees
  },

  async refreshServiceGroups(stores: StoreInfo[]) {
    const groups = await backendApi.listServiceGroups()
    this.serviceGroups = groups.map(group => mapServiceGroup(group, stores))
    return this.serviceGroups
  },

  async refreshNotificationTemplates() {
    const templates = await backendApi.listNotificationTemplates()
    this.notificationTemplates = templates.map(mapNotificationTemplate)
    return this.notificationTemplates
  },

  async refreshNotificationLogs(stores: StoreInfo[]) {
    const logs = await backendApi.listNotificationLogs()
    this.notificationLogs = logs.map(item => mapNotificationLog(item, stores))
    return this.notificationLogs
  },

  saveServiceGroupDemo(input: ServiceGroupInput, stores: StoreInfo[]) {
    const store = stores.find(item => item.backendId === input.storeBackendId)
    const next: ServiceGroupInfo = {
      backendId: input.id ?? createDemoBackendId('service-group'),
      storeBackendId: input.storeBackendId,
      storeName: store?.name ?? `门店 #${input.storeBackendId}`,
      code: requireValue(input.code, '请输入服务组编码'),
      name: requireValue(input.name, '请输入服务组名称'),
      capacity: Number(input.capacity) || 0,
      durationMinutes: Number(input.durationMinutes) || 0,
      serviceMode: input.serviceMode || 'HORIZONTAL',
      status: input.status || 'ACTIVE',
      sort: Number(input.sort) || 0,
      remark: input.remark.trim(),
    }
    const idx = this.serviceGroups.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.serviceGroups = [next, ...this.serviceGroups]
    else this.serviceGroups[idx] = next
    return next
  },

  async saveServiceGroup(input: ServiceGroupInput, stores: StoreInfo[]) {
    const payload = {
      id: input.id,
      storeId: input.storeBackendId,
      groupCode: requireValue(input.code, '请输入服务组编码'),
      groupName: requireValue(input.name, '请输入服务组名称'),
      capacity: Number(input.capacity) || 0,
      durationMinutes: Number(input.durationMinutes) || 0,
      serviceMode: input.serviceMode || 'HORIZONTAL',
      status: input.status || 'ACTIVE',
      sort: Number(input.sort) || 0,
      remark: input.remark.trim(),
    }
    const dto = input.id
      ? await backendApi.updateServiceGroup(payload)
      : await backendApi.createServiceGroup(payload)
    const next = mapServiceGroup(dto, stores)
    const idx = this.serviceGroups.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.serviceGroups = [next, ...this.serviceGroups]
    else this.serviceGroups[idx] = next
    return next
  },

  deleteServiceGroupDemo(id: BackendId) {
    this.serviceGroups = this.serviceGroups.filter(item => item.backendId !== id)
  },

  async deleteServiceGroup(id: BackendId) {
    await backendApi.deleteServiceGroup(id)
    this.deleteServiceGroupDemo(id)
  },

  saveEmployeeDemo(input: EmployeeInput, stores: StoreInfo[]) {
    const store = stores.find(item => item.backendId === input.storeBackendId)
    const next: EmployeeInfo = {
      backendId: input.id ?? createDemoBackendId('employee'),
      storeBackendId: input.storeBackendId,
      storeName: store?.name ?? `门店 #${input.storeBackendId}`,
      employeeNo: requireValue(input.employeeNo, '请输入员工编号'),
      name: requireValue(input.name, '请输入员工姓名'),
      mobile: input.mobile.trim(),
      roleType: input.roleType.trim() || '未配置',
      skillTags: splitTags(input.skillTags),
      status: input.status || 'ACTIVE',
      sort: Number(input.sort) || 0,
      remark: input.remark.trim(),
    }
    const idx = this.employees.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.employees = [next, ...this.employees]
    else this.employees[idx] = next
    return next
  },

  async saveEmployee(input: EmployeeInput, stores: StoreInfo[]) {
    const payload: EmployeePayload = {
      id: input.id,
      storeId: input.storeBackendId,
      employeeNo: requireValue(input.employeeNo, '请输入员工编号'),
      employeeName: requireValue(input.name, '请输入员工姓名'),
      mobile: input.mobile.trim(),
      roleType: input.roleType.trim(),
      skillTags: input.skillTags.trim(),
      status: input.status || 'ACTIVE',
      sort: Number(input.sort) || 0,
      remark: input.remark.trim(),
    }
    const dto = input.id
      ? await backendApi.updateEmployee(payload)
      : await backendApi.createEmployee(payload)
    const next = mapEmployee(dto, stores)
    const idx = this.employees.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.employees = [next, ...this.employees]
    else this.employees[idx] = next
    return next
  },

  saveNotificationTemplateDemo(input: NotificationTemplateInput) {
    const next: NotificationTemplateInfo = {
      backendId: input.id ?? createDemoBackendId('notification-template'),
      templateCode: requireValue(input.templateCode, '请输入模板编码'),
      scene: requireValue(input.scene, '请输入业务场景'),
      channelType: requireValue(input.channelType, '请输入通知渠道'),
      title: input.title.trim(),
      content: requireValue(input.content, '请输入模板内容'),
      providerTemplateId: input.providerTemplateId.trim(),
      enabled: input.enabled || '1',
      remark: input.remark.trim(),
    }
    const idx = this.notificationTemplates.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.notificationTemplates = [next, ...this.notificationTemplates]
    else this.notificationTemplates[idx] = next
    return next
  },

  async saveNotificationTemplate(input: NotificationTemplateInput) {
    const payload: NotificationTemplatePayload = {
      id: input.id,
      templateCode: requireValue(input.templateCode, '请输入模板编码'),
      scene: requireValue(input.scene, '请输入业务场景'),
      channelType: requireValue(input.channelType, '请输入通知渠道'),
      title: input.title.trim(),
      content: requireValue(input.content, '请输入模板内容'),
      providerTemplateId: input.providerTemplateId.trim(),
      enabled: input.enabled || '1',
      remark: input.remark.trim(),
    }
    const dto = input.id
      ? await backendApi.updateNotificationTemplate(payload)
      : await backendApi.createNotificationTemplate(payload)
    const next = mapNotificationTemplate(dto)
    const idx = this.notificationTemplates.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.notificationTemplates = [next, ...this.notificationTemplates]
    else this.notificationTemplates[idx] = next
    return next
  },

  loadDemoEmployees(stores: StoreInfo[]) {
    this.employees = [
      {
        backendId: '3101',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        employeeNo: 'SZ-EMP-001',
        name: '阿杰',
        mobile: '13800001111',
        roleType: '摄影师',
        skillTags: ['证件照', '快修交付'],
        status: 'ACTIVE',
        sort: 10,
        remark: '主负责证件照与加急交付',
      },
      {
        backendId: '3102',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        employeeNo: 'SZ-EMP-002',
        name: '小满',
        mobile: '13800002222',
        roleType: '修图师',
        skillTags: ['精修', '排版'],
        status: 'ACTIVE',
        sort: 20,
        remark: '主负责形象照精修与排版',
      },
      {
        backendId: '3103',
        storeBackendId: '2',
        storeName: stores[1]?.name ?? '影约云香港交付点',
        employeeNo: 'HK-EMP-001',
        name: 'Iris',
        mobile: '13800009999',
        roleType: '前台',
        skillTags: ['交付', '回访'],
        status: 'DISABLED',
        sort: 30,
        remark: '交付点轮值，当前休假',
      },
    ]
  },

  loadDemoServiceGroups(stores: StoreInfo[]) {
    this.serviceGroups = [
      {
        backendId: '1101',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        code: 'SZ-ID',
        name: '证件照快拍组',
        capacity: 6,
        durationMinutes: 30,
        serviceMode: 'HORIZONTAL',
        status: 'ACTIVE',
        sort: 10,
        remark: '覆盖证件照与快修交付',
      },
      {
        backendId: '1102',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        code: 'SZ-PR',
        name: '形象照主棚',
        capacity: 3,
        durationMinutes: 90,
        serviceMode: 'VERTICAL',
        status: 'ACTIVE',
        sort: 20,
        remark: '适合职业形象照与简历头像',
      },
      {
        backendId: '1103',
        storeBackendId: '2',
        storeName: stores[1]?.name ?? '影约云香港交付点',
        code: 'HK-DL',
        name: '交付与取片组',
        capacity: 2,
        durationMinutes: 20,
        serviceMode: 'HORIZONTAL',
        status: 'ACTIVE',
        sort: 30,
        remark: '以预约交付和补片为主',
      },
    ]
  },

  loadDemoNotificationTemplates() {
    this.notificationTemplates = [
      {
        backendId: '5101',
        templateCode: 'PICKUP_SMS_READY',
        scene: '客户取片提醒',
        channelType: 'SMS',
        title: '取片通知',
        content: '您好，您的照片已修完，可凭手机号与取片码查看相册。',
        providerTemplateId: 'SMS_001',
        enabled: '1',
        remark: '用于取片和交付提醒',
      },
      {
        backendId: '5102',
        templateCode: 'BOOKING_WECHAT_CONFIRM',
        scene: '预约确认提醒',
        channelType: 'WECHAT',
        title: '预约确认',
        content: '您的预约已确认，请按时到店，如需改期请联系门店。',
        providerTemplateId: 'WX_008',
        enabled: '1',
        remark: '用于预约确认和临近到店提醒',
      },
      {
        backendId: '5103',
        templateCode: 'MANUAL_REVISIT_SMS',
        scene: '回访关怀',
        channelType: 'SMS',
        title: '客户回访',
        content: '感谢您的到店体验，欢迎随时反馈修图或加片需求。',
        providerTemplateId: '',
        enabled: '0',
        remark: '备用人工回访模板',
      },
    ]
  },

  loadDemoNotificationLogs(today: string, stores: StoreInfo[]) {
    this.notificationLogs = [
      {
        backendId: '6101',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        templateBackendId: '5101',
        channelType: 'SMS',
        receiver: '13800003333',
        sendStatus: 'SUCCESS',
        requestId: 'sms-log-001',
        errorMessage: '',
        sentTime: `${today} 13:50:00`,
        rawPayload: '{"scene":"pickup"}',
        remark: '客户已点击取片链接',
      },
      {
        backendId: '6102',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        templateBackendId: '5102',
        channelType: 'WECHAT',
        receiver: '13900004444',
        sendStatus: 'SUCCESS',
        requestId: 'wx-log-002',
        errorMessage: '',
        sentTime: `${today} 11:00:00`,
        rawPayload: '{"scene":"booking_confirm"}',
        remark: '已送达微信订阅消息',
      },
      {
        backendId: '6103',
        storeName: stores[1]?.name ?? '影约云香港交付点',
        templateBackendId: '5101',
        channelType: 'SMS',
        receiver: '13700005555',
        sendStatus: 'FAILED',
        requestId: 'sms-log-003',
        errorMessage: '手机号格式异常',
        sentTime: `${today} 11:20:00`,
        rawPayload: '{"scene":"pickup"}',
        remark: '待门店修正手机号后重发',
      },
    ]
  },
})
