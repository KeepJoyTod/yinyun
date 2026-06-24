export interface YyChannelOrderMappingVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  orderId: string | number;
  channelType: string;
  externalOrderId: string;
  externalStatus: string;
  syncStatus: string;
  rawPayload: string;
  remark: string;
  tenantId?: string;
}

export interface YyChannelOrderMappingForm {
  id?: string | number | undefined;
  storeId: string | number;
  orderId: string | number;
  channelType: string;
  externalOrderId: string;
  externalStatus: string;
  syncStatus: string;
  rawPayload: string;
  remark: string;
}

export interface YyChannelOrderMappingQuery extends PageQuery {
  storeId?: string | number;
  orderId?: string | number;
  channelType?: string;
  externalOrderId?: string;
  externalStatus?: string;
  syncStatus?: string;
}
