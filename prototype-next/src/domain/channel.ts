export type ChannelType = "DOUYIN" | "MEITUAN";
export type ChannelAccountStatus = "NOT_AUTHORIZED" | "AUTHORIZED" | "EXPIRED" | "DISABLED";
export type ChannelOrderSyncStatus = "UNLINKED" | "LINKED" | "FAILED" | "IGNORED";
export type ChannelSyncStatus = "PENDING" | "SUCCESS" | "FAILED" | "SKIPPED";

export const channelOptions: Array<{ value: ChannelType; label: string }> = [
  { value: "DOUYIN", label: "抖音" },
  { value: "MEITUAN", label: "美团" }
];

export const douyinApiMethods = {
  searchList: "order.searchList",
  orderDetail: "order.orderDetail"
} as const;

export const channelApiCapabilities: Record<ChannelType, { searchList: string; orderDetail: string; note: string }> = {
  DOUYIN: {
    searchList: douyinApiMethods.searchList,
    orderDetail: douyinApiMethods.orderDetail,
    note: "先做只读同步，授权后分页拉取订单列表，再用详情接口补全字段。"
  },
  MEITUAN: {
    searchList: "待接入",
    orderDetail: "待接入",
    note: "先共用渠道插件模型和未开通状态，拿到美团核销接口文档后补 adapter。"
  }
};

export function channelTypeLabel(type: ChannelType) {
  return channelOptions.find((item) => item.value === type)?.label ?? type;
}

export function channelAccountStatusMeta(status: ChannelAccountStatus) {
  const metas: Record<ChannelAccountStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral"; message: string }> = {
    NOT_AUTHORIZED: {
      label: "未开通",
      tone: "warning",
      message: "尚未完成店铺授权，真实渠道订单不会同步。"
    },
    AUTHORIZED: {
      label: "已授权",
      tone: "success",
      message: "已保存授权账号，可执行订单列表和详情查询。"
    },
    EXPIRED: {
      label: "授权过期",
      tone: "danger",
      message: "授权已过期，需要重新授权或刷新 token。"
    },
    DISABLED: {
      label: "已停用",
      tone: "neutral",
      message: "渠道账号已停用，不会执行同步任务。"
    }
  };

  return metas[status];
}

export function channelOrderSyncStatusMeta(status: ChannelOrderSyncStatus) {
  const metas: Record<ChannelOrderSyncStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
    UNLINKED: { label: "未转本地单", tone: "warning" },
    LINKED: { label: "已关联本地单", tone: "success" },
    FAILED: { label: "同步失败", tone: "danger" },
    IGNORED: { label: "已忽略", tone: "neutral" }
  };

  return metas[status];
}

export function channelSyncStatusMeta(status: ChannelSyncStatus) {
  const metas: Record<ChannelSyncStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
    PENDING: { label: "待执行", tone: "warning" },
    SUCCESS: { label: "成功", tone: "success" },
    FAILED: { label: "失败", tone: "danger" },
    SKIPPED: { label: "跳过", tone: "neutral" }
  };

  return metas[status];
}

export function isChannelAuthorized(status: ChannelAccountStatus) {
  return status === "AUTHORIZED";
}
