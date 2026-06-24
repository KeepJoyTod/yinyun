export function normalizeResultType(type) {
  const normalized = String(type || 'info').toLowerCase();
  if (normalized === 'error' || normalized === 'warning') {
    return normalized;
  }
  return 'info';
}

export function getResultStatusConfig(type) {
  const normalized = normalizeResultType(type);
  if (normalized === 'error') {
    return {
      title: '操作失败',
      buttonLabel: '返回重试',
      copy: '请返回登录页重新进入，或联系门店确认当前相册状态。',
      reason: '取片信息可能已过期、相册不在有效期内，或当前手机号没有访问该相册的权限。',
      nextSteps: ['重新输入手机号和取片码', '确认取片码没有多输空格', '仍然失败时联系门店核对相册状态'],
    };
  }
  if (normalized === 'warning') {
    return {
      title: '需要处理',
      buttonLabel: '继续查看',
      copy: '可以继续查看相册，也可以联系门店确认下一步处理方式。',
      reason: '照片可能仍在上传、精修或交付确认中，当前链接可以继续查看已有内容。',
      nextSteps: ['先返回相册目录查看已有照片', '稍后刷新目录等待门店上传完成', '需要加急时联系门店确认交付时间'],
    };
  }
  return {
    title: '操作成功',
    buttonLabel: '返回登录',
    copy: '你可以继续进入相册列表，查看刚刚准备好的照片目录。',
    reason: '身份校验已完成，可以返回相册列表继续查看照片目录。',
    nextSteps: ['进入相册列表', '打开照片目录', '预览或保存已开放照片'],
  };
}

export function getResultRedirectUrl(type, redirect) {
  const normalized = normalizeResultType(type);
  if (normalized === 'error') {
    const safeRedirect = normalizeSafePickupRedirect(redirect);
    if (safeRedirect) {
      return `/pages/pickup/login/index?redirect=${encodeURIComponent(safeRedirect)}`;
    }
    return '/pages/pickup/login/index';
  }
  return redirect || '/pages/pickup/albums/index';
}

export function normalizeSafePickupRedirect(redirect) {
  const normalized = String(redirect || '').trim();
  if (!normalized || !normalized.startsWith('/pages/pickup/')) {
    return '';
  }
  if (normalized.startsWith('/pages/pickup/login/')) {
    return '';
  }
  return normalized;
}
