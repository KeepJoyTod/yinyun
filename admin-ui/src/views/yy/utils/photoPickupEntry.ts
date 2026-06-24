import QRCode from 'qrcode';

type PickupAlbumLike = {
  id?: string | number;
  albumName?: string;
  customerName?: string;
  customerPhone?: string;
  publicToken?: string;
  accessCode?: string;
  expireTime?: string;
};

type PickupSmokeCommandInput = {
  baseUrl?: string;
  phone?: string;
  accessCode?: string;
  albumId?: string | number;
  allowEmptyAlbum?: boolean;
};

export const resolveAlbumPickupCode = (album?: PickupAlbumLike) => {
  return String(album?.accessCode || album?.publicToken || '').trim();
};

export const buildPickupH5EntryUrl = (baseUrl?: string) => {
  const normalized = String(baseUrl || '').trim().replace(/\/$/, '');
  if (!normalized) {
    return '';
  }
  return normalized.includes('#') ? normalized : `${normalized}/#/pages/pickup/login/index`;
};

const isSafeCustomerEntryUrl = (url?: string) => {
  const value = String(url || '').trim();
  if (!value) {
    return false;
  }
  if (value.startsWith('/')) {
    return false;
  }
  const lowerValue = value.toLowerCase();
  return /^https:\/\//i.test(value) && !lowerValue.includes('/dev-api') && !lowerValue.includes('oss-') && !lowerValue.includes('.aliyuncs.com');
};

export const buildPickupPlatformEntryTips = (entryUrl?: string) => {
  const qrState = buildPickupQrState(entryUrl);
  return [
    {
      label: 'H5 网页',
      value: qrState.available ? qrState.value : '未配置正式 H5 入口，可先使用微信/抖音小程序取片',
      available: qrState.available,
      copyable: qrState.available
    },
    {
      label: '微信小程序',
      value: '打开影约云客户取片页，输入手机号和取片码',
      available: true,
      copyable: false
    },
    {
      label: '抖音小程序',
      value: '打开影约云客户取片页，输入手机号和取片码',
      available: true,
      copyable: false
    }
  ];
};

export const buildPickupQrState = (entryUrl?: string) => {
  const value = String(entryUrl || '').trim();
  const available = isSafeCustomerEntryUrl(value);
  if (!available) {
    return {
      available: false,
      value: '',
      title: '暂未配置 H5 二维码',
      description: '可先复制取片码，引导客户从微信/抖音小程序进入客户取片页。'
    };
  }
  return {
    available: true,
    value,
    title: '扫码进入 H5 取片',
    description: '客户扫码后输入手机号和取片码查看相册。'
  };
};

export const buildPickupQrImageDataUrl = async (entryUrl?: string) => {
  const qrState = buildPickupQrState(entryUrl);
  if (!qrState.available) {
    return '';
  }
  return QRCode.toDataURL(qrState.value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 6,
    color: {
      dark: '#111416',
      light: '#ffffff'
    }
  });
};

export const isPickupAlbumExpired = (expireTime?: string) => {
  if (!expireTime) {
    return false;
  }
  const timestamp = new Date(expireTime.replace(/-/g, '/')).getTime();
  return Number.isFinite(timestamp) && timestamp < Date.now();
};

export const getPickupDeliveryHealth = (album?: PickupAlbumLike) => {
  if (!resolveAlbumPickupCode(album)) {
    return {
      type: 'danger',
      label: '缺取片码',
      description: '客户无法登录取片，请先补充客户取片码。'
    };
  }
  if (isPickupAlbumExpired(album?.expireTime)) {
    return {
      type: 'danger',
      label: '已过期',
      description: '客户入口已过有效期，发送前请延长有效期。'
    };
  }
  return {
    type: 'success',
    label: '可发送',
    description: '取片码和有效期可用，可复制客户说明。'
  };
};

export const buildPickupShareText = (album?: PickupAlbumLike, entryUrl = '') => {
  const pickupCode = resolveAlbumPickupCode(album);
  const platformTips = buildPickupPlatformEntryTips(entryUrl);
  const lines = [
    '影约云客户取片',
    `相册：${album?.albumName || '客户相册'}`,
    album?.customerName ? `客户：${album.customerName}` : '',
    album?.customerPhone ? `手机号：${album.customerPhone}` : '',
    pickupCode ? `取片码：${pickupCode}` : '取片码：请先在后台补充客户取片码',
    album?.expireTime ? `有效期：${album.expireTime}` : '有效期：以门店通知为准',
    ...platformTips.map((item) => `${item.label}：${item.value}`),
    '说明：进入后输入手机号和取片码查看相册，照片仅对当前客户开放。'
  ];
  return lines.filter(Boolean).join('\n');
};

export const buildPickupChannelShareText = (album?: PickupAlbumLike, channelLabel = 'H5 网页', entryUrl = '') => {
  const pickupCode = resolveAlbumPickupCode(album);
  const normalizedChannel = String(channelLabel || '').trim();
  const lines = [
    '影约云客户取片',
    `相册：${album?.albumName || '客户相册'}`,
    album?.customerPhone ? `手机号：${album.customerPhone}` : '',
    pickupCode ? `取片码：${pickupCode}` : '取片码：请先在后台补充客户取片码',
    album?.expireTime ? `有效期：${album.expireTime}` : '有效期：以门店通知为准'
  ];
  if (normalizedChannel === '微信小程序') {
    lines.push('请在微信小程序打开「影约云客户取片」，输入手机号和取片码查看相册。');
  } else if (normalizedChannel === '抖音小程序') {
    lines.push('请在抖音小程序打开「影约云客户取片」，输入手机号和取片码查看相册。');
  } else {
    const qrState = buildPickupQrState(entryUrl);
    lines.push(qrState.available ? '请打开以下 H5 取片链接，输入手机号和取片码查看相册。' : '请从微信/抖音小程序进入「影约云客户取片」，输入手机号和取片码查看相册。');
    if (qrState.available) {
      lines.push(qrState.value);
    }
  }
  lines.push('照片仅对当前客户开放，下载/预览链接会短期失效。');
  return lines.filter(Boolean).join('\n');
};

const quotePowerShell = (value?: string | number) => {
  const text = String(value ?? '').trim();
  return `"${text.replace(/"/g, '`"')}"`;
};

export const buildPickupSmokeCommand = (input: PickupSmokeCommandInput) => {
  const parts = [
    '.\\tools\\photo-pickup-smoke.ps1',
    '-BaseUrl',
    quotePowerShell(input.baseUrl || 'https://api.evanshine.me'),
    '-Phone',
    quotePowerShell(input.phone || '<手机号>'),
    '-AccessCode',
    quotePowerShell(input.accessCode || '<取片码>')
  ];
  const albumId = String(input.albumId ?? '').trim();
  if (albumId) {
    parts.push('-AlbumId', quotePowerShell(albumId));
  }
  if (input.allowEmptyAlbum) {
    parts.push('-AllowEmptyAlbum');
  }
  return ['cd D:\\OtherProject\\CameraApp\\yingyue-cloud-repo', parts.join(' ')].join('\n');
};
