export interface YyMobileChannelConfigVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  channelType: string;
  channelName: string;
  appId: string;
  appSecretEnc: string;
  callbackUrl: string;
  enabled: string;
  sdkStatus: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyMobileChannelConfigForm {
  id?: string | number | undefined;
  channelType: string;
  channelName: string;
  appId: string;
  appSecretEnc: string;
  callbackUrl: string;
  enabled: string;
  sdkStatus: string;
  remark: string;
}

export interface YyMobileChannelConfigQuery extends PageQuery {
  channelType?: string;
  channelName?: string;
  enabled?: string;
  sdkStatus?: string;
}
