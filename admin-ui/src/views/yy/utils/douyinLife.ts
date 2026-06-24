import type { YyChannelOrderQuery, YyChannelSyncResultVO } from '@/api/yy/channel/types';

export type DashboardTagType = 'success' | 'warning' | 'info' | 'danger' | 'primary';

export const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const buildRecentSyncQuery = (
  days: number,
  baseQuery: YyChannelOrderQuery = {},
  channelType = 'DOUYIN_LIFE',
  now = new Date()
): YyChannelOrderQuery => {
  const rangeDays = Number.isFinite(days) && days > 0 ? days : 1;
  const start = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

  return {
    storeId: baseQuery.storeId || undefined,
    channelType,
    accountId: baseQuery.accountId || undefined,
    orderStatus: baseQuery.orderStatus || undefined,
    startTime: formatDateTime(start),
    endTime: formatDateTime(now),
    pageSize: 50,
    useTestDataHeader: channelType === 'DOUYIN_LIFE' ? baseQuery.useTestDataHeader : false
  };
};

export const buildDouyinRecentSyncQuery = (days: number, baseQuery: YyChannelOrderQuery = {}, now = new Date()): YyChannelOrderQuery => {
  return buildRecentSyncQuery(days, baseQuery, 'DOUYIN_LIFE', now);
};

export const isSyncSuccess = (result: Pick<YyChannelSyncResultVO, 'syncStatus' | 'failed'>) => {
  return result.syncStatus === 'SYNCED' && Number(result.failed || 0) === 0;
};

export const syncMessageType = (result: Pick<YyChannelSyncResultVO, 'syncStatus' | 'failed'>) => {
  if (isSyncSuccess(result)) {
    return 'success';
  }
  if (result.syncStatus === 'FAILED' || Number(result.failed || 0) > 0) {
    return 'warning';
  }
  return 'info';
};

export const buildSyncResultMessage = (result: Partial<YyChannelSyncResultVO>) => {
  const message = result.message || '同步完成';
  const total = result.total ?? 0;
  const created = result.created ?? 0;
  const updated = result.updated ?? 0;
  const failed = result.failed ?? 0;
  const logid = result.lastLogId || '-';
  return `${message}：总数 ${total}，新增 ${created}，更新 ${updated}，失败 ${failed}，logid ${logid}`;
};

export const autoSyncTagType = (syncStatus?: string, success?: boolean): DashboardTagType => {
  if (success && syncStatus === 'SYNCED') {
    return 'success';
  }
  if (syncStatus === 'WAITING' || syncStatus === 'SKIPPED') {
    return 'info';
  }
  return 'warning';
};
