const test = require('node:test');
const assert = require('node:assert/strict');

const previewStateModule = import('../src/pages/pickup/preview/preview-state.mjs');

test('preview image error clears preview url and shows retry copy', () => {
  return previewStateModule.then(({ applyPreviewImageError, initPreviewState }) => {
    const state = initPreviewState();
    state.previewUrl = 'https://example.com/test.png';
    state.imageLoaded = true;

    applyPreviewImageError(state);

    assert.equal(state.imageLoaded, false);
    assert.equal(state.previewUrl, '');
    assert.equal(state.errorMessage, '图片加载失败，请重试');
  });
});

test('preview error help text gives a customer next step', () => {
  return previewStateModule.then(({ getPreviewErrorHelpText }) => {
    assert.equal(
      getPreviewErrorHelpText('图片加载失败，请重试'),
      '请先重新加载；如果仍然失败，请稍后再试或联系门店确认照片已上传完成。',
    );
    assert.equal(
      getPreviewErrorHelpText('图片不存在或无权限访问'),
      '请返回目录确认相册仍在有效期内；如果仍然打不开，请联系门店重新确认取片信息。',
    );
  });
});

test('preview image load marks image ready and clears error copy', () => {
  return previewStateModule.then(({ applyPreviewImageLoad, initPreviewState }) => {
    const state = initPreviewState();
    state.errorMessage = '旧错误';

    applyPreviewImageLoad(state);

    assert.equal(state.imageLoaded, true);
    assert.equal(state.errorMessage, '');
  });
});

test('download is disabled when preview is unavailable', () => {
  return previewStateModule.then(({ canDownloadPreview }) => {
    assert.equal(typeof canDownloadPreview, 'function');
    assert.equal(
      canDownloadPreview({
        assetId: '2063173289800183809',
        previewUrl: '',
        loading: false,
        downloading: false,
      }),
      false,
    );
    assert.equal(
      canDownloadPreview({
        assetId: '2063173289800183809',
        previewUrl: 'https://example.com/photo.jpg',
        imageLoaded: false,
        loading: false,
        downloading: false,
      }),
      false,
    );
    assert.equal(
      canDownloadPreview({
        assetId: '2063173289800183809',
        previewUrl: 'https://example.com/photo.jpg',
        imageLoaded: true,
        loading: false,
        downloading: false,
      }),
      true,
    );
  });
});

test('download failure feedback gives customer and operator next steps', () => {
  return previewStateModule.then(({ getDownloadFailureFeedback }) => {
    assert.equal(typeof getDownloadFailureFeedback, 'function');

    assert.deepEqual(getDownloadFailureFeedback('saveImageToPhotosAlbum:fail auth deny', { action: 'save' }), {
      type: 'warning',
      title: '需要相册权限',
      message: '请允许保存到系统相册后再重试。',
      help: '点“去设置”开启相册权限；如果仍然失败，可返回目录重新进入照片。',
      shouldOpenSetting: true,
      shouldReauth: false,
    });

    assert.deepEqual(getDownloadFailureFeedback('下载失败：403', { action: 'download' }), {
      type: 'warning',
      title: '身份已过期',
      message: '登录已过期，请重新输入手机号和取片码。',
      help: '为保护原图，下载前会重新确认取片身份。',
      shouldOpenSetting: false,
      shouldReauth: true,
    });

    assert.deepEqual(getDownloadFailureFeedback('OSS 对象不存在', { action: 'download' }), {
      type: 'error',
      title: '原图未就绪',
      message: '原图文件暂时不存在，请联系门店确认照片已上传完成。',
      help: '后台需要检查 OSS Key、照片可见状态和私有 OSS 文件是否存在。',
      shouldOpenSetting: false,
      shouldReauth: false,
    });

    assert.deepEqual(getDownloadFailureFeedback('unknown native failure', { action: 'download' }), {
      type: 'error',
      title: '下载失败',
      message: '网络不稳定，下载没有完成。',
      help: '请切换网络后重试；如果多次失败，请联系门店重新确认照片。',
      shouldOpenSetting: false,
      shouldReauth: false,
    });
  });
});

test('miniapp save failure feedback separates cancel permission and system failures', () => {
  return previewStateModule.then(({ getDownloadFailureFeedback }) => {
    assert.deepEqual(getDownloadFailureFeedback('saveImageToPhotosAlbum:fail cancel', { action: 'save' }), {
      type: 'info',
      title: '已取消保存',
      message: '本次没有保存到系统相册。',
      help: '需要原图时，可以重新点“保存图片”。',
      shouldOpenSetting: false,
      shouldReauth: false,
    });

    assert.deepEqual(getDownloadFailureFeedback('saveImageToPhotosAlbum:fail auth deny', { action: 'save' }), {
      type: 'warning',
      title: '需要相册权限',
      message: '请允许保存到系统相册后再重试。',
      help: '点“去设置”开启相册权限；如果仍然失败，可返回目录重新进入照片。',
      shouldOpenSetting: true,
      shouldReauth: false,
    });

    assert.deepEqual(getDownloadFailureFeedback('downloadFile:fail timeout', { action: 'download' }), {
      type: 'error',
      title: '网络中断',
      message: '图片下载超时，请切换网络后重试。',
      help: '如果门店网络较慢，可以稍后再打开相册保存原图。',
      shouldOpenSetting: false,
      shouldReauth: false,
    });

    assert.deepEqual(getDownloadFailureFeedback('saveImageToPhotosAlbum:fail system error', { action: 'save' }), {
      type: 'error',
      title: '系统相册异常',
      message: '系统相册暂时没有完成保存。',
      help: '请确认手机存储空间和相册权限正常，再重新保存。',
      shouldOpenSetting: false,
      shouldReauth: false,
    });
  });
});

test('customer-facing UI guards remain present in page templates', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const loginPage = fs.readFileSync(path.join(root, 'src/pages/pickup/login/index.vue'), 'utf8');
  const detailPage = fs.readFileSync(path.join(root, 'src/pages/pickup/detail/index.vue'), 'utf8');
  const previewPage = fs.readFileSync(path.join(root, 'src/pages/pickup/preview/index.vue'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'src/styles/app.scss'), 'utf8');

  assert.match(loginPage, /phoneError/);
  assert.match(loginPage, /pickupCodeError/);
  assert.match(styles, /\.field-error/);
  assert.match(detailPage, /selection-submit-spacer/);
  assert.match(styles, /\.selection-submit-spacer/);
  assert.match(styles, /\.asset-select-button[\s\S]*min-height:\s*58rpx/);
  assert.match(previewPage, /download-feedback/);
  assert.match(previewPage, /downloadMessageType/);
  assert.match(previewPage, /downloadHelpText/);
  assert.match(previewPage, /download-feedback-help/);
  assert.match(styles, /\.download-feedback-help/);
});

test('detail preview signing failure moves asset into error state', () => {
  return previewStateModule.then(({ applyDetailPreviewError }) => {
    assert.equal(typeof applyDetailPreviewError, 'function');
    const state = applyDetailPreviewError(
      {
        previewLoadMap: { a1: 'loading' },
        previewErrorMap: {},
      },
      'a1',
      'OSS 对象不存在',
    );

    assert.equal(state.previewLoadMap.a1, 'error');
    assert.equal(state.previewErrorMap.a1, 'OSS 对象不存在');
  });
});

test('preview back target falls back to album detail on direct links', () => {
  return previewStateModule.then(({ getPreviewBackUrl }) => {
    assert.equal(typeof getPreviewBackUrl, 'function');
    assert.equal(
      getPreviewBackUrl('903001'),
      '/pages/pickup/detail/index?albumId=903001',
    );
    assert.equal(getPreviewBackUrl(''), '/pages/pickup/albums/index');
  });
});

test('detail preview signing batches prioritize first screen and chunk the rest', () => {
  return previewStateModule.then(({ createBatchesByPriority, createDetailPreviewSigningBatches }) => {
    assert.equal(typeof createBatchesByPriority, 'function');
    const assets = Array.from({ length: 12 }, (_, index) => ({
      assetId: String(index + 1),
    }));

    const batches = createBatchesByPriority(assets, {
      firstBatchSize: 5,
      batchSize: 3,
    });

    assert.deepEqual(
      batches.map((batch) => batch.map((asset) => asset.assetId)),
      [
        ['1', '2', '3', '4', '5'],
        ['6', '7', '8'],
        ['9', '10', '11'],
        ['12'],
      ],
    );
    assert.deepEqual(createDetailPreviewSigningBatches(assets, { firstBatchSize: 2 }).map((batch) => batch.length), [2, 4, 4, 2]);
  });
});

test('album cover signing batches can use smaller first screen limits', () => {
  return previewStateModule.then(({ createAlbumCoverSigningBatches }) => {
    assert.equal(typeof createAlbumCoverSigningBatches, 'function');
    const albums = Array.from({ length: 7 }, (_, index) => ({
      albumId: String(index + 1),
      coverAssetId: `cover-${index + 1}`,
    }));

    const batches = createAlbumCoverSigningBatches(albums, {
      firstBatchSize: 3,
      batchSize: 2,
    });

    assert.deepEqual(
      batches.map((batch) => batch.map((album) => album.albumId)),
      [
        ['1', '2', '3'],
        ['4', '5'],
        ['6', '7'],
      ],
    );
  });
});

test('detail preview progress reports failed assets separately from prepared assets', () => {
  return previewStateModule.then(({ getDetailPreviewProgress }) => {
    assert.equal(typeof getDetailPreviewProgress, 'function');
    const assets = [{ assetId: 'a' }, { assetId: 'b' }, { assetId: 'c' }, { assetId: 'd' }];

    const progress = getDetailPreviewProgress(assets, {
      a: 'ready',
      b: 'loaded',
      c: 'error',
      d: 'loading',
    });

    assert.deepEqual(progress, {
      total: 4,
      prepared: 2,
      failed: 1,
      loading: 1,
      waiting: 0,
    });
  });
});
