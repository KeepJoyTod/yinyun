import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { OperationLogInfo } from './appStoreTypes'
import { mapOperationLog } from './appStoreTransforms'

export const operationLogStore = reactive({
  operationLogs: [] as OperationLogInfo[],

  reset() {
    this.operationLogs = []
  },

  loadDemo(today: string) {
    this.operationLogs = [
      {
        backendId: '7101',
        title: '预约订单',
        action: 'POST /yy/order/9001/transition',
        operator: '门店主管',
        operatorType: 1,
        deptName: '影约云深圳旗舰店',
        requestMethod: 'POST',
        url: '/yy/order/9001/transition',
        ip: '127.0.0.1',
        status: 'SUCCESS',
        errorMessage: '',
        requestPayload: '{"expectedStatus":"PENDING","targetStatus":"CONFIRMED","remark":"演示确认订单"}',
        responsePayload: '',
        happenedAt: `${today} 13:58:12`,
        durationMs: 146,
      },
      {
        backendId: '7102',
        title: '客片管理',
        action: 'POST /resource/oss/upload',
        operator: '修图师',
        operatorType: 1,
        deptName: '影约云深圳旗舰店',
        requestMethod: 'POST',
        url: '/resource/oss/upload',
        ip: '127.0.0.1',
        status: 'SUCCESS',
        errorMessage: '',
        requestPayload: '',
        responsePayload: '',
        happenedAt: `${today} 13:47:30`,
        durationMs: 380,
      },
      {
        backendId: '7103',
        title: '操作日志',
        action: 'GET /monitor/operlog/list',
        operator: 'yy-demo',
        operatorType: 1,
        deptName: '影约云深圳旗舰店',
        requestMethod: 'GET',
        url: '/monitor/operlog/list',
        ip: '127.0.0.1',
        status: 'FAILED',
        errorMessage: '缺少 monitor:operlog:list 权限',
        requestPayload: '',
        responsePayload: '',
        happenedAt: `${today} 11:08:00`,
        durationMs: 24,
      },
    ]
  },

  async refresh() {
    const logs = await backendApi.listOperationLogs()
    this.operationLogs = logs.map(mapOperationLog)
    return this.operationLogs
  },
})
