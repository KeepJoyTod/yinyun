export interface YyChannelPluginVO extends BaseEntity {
  id: string | number;
  channelType: string;
  pluginName: string;
  enabled: string;
  authStatus: string;
  openTip: string;
  lastSyncTime: string;
  remark: string;
  tenantId?: string;
}

export interface YyChannelPluginForm {
  id?: string | number | undefined;
  channelType: string;
  pluginName: string;
  enabled: string;
  authStatus: string;
  openTip: string;
  lastSyncTime: string;
  remark: string;
}

export interface YyChannelPluginQuery extends PageQuery {
  channelType?: string;
  pluginName?: string;
  enabled?: string;
  authStatus?: string;
}
