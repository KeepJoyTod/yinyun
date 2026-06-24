export interface YyChannelSyncLogVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  channelType: string;
  apiName: string;
  requestId: string;
  success: string;
  errorMessage: string;
  durationMs: number;
  retryable: string;
  remark: string;
  tenantId?: string;
}

export interface YyChannelSyncLogForm {
  id?: string | number | undefined;
  storeId: string | number;
  channelType: string;
  apiName: string;
  requestId: string;
  success: string;
  errorMessage: string;
  durationMs: number;
  retryable: string;
  remark: string;
}

export interface YyChannelSyncLogQuery extends PageQuery {
  storeId?: string | number;
  channelType?: string;
  apiName?: string;
  requestId?: string;
  success?: string;
  retryable?: string;
}
