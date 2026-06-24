import { getOptionLabel, photoAccessActionOptions } from '@/views/yy/components/options';
import { getPickupDeliveryHealth, resolveAlbumPickupCode } from '@/views/yy/utils/photoPickupEntry';

export type AlbumOperationsLike = {
  id?: string | number;
  albumName?: string;
  customerPhone?: string;
  accessCode?: string;
  publicToken?: string;
  expireTime?: string;
};

export type AlbumRecentFailureLike = {
  action?: string;
  remark?: string;
  createTime?: string;
};

export type AlbumOperationsStats = {
  totalAssets: number;
  visibleAssets: number;
  selectedAssets: number;
  missingObjectKeyAssets: number;
  recentFailure?: AlbumRecentFailureLike;
};

export type AlbumOperationsSummary = {
  type: 'success' | 'warning' | 'danger';
  label: string;
  issues: string[];
  phoneText: string;
  pickupText: string;
  assetText: string;
  failureText: string;
  nextAction: string;
};

const hasValue = (value?: string | number) => String(value ?? '').trim().length > 0;

const normalizeCount = (value?: number) => {
  const count = Number(value ?? 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

export const buildAlbumOperationsSummary = (album: AlbumOperationsLike, stats: AlbumOperationsStats): AlbumOperationsSummary => {
  const pickupHealth = getPickupDeliveryHealth(album);
  const phoneReady = hasValue(album.customerPhone);
  const pickupReady = hasValue(resolveAlbumPickupCode(album));
  const totalAssets = normalizeCount(stats.totalAssets);
  const visibleAssets = normalizeCount(stats.visibleAssets);
  const selectedAssets = normalizeCount(stats.selectedAssets);
  const missingObjectKeyAssets = normalizeCount(stats.missingObjectKeyAssets);
  const recentFailure = stats.recentFailure;
  const issues: string[] = [];

  if (!phoneReady) {
    issues.push('缺手机号');
  }
  if (!pickupReady) {
    issues.push('缺取片码');
  } else if (pickupHealth.label === '已过期') {
    issues.push('已过期');
  }
  if (!visibleAssets) {
    issues.push('无可见照片');
  }
  if (missingObjectKeyAssets) {
    issues.push(`${missingObjectKeyAssets} 张缺 OSS Key`);
  }
  if (recentFailure) {
    issues.push('最近访问失败');
  }

  const type: AlbumOperationsSummary['type'] = issues.some((item) => item.includes('缺') || item.includes('失败') || item === '无可见照片' || item === '已过期')
    ? 'danger'
    : issues.length
      ? 'warning'
      : 'success';
  const label = type === 'success' ? '可交付' : type === 'warning' ? '需确认' : '需处理';
  const failureAction = recentFailure?.action ? getOptionLabel(photoAccessActionOptions, recentFailure.action) : '';
  const failureRemark = String(recentFailure?.remark || '').trim();
  const failureText = recentFailure ? `最近失败：${failureAction || '访问'}${failureRemark ? `，${failureRemark}` : ''}` : '最近无失败记录';

  let nextAction = '可复制取片入口发给客户';
  if (!phoneReady || !pickupReady || !visibleAssets) {
    nextAction = '先补手机号、取片码并上传可见照片';
  } else if (missingObjectKeyAssets || recentFailure) {
    nextAction = '检查底片 OSS Key 和最近失败访问日志';
  } else if (issues.includes('已过期')) {
    nextAction = '延长相册有效期后再发送给客户';
  }

  return {
    type,
    label,
    issues,
    phoneText: phoneReady ? `手机 ${album.customerPhone}` : '缺手机号',
    pickupText: pickupReady ? '取片码已配置' : '缺取片码',
    assetText: `照片 ${visibleAssets}/${totalAssets}，已选 ${selectedAssets}，缺Key ${missingObjectKeyAssets}`,
    failureText,
    nextAction
  };
};
