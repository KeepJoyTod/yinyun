export interface YyNotificationLogVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  storeId?: string | number;
  orderId?: string | number;
  customerId?: string | number;
  templateId?: string | number;
  channelType: string;
  receiver: string;
  sendStatus: string;
  requestId: string;
  errorMessage: string;
  sentTime?: string;
  rawPayload?: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyNotificationLogQuery extends PageQuery {
  storeId?: string | number;
  orderId?: string | number;
  customerId?: string | number;
  templateId?: string | number;
  channelType?: string;
  receiver?: string;
  sendStatus?: string;
  requestId?: string;
}
