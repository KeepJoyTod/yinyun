export interface YyWechatCapabilityVO {
  code: string;
  title: string;
  scenario: string;
  status: string;
  priority: string;
  endpoint: string;
  nextAction: string;
}

export interface YyWechatFieldMappingVO {
  source: string;
  localField: string;
  usage: string;
  required: boolean;
}

export interface YyWechatWorkbenchVO {
  title: string;
  strategy: string;
  h5BookingUrl: string;
  miniProgramPath: string;
  servicePhoneField: string;
  capabilities: YyWechatCapabilityVO[];
  fieldMappings: YyWechatFieldMappingVO[];
}

export interface YyWechatNoticeTestForm {
  customerPhone?: string;
  orderNo?: string;
  templateCode?: string;
  remark?: string;
}
