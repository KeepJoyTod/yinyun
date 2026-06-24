export const DEFAULT_ERROR_MESSAGE = '图片加载失败，请重试';
export const PREVIEW_ERROR_HELP_TEXT = '请先重新加载；如果仍然失败，请稍后再试或联系门店确认照片已上传完成。';

export function initPreviewState() {
  return {
    previewUrl: '',
    imageLoaded: false,
    errorMessage: '',
  };
}

export function applyPreviewImageLoad(state) {
  state.imageLoaded = true;
  state.errorMessage = '';
  return state;
}

export function applyPreviewImageError(state, message = DEFAULT_ERROR_MESSAGE) {
  state.previewUrl = '';
  state.imageLoaded = false;
  state.errorMessage = message;
  return state;
}

export function resetPreviewImageState(state) {
  state.imageLoaded = false;
  state.errorMessage = '';
  return state;
}

export function canDownloadPreview({ assetId, previewUrl, imageLoaded, loading, downloading }) {
  return Boolean(assetId) && Boolean(previewUrl) && Boolean(imageLoaded) && !loading && !downloading;
}

export function applyDetailPreviewError(state, assetKey, message = '图片加载失败') {
  return {
    previewLoadMap: {
      ...state.previewLoadMap,
      [assetKey]: 'error',
    },
    previewErrorMap: {
      ...state.previewErrorMap,
      [assetKey]: message,
    },
  };
}

export function createBatchesByPriority(items, options = {}) {
  const firstBatchSize = Math.max(1, Number(options.firstBatchSize || 6));
  const batchSize = Math.max(1, Number(options.batchSize || 4));
  const source = Array.isArray(items) ? items : [];
  const batches = [];
  let cursor = 0;

  if (source.length > 0) {
    batches.push(source.slice(0, firstBatchSize));
    cursor = firstBatchSize;
  }

  while (cursor < source.length) {
    batches.push(source.slice(cursor, cursor + batchSize));
    cursor += batchSize;
  }

  return batches.filter((batch) => batch.length > 0);
}

export function createDetailPreviewSigningBatches(assets, options = {}) {
  return createBatchesByPriority(assets, options);
}

export function createAlbumCoverSigningBatches(albums, options = {}) {
  return createBatchesByPriority(albums, {
    firstBatchSize: options.firstBatchSize || 3,
    batchSize: options.batchSize || 2,
  });
}

export function getDetailPreviewProgress(assets, previewLoadMap = {}) {
  const source = Array.isArray(assets) ? assets : [];
  return source.reduce(
    (progress, asset) => {
      const assetKey = String(asset?.assetId || '');
      const state = previewLoadMap[assetKey];
      if (state === 'loading') {
        progress.loading += 1;
      } else if (state === 'error') {
        progress.failed += 1;
      } else if (state === 'ready' || state === 'loaded') {
        progress.prepared += 1;
      } else {
        progress.waiting += 1;
      }
      return progress;
    },
    {
      total: source.length,
      prepared: 0,
      failed: 0,
      loading: 0,
      waiting: 0,
    },
  );
}

export function getPreviewBackUrl(albumId) {
  const normalizedAlbumId = String(albumId || '').trim();
  if (!normalizedAlbumId) {
    return '/pages/pickup/albums/index';
  }
  return `/pages/pickup/detail/index?albumId=${encodeURIComponent(normalizedAlbumId)}`;
}

export function getPreviewErrorHelpText(errorMessage = '') {
  const normalizedMessage = String(errorMessage || '').trim();
  if (!normalizedMessage) {
    return PREVIEW_ERROR_HELP_TEXT;
  }
  if (/无权限|不存在|过期|登录/.test(normalizedMessage)) {
    return '请返回目录确认相册仍在有效期内；如果仍然打不开，请联系门店重新确认取片信息。';
  }
  return PREVIEW_ERROR_HELP_TEXT;
}

export function getDownloadFailureFeedback(errorMessage = '', options = {}) {
  const normalizedMessage = String(errorMessage || '').trim();
  const action = String(options.action || 'download');
  const isSaveAction = action === 'save';

  if (/cancel|取消/i.test(normalizedMessage)) {
    return {
      type: 'info',
      title: '已取消保存',
      message: '本次没有保存到系统相册。',
      help: '需要原图时，可以重新点“保存图片”。',
      shouldOpenSetting: false,
      shouldReauth: false,
    };
  }

  if (/auth|authorize|permission|scope|deny|相册权限/i.test(normalizedMessage)) {
    return {
      type: 'warning',
      title: '需要相册权限',
      message: '请允许保存到系统相册后再重试。',
      help: '点“去设置”开启相册权限；如果仍然失败，可返回目录重新进入照片。',
      shouldOpenSetting: true,
      shouldReauth: false,
    };
  }

  if (/401|403|登录|token|身份|无权限|过期/i.test(normalizedMessage)) {
    return {
      type: 'warning',
      title: '身份已过期',
      message: '登录已过期，请重新输入手机号和取片码。',
      help: '为保护原图，下载前会重新确认取片身份。',
      shouldOpenSetting: false,
      shouldReauth: true,
    };
  }

  if (/OSS|对象不存在|文件不存在|not\s*found|404/i.test(normalizedMessage)) {
    return {
      type: 'error',
      title: '原图未就绪',
      message: '原图文件暂时不存在，请联系门店确认照片已上传完成。',
      help: '后台需要检查 OSS Key、照片可见状态和私有 OSS 文件是否存在。',
      shouldOpenSetting: false,
      shouldReauth: false,
    };
  }

  if (/timeout|timed\s*out|network|request:fail|downloadFile:fail|网络/i.test(normalizedMessage)) {
    return {
      type: 'error',
      title: '网络中断',
      message: '图片下载超时，请切换网络后重试。',
      help: '如果门店网络较慢，可以稍后再打开相册保存原图。',
      shouldOpenSetting: false,
      shouldReauth: false,
    };
  }

  if (isSaveAction && /system|album|photos|相册|存储|storage/i.test(normalizedMessage)) {
    return {
      type: 'error',
      title: '系统相册异常',
      message: '系统相册暂时没有完成保存。',
      help: '请确认手机存储空间和相册权限正常，再重新保存。',
      shouldOpenSetting: false,
      shouldReauth: false,
    };
  }

  return {
    type: 'error',
    title: isSaveAction ? '保存失败' : '下载失败',
    message: isSaveAction ? '图片没有保存成功。' : '网络不稳定，下载没有完成。',
    help: '请切换网络后重试；如果多次失败，请联系门店重新确认照片。',
    shouldOpenSetting: false,
    shouldReauth: false,
  };
}

export default {
  DEFAULT_ERROR_MESSAGE,
  PREVIEW_ERROR_HELP_TEXT,
  initPreviewState,
  applyPreviewImageLoad,
  applyPreviewImageError,
  resetPreviewImageState,
  canDownloadPreview,
  applyDetailPreviewError,
  createBatchesByPriority,
  createDetailPreviewSigningBatches,
  createAlbumCoverSigningBatches,
  getDetailPreviewProgress,
  getPreviewBackUrl,
  getPreviewErrorHelpText,
  getDownloadFailureFeedback,
};
