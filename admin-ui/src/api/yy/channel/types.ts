export interface YyChannelOrderQuery {
  storeId?: string | number;
  channelType?: string;
  keyword?: string;
  openId?: string;
  serviceId?: string;
  serviceModeId?: string;
  accountId?: string;
  orderId?: string;
  phoneLast4?: string;
  outOrderNo?: string;
  orderStatus?: string;
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
  useTestDataHeader?: boolean;
  bookId?: string;
  confirmResult?: number;
  fulfilType?: number;
  reason?: string;
  rejectCode?: string;
  merchantNotes?: string;
  poiId?: string;
  codes?: string;
  verifyToken?: string;
  totalVerify?: boolean;
}

export interface YyChannelInventoryQuery {
  storeId?: string | number;
  channelType?: string;
  accountId?: string;
  poiId?: string;
  productId?: string;
  skuId?: string;
  skuOutId?: string;
  skuName?: string;
  skuOperateType?: number;
  receptionUnitId?: string;
  timeSlot?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  availableStock?: number;
  useTestDataHeader?: boolean;
  rawPayload?: Record<string, any>;
}

export interface YyChannelOrderVO {
  channelType: string;
  externalOrderId: string;
  externalStatus: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  localOrderId?: string | number;
  syncStatus: string;
  rawPayload: string;
}

export interface YyChannelApiResultVO {
  channelType: string;
  apiName: string;
  endpoint: string;
  success: boolean;
  message: string;
  rawResponse: string;
  requestSummary: string;
  logId?: string;
  errorCode?: string;
  missingConfig: string[];
}

export interface YyChannelAcceptanceCaseVO {
  caseKey: string;
  label: string;
  apiName: string;
  publicUrl: string;
  endpoint: string;
  logidSource: string;
  status: 'READY' | 'WAITING' | 'NO_LOGID' | 'FAILED' | string;
  statusText: string;
  requestId?: string;
  success?: string;
  errorMessage?: string;
  createTime?: string;
  hint: string;
}

export interface YyChannelSyncResultVO {
  channelType: string;
  syncStatus: string;
  total: number;
  created: number;
  updated: number;
  failed: number;
  lastLogId?: string;
  message?: string;
}

export interface YyChannelAutoSyncStatusVO {
  channelType: string;
  apiName: string;
  syncStatus: string;
  success: boolean;
  lastLogId?: string;
  message?: string;
  summary?: string;
  lastSyncTime?: string;
}

export interface YyChannelEventInboxQuery {
  id?: string | number;
  channelType?: string;
  eventType?: string;
  eventId?: string;
  externalOrderId?: string;
  requestId?: string;
  signatureValid?: string;
  processStatus?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface YyChannelEventInboxVO {
  id: string | number;
  channelType: string;
  eventType: string;
  eventId: string;
  externalOrderId?: string;
  requestId?: string;
  signatureValid?: string;
  processStatus: string;
  retryCount?: number;
  nextRetryTime?: string;
  rawPayload?: string;
  errorMessage?: string;
  processedTime?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyChannelEventInboxStatusVO {
  channelType: string;
  totalCount: number;
  receivedCount: number;
  processedCount: number;
  failedCount: number;
  deadCount: number;
  retryableCount: number;
  latestEventId?: string;
  latestEventType?: string;
  latestExternalOrderId?: string;
  latestRequestId?: string;
  latestProcessStatus?: string;
  latestErrorMessage?: string;
  latestEventTime?: string;
  latestProcessedTime?: string;
}

export interface YyChannelSyncHealthVO {
  channelType: string;
  healthStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED' | string;
  message: string;
  failedEventCount: number;
  retryableEventCount: number;
  deadEventCount: number;
  latestLogId?: string;
  latestWebhookTime?: string;
  latestAutoSyncTime?: string;
  eventInboxStatus?: YyChannelEventInboxStatusVO;
  autoSyncStatus?: YyChannelAutoSyncStatusVO;
}
