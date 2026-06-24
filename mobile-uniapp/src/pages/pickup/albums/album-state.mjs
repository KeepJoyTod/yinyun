function normalizeStatus(status) {
  return String(status || '').toUpperCase();
}

function getAssetCount(album) {
  const count = Number(album?.assetCount || 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function isDeliveredAlbum(album) {
  return [album?.status, album?.selectionStatus].some((status) => normalizeStatus(status) === 'DELIVERED');
}

export function getAlbumAvailabilityLabel(album = {}) {
  const status = normalizeStatus(album.status);
  if (['EXPIRED', 'OVERDUE'].includes(status)) {
    return '已过期';
  }
  if (['DISABLED', 'CLOSED', 'INACTIVE'].includes(status)) {
    return '不可用';
  }
  if (isDeliveredAlbum(album) && getAssetCount(album) > 0) {
    return '已交付';
  }
  if (getAssetCount(album) === 0) {
    return '待开放';
  }
  return '可查看';
}

export function getAlbumActionLabel(album = {}) {
  const label = getAlbumAvailabilityLabel(album);
  return ['可查看', '已交付'].includes(label) ? '打开相册' : '查看状态';
}

export function getAlbumDeliverySteps(album = {}) {
  const ready = getAssetCount(album) > 0;
  const delivered = isDeliveredAlbum(album) && ready;
  return [
    {
      title: '相册已建立',
      copy: '取片码已绑定',
      active: true,
    },
    {
      title: ready ? '照片已开放' : '等待门店上传',
      copy: ready ? '可预览保存' : '上传后自动显示',
      active: ready,
    },
    {
      title: delivered ? '已交付' : '安全交付',
      copy: delivered ? '可查看保存' : '短期授权查看',
      active: ready,
    },
  ];
}

export function getAlbumListRecoverySteps({ loadFailed = false } = {}) {
  if (loadFailed) {
    return [
      { title: '重新加载', copy: '网络恢复后重新获取当前手机号的相册。' },
      { title: '重新登录', copy: '取片码过期或输错时，重新输入即可校验。' },
      { title: '联系门店', copy: '请门店确认相册是否已开放给当前手机号。' },
    ];
  }
  return [
    { title: '刷新相册', copy: '门店刚上传照片时，刷新后会自动出现。' },
    { title: '重新登录', copy: '确认手机号和取片码是否来自同一家门店。' },
    { title: '联系门店', copy: '请门店核对手机号、取片码和相册有效期。' },
  ];
}
