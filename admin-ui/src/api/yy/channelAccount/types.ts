export interface YyChannelAccountVO extends BaseEntity {
  id: string | number;
  storeId: string | number;
  channelType: string;
  accountName: string;
  appKey: string;
  appSecretEnc: string;
  serviceId: string;
  serviceModeId: string;
  serviceMarketAppId: string;
  serviceMarketPath: string;
  testOpenId: string;
  webhookUrl: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  expiresAt: string;
  status: string;
  remark: string;
  tenantId?: string;
}

export interface YyChannelAccountForm {
  id?: string | number | undefined;
  storeId: string | number;
  channelType: string;
  accountName: string;
  appKey: string;
  appSecretEnc: string;
  serviceId: string;
  serviceModeId: string;
  serviceMarketAppId: string;
  serviceMarketPath: string;
  testOpenId: string;
  webhookUrl: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  expiresAt: string;
  status: string;
  remark: string;
}

export interface YyChannelAccountQuery extends PageQuery {
  storeId?: string | number;
  channelType?: string;
  accountName?: string;
  status?: string;
}
