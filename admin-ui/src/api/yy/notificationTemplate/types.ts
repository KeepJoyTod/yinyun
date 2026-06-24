export interface YyNotificationTemplateVO extends BaseEntity {
  id: string | number;
  tenantId?: string;
  templateCode: string;
  scene: string;
  channelType: string;
  title: string;
  content: string;
  providerTemplateId: string;
  enabled: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

export interface YyNotificationTemplateForm {
  id?: string | number | undefined;
  templateCode: string;
  scene: string;
  channelType: string;
  title: string;
  content: string;
  providerTemplateId: string;
  enabled: string;
  remark: string;
}

export interface YyNotificationTemplateQuery extends PageQuery {
  templateCode?: string;
  scene?: string;
  channelType?: string;
  title?: string;
  enabled?: string;
}
