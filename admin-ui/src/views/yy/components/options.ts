export interface YyOption {
  label: string;
  value: string;
  type?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}

export const storeStatusOptions: YyOption[] = [
  { label: '营业中', value: '0', type: 'success' },
  { label: '停业', value: '1', type: 'info' }
];

export const commonStatusOptions: YyOption[] = [
  { label: '启用', value: '0', type: 'success' },
  { label: '停用', value: '1', type: 'info' }
];

export const bookingEnabledOptions: YyOption[] = [
  { label: '启用', value: '1', type: 'success' },
  { label: '停用', value: '0', type: 'info' }
];

export const weekdayOptions: YyOption[] = [
  { label: '周一', value: '1', type: 'primary' },
  { label: '周二', value: '2', type: 'primary' },
  { label: '周三', value: '3', type: 'primary' },
  { label: '周四', value: '4', type: 'primary' },
  { label: '周五', value: '5', type: 'primary' },
  { label: '周六', value: '6', type: 'warning' },
  { label: '周日', value: '7', type: 'danger' }
];

export const employeeRoleOptions: YyOption[] = [
  { label: '门店管理', value: 'MANAGER', type: 'primary' },
  { label: '摄影师', value: 'PHOTOGRAPHER', type: 'success' },
  { label: '修图师', value: 'RETOUCHER', type: 'warning' },
  { label: '客服', value: 'CUSTOMER_SERVICE', type: 'info' },
  { label: '通用员工', value: 'STAFF', type: 'info' }
];

export const yesNoOptions: YyOption[] = [
  { label: '是', value: '1', type: 'success' },
  { label: '否', value: '0', type: 'info' }
];

export const photoAccessSuccessOptions: YyOption[] = [
  { label: '成功', value: '1', type: 'success' },
  { label: '失败', value: '0', type: 'danger' }
];

export const orderSourceOptions: YyOption[] = [
  { label: '本地', value: 'LOCAL', type: 'primary' },
  { label: '抖音', value: 'DOUYIN', type: 'danger' },
  { label: '抖音来客', value: 'DOUYIN_LIFE', type: 'warning' },
  { label: '抖音小程序', value: 'DOUYIN_MINI_APP', type: 'danger' },
  { label: '美团', value: 'MEITUAN', type: 'warning' },
  { label: '微信', value: 'WECHAT', type: 'success' },
  { label: '手工导入', value: 'IMPORT', type: 'info' }
];

export const customerSourceOptions: YyOption[] = [
  { label: '本地录入', value: 'LOCAL', type: 'primary' },
  { label: '抖音', value: 'DOUYIN', type: 'danger' },
  { label: '抖音来客', value: 'DOUYIN_LIFE', type: 'warning' },
  { label: '抖音小程序', value: 'DOUYIN_MINI_APP', type: 'danger' },
  { label: '美团', value: 'MEITUAN', type: 'warning' },
  { label: '微信', value: 'WECHAT', type: 'success' },
  { label: '手工导入', value: 'IMPORT', type: 'info' }
];

export const memberLevelOptions: YyOption[] = [
  { label: '普通客户', value: 'NORMAL', type: 'info' },
  { label: '会员客户', value: 'VIP', type: 'primary' },
  { label: '银卡客户', value: 'SILVER', type: 'success' },
  { label: '金卡客户', value: 'GOLD', type: 'warning' },
  { label: '重点客户', value: 'DIAMOND', type: 'danger' }
];

export const genderOptions: YyOption[] = [
  { label: '未知', value: '0', type: 'info' },
  { label: '男', value: '1', type: 'primary' },
  { label: '女', value: '2', type: 'danger' }
];

export const bookingMethodOptions: YyOption[] = [
  { label: '人工预约', value: 'MANUAL', type: 'primary' },
  { label: 'H5预约', value: 'H5', type: 'success' },
  { label: '小程序', value: 'MINI_APP', type: 'success' },
  { label: 'App', value: 'APP', type: 'warning' },
  { label: '渠道同步', value: 'CHANNEL', type: 'info' }
];

export const orderStatusOptions: YyOption[] = [
  { label: '待确认', value: 'PENDING', type: 'warning' },
  { label: '已确认', value: 'CONFIRMED', type: 'primary' },
  { label: '已到店', value: 'ARRIVED', type: 'success' },
  { label: '服务中', value: 'SERVING', type: 'success' },
  { label: '已完成', value: 'COMPLETED', type: 'info' },
  { label: '库存冲突', value: 'STOCK_CONFLICT', type: 'danger' },
  { label: '已取消', value: 'CANCELLED', type: 'danger' }
];

export const inventoryStatusOptions: YyOption[] = [
  { label: '未参与库存', value: 'SKIPPED', type: 'info' },
  { label: '已确认库存', value: 'CONFIRMED', type: 'success' },
  { label: '库存冲突', value: 'CONFLICT', type: 'danger' },
  { label: '已释放', value: 'RELEASED', type: 'warning' }
];

export const productTypeOptions: YyOption[] = [
  { label: '拍摄套餐', value: 'SERVICE', type: 'primary' },
  { label: '团单产品', value: 'GROUP_BUY', type: 'warning' },
  { label: '附加产品', value: 'ADDON', type: 'success' },
  { label: '冲印产品', value: 'PRINT', type: 'info' },
  { label: '抖音产品', value: 'DOUYIN', type: 'danger' },
  { label: '美团产品', value: 'MEITUAN', type: 'warning' }
];

export const selectionStatusOptions: YyOption[] = [
  { label: '草稿', value: 'DRAFT', type: 'info' },
  { label: '待选片', value: 'WAITING', type: 'warning' },
  { label: '选片中', value: 'SELECTING', type: 'primary' },
  { label: '已提交', value: 'SUBMITTED', type: 'success' },
  { label: '已完成', value: 'COMPLETED', type: 'success' },
  { label: '已过期', value: 'EXPIRED', type: 'danger' }
];

export const channelTypeOptions: YyOption[] = [
  { label: '抖音', value: 'DOUYIN', type: 'danger' },
  { label: '抖音来客', value: 'DOUYIN_LIFE', type: 'warning' },
  { label: '抖音小程序', value: 'DOUYIN_MINI_APP', type: 'danger' },
  { label: '美团', value: 'MEITUAN', type: 'warning' },
  { label: '微信生态', value: 'WECHAT', type: 'success' }
];

export const authStatusOptions: YyOption[] = [
  { label: '未开通', value: 'UNOPENED', type: 'info' },
  { label: '未授权', value: 'UNAUTHORIZED', type: 'warning' },
  { label: '已授权', value: 'AUTHORIZED', type: 'success' },
  { label: '授权过期', value: 'EXPIRED', type: 'danger' }
];

export const syncStatusOptions: YyOption[] = [
  { label: '待同步', value: 'PENDING', type: 'warning' },
  { label: '已同步', value: 'SYNCED', type: 'success' },
  { label: '同步失败', value: 'FAILED', type: 'danger' },
  { label: '已忽略', value: 'IGNORED', type: 'info' }
];

export const notificationChannelOptions: YyOption[] = [
  { label: '微信', value: 'WECHAT', type: 'success' },
  { label: '短信', value: 'SMS', type: 'warning' },
  { label: '企业微信', value: 'WECOM', type: 'primary' },
  { label: '抖音', value: 'DOUYIN', type: 'danger' },
  { label: '抖音来客', value: 'DOUYIN_LIFE', type: 'warning' }
];

export const notificationSendStatusOptions: YyOption[] = [
  { label: '待发送', value: 'PENDING', type: 'warning' },
  { label: '发送中', value: 'SENDING', type: 'primary' },
  { label: '已发送', value: 'SENT', type: 'success' },
  { label: '发送失败', value: 'FAILED', type: 'danger' },
  { label: '已取消', value: 'CANCELLED', type: 'info' }
];

export const mobileChannelTypeOptions: YyOption[] = [
  { label: 'H5 预约端', value: 'H5', type: 'success' },
  { label: '微信小程序', value: 'WECHAT_MINI_APP', type: 'primary' },
  { label: '抖音小程序', value: 'DOUYIN_MINI_APP', type: 'danger' },
  { label: 'App', value: 'APP', type: 'warning' }
];

export const mobileSdkStatusOptions: YyOption[] = [
  { label: '已接入', value: 'READY', type: 'success' },
  { label: '待配置', value: 'PENDING', type: 'warning' },
  { label: '规划中', value: 'PLANNED', type: 'info' },
  { label: '接入失败', value: 'FAILED', type: 'danger' }
];

export const photoAccessPlatformOptions: YyOption[] = [
  { label: 'H5', value: 'H5', type: 'success' },
  { label: '微信小程序', value: 'WECHAT_MINI_APP', type: 'primary' },
  { label: '抖音小程序', value: 'DOUYIN_MINI_APP', type: 'danger' },
  { label: '抖音来客', value: 'DOUYIN_LIFE', type: 'warning' },
  { label: '手工', value: 'MANUAL', type: 'info' }
];

export const photoAccessActionOptions: YyOption[] = [
  { label: '发送验证码', value: 'SEND_CODE', type: 'info' },
  { label: '登录校验', value: 'VERIFY', type: 'primary' },
  { label: '相册详情', value: 'ALBUM_DETAIL', type: 'success' },
  { label: '提交选片', value: 'SELECTION_SUBMIT', type: 'success' },
  { label: '预览', value: 'PREVIEW', type: 'success' },
  { label: '下载', value: 'DOWNLOAD', type: 'warning' },
  { label: '代理流', value: 'STREAM', type: 'warning' }
];

export const reportTypeOptions: YyOption[] = [
  { label: '日报', value: 'DAILY', type: 'primary' },
  { label: '月报', value: 'MONTHLY', type: 'success' },
  { label: '渠道报表', value: 'CHANNEL', type: 'warning' },
  { label: '选片报表', value: 'SELECTION', type: 'danger' }
];

export const getOptionLabel = (options: YyOption[], value?: string | number) => {
  const item = options.find((option) => option.value === String(value ?? ''));
  return item?.label ?? (value ? String(value) : '-');
};

export const getOptionType = (options: YyOption[], value?: string | number) => {
  const item = options.find((option) => option.value === String(value ?? ''));
  return item?.type ?? 'info';
};
