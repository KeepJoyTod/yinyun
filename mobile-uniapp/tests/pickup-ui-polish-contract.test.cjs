const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('pickup login keeps customer trust cues visible', () => {
  const loginPage = read('src/pages/pickup/login/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(loginPage, /pickup-trust-strip/);
  assert.match(loginPage, /pickup-studio-scene/);
  assert.match(loginPage, /今日交付/);
  assert.match(loginPage, /精修片正在安全送达/);
  assert.match(loginPage, /pickup-privacy-note/);
  assert.match(loginPage, /手机号匹配/);
  assert.match(loginPage, /门店专属/);
  assert.match(loginPage, /限时查看/);
  assert.match(loginPage, /照片不公开展示/);
  assert.match(styles, /\.pickup-studio-scene/);
  assert.match(styles, /\.pickup-proof-card/);
  assert.match(styles, /\.pickup-trust-strip/);
  assert.match(styles, /\.pickup-privacy-note/);
});

test('pickup login explains the customer credential flow before entering albums', () => {
  const loginPage = read('src/pages/pickup/login/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(loginPage, /pickup-flow-panel/);
  assert.match(loginPage, /pickup-flow-step/);
  assert.match(loginPage, /填写手机号/);
  assert.match(loginPage, /输入门店取片码/);
  assert.match(loginPage, /进入私有相册/);
  assert.match(loginPage, /pickup-credential-note/);
  assert.match(loginPage, /取片信息只用于本次相册校验/);
  assert.match(styles, /\.pickup-flow-panel/);
  assert.match(styles, /\.pickup-flow-step/);
  assert.match(styles, /\.pickup-credential-note/);
});

test('album list shows a delivery dashboard before album cards', () => {
  const albumsPage = read('src/pages/pickup/albums/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(albumsPage, /album-gallery-hero/);
  assert.match(albumsPage, /你的照片已经整理好/);
  assert.match(albumsPage, /album-dashboard/);
  assert.match(albumsPage, /album-dashboard-item/);
  assert.match(albumsPage, /readyAlbumCount/);
  assert.match(albumsPage, /waitingAlbumCount/);
  assert.match(albumsPage, /可查看/);
  assert.match(albumsPage, /准备中/);
  assert.match(albumsPage, /album-status-line/);
  assert.match(albumsPage, /短期授权保护原图/);
  assert.match(styles, /\.album-gallery-hero/);
  assert.match(styles, /\.album-gallery-rail/);
  assert.match(styles, /\.album-dashboard/);
  assert.match(styles, /\.album-dashboard-item/);
  assert.match(styles, /\.album-status-line/);
});

test('album list empty and failed states provide clear recovery actions', () => {
  const albumsPage = read('src/pages/pickup/albums/index.vue');
  const albumState = read('src/pages/pickup/albums/album-state.mjs');
  const styles = read('src/styles/app.scss');

  assert.match(albumsPage, /album-recovery-panel/);
  assert.match(albumsPage, /album-recovery-step/);
  assert.match(albumsPage, /albumRecoverySteps/);
  assert.match(albumsPage, /getAlbumListRecoverySteps/);
  assert.match(albumsPage, /刷新相册/);
  assert.match(albumsPage, /重新登录/);
  assert.match(albumsPage, /联系门店/);
  assert.match(albumState, /getAlbumListRecoverySteps/);
  assert.match(styles, /\.album-recovery-panel/);
  assert.match(styles, /\.album-recovery-step/);
});

test('empty album cover looks like a delivery proof instead of a broken image', () => {
  const albumsPage = read('src/pages/pickup/albums/index.vue');
  const albumState = read('src/pages/pickup/albums/album-state.mjs');
  const styles = read('src/styles/app.scss');

  assert.match(albumsPage, /album-cover-matte/);
  assert.match(albumsPage, /album-cover-proof/);
  assert.match(albumsPage, /getAlbumAvailabilityLabel\(album\)/);
  assert.match(albumsPage, /album-delivery-strip/);
  assert.match(albumsPage, /getAlbumDeliverySteps\(album\)/);
  assert.match(albumState, /等待门店上传/);
  assert.match(albumState, /已交付/);
  assert.match(albumsPage, /照片准备中/);
  assert.match(styles, /\.album-cover-proof-frame/);
  assert.match(styles, /\.album-cover-proof-lines/);
  assert.match(styles, /\.album-cover-matte/);
  assert.match(styles, /\.album-delivery-strip/);
  assert.match(styles, /\.album-card-waiting/);
});

test('album detail summary uses customer-facing delivery language', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /本次照片目录/);
  assert.match(detailPage, /已按门店交付顺序整理/);
  assert.match(detailPage, /detail-hero-strip/);
  assert.match(detailPage, /empty-delivery-steps/);
  assert.match(detailPage, /相册已建立/);
  assert.match(detailPage, /等待门店上传/);
  assert.match(styles, /\.detail-hero-strip/);
  assert.match(styles, /\.empty-delivery-steps/);
  assert.doesNotMatch(detailPage, /Photo Delivery/);
});

test('album detail exposes selection status filters', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /asset-filter-bar/);
  assert.match(detailPage, /activeAssetFilter/);
  assert.match(detailPage, /filteredAssets/);
  assert.match(detailPage, /当前分类暂无照片/);
  assert.match(styles, /\.asset-filter-bar/);
  assert.match(styles, /\.asset-filter-button-active/);
});

test('album detail shows selected sequence and submission state copy', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const detailState = read('src/pages/pickup/detail/detail-state.mjs');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /assetSelectedSequence/);
  assert.match(detailPage, /asset-sequence-badge/);
  assert.match(detailPage, /selectionSummary\.title/);
  assert.match(detailPage, /selectionTimelineCopy/);
  assert.match(detailPage, /selection-submit-time/);
  assert.match(detailPage, /selectionStatus/);
  assert.match(detailState, /getSelectionSummary/);
  assert.match(detailState, /getSelectionTimelineCopy/);
  assert.match(detailState, /已提交/);
  assert.match(detailState, /精修中/);
  assert.match(detailState, /已交付/);
  assert.match(styles, /\.asset-sequence-badge/);
  assert.match(styles, /\.selection-submit-time/);
});

test('album detail keeps delivered album asset tiles in view mode', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const detailState = read('src/pages/pickup/detail/detail-state.mjs');

  assert.match(detailPage, /handleAssetButton/);
  assert.match(detailPage, /assetSelectButtonLabel/);
  assert.match(detailPage, /showAssetSequenceBadge/);
  assert.match(detailPage, /getAssetTileActionState/);
  assert.match(detailState, /getAssetTileActionState/);
  assert.match(detailState, /actionLabel: '查看'/);
  assert.match(detailState, /showSequence: false/);
});

test('h5 browser smoke can verify delivered album detail as view-only', () => {
  const smokeScript = read('tests/h5-browser-smoke.cjs');

  assert.match(smokeScript, /PICKUP_EXPECT_DELIVERED/);
  assert.match(smokeScript, /expectDelivered/);
  assert.match(smokeScript, /已交付/);
  assert.match(smokeScript, /打开照片查看大图/);
  assert.match(smokeScript, /保存需要的交付照片/);
  assert.match(smokeScript, /选片清单已锁定/);
  assert.match(smokeScript, /先点照片右上角选择/);
  assert.match(smokeScript, /delivered album detail/);
});

test('album detail exposes delivery proof metrics above the photo grid', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /delivery-proof-grid/);
  assert.match(detailPage, /delivery-proof-label/);
  assert.match(detailPage, /照片总数/);
  assert.match(detailPage, /预览状态/);
  assert.match(detailPage, /选片进度/);
  assert.match(detailPage, /effectiveSelectedCount/);
  assert.match(styles, /\.delivery-proof-grid/);
  assert.match(styles, /\.delivery-proof-item/);
});

test('album detail gives an actionable next step after delivery metrics', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const detailState = read('src/pages/pickup/detail/detail-state.mjs');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /delivery-next-panel/);
  assert.match(detailPage, /deliveryNextStep\.title/);
  assert.match(detailPage, /deliveryNextStep\.action/);
  assert.match(detailPage, /getDeliveryNextStep/);
  assert.match(detailState, /getDeliveryNextStep/);
  assert.match(detailState, /可以开始选片/);
  assert.match(detailState, /查看异常/);
  assert.match(styles, /\.delivery-next-panel/);
  assert.match(styles, /\.delivery-next-action/);
});

test('album detail explains selection rules before customers submit retouch choices', () => {
  const detailPage = read('src/pages/pickup/detail/index.vue');
  const detailState = read('src/pages/pickup/detail/detail-state.mjs');
  const styles = read('src/styles/app.scss');

  assert.match(detailPage, /selection-guide-panel/);
  assert.match(detailPage, /selection-guide-step/);
  assert.match(detailPage, /selectionGuideContent\.steps/);
  assert.match(detailPage, /selectionGuideContent\.note/);
  assert.match(detailState, /先点照片右上角选择/);
  assert.match(detailState, /选择顺序就是精修顺序/);
  assert.match(detailState, /提交后门店会按顺序处理/);
  assert.match(detailState, /打开照片查看大图/);
  assert.match(detailState, /选片清单已锁定/);
  assert.match(styles, /\.selection-guide-panel/);
  assert.match(styles, /\.selection-guide-step/);
  assert.match(styles, /\.selection-guide-note/);
});

test('preview page explains swipe and private download behavior', () => {
  const previewPage = read('src/pages/pickup/preview/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(previewPage, /preview-swipe-tip/);
  assert.match(previewPage, /左右滑动切换照片/);
  assert.match(previewPage, /下载地址不会长期保存/);
  assert.match(styles, /\.preview-swipe-tip/);
});

test('preview page shows file context and protected access proof', () => {
  const previewPage = read('src/pages/pickup/preview/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(previewPage, /preview-gallery-caption/);
  assert.match(previewPage, /轻触查看原比例，长按或保存用于交付留存/);
  assert.match(previewPage, /preview-file-context/);
  assert.match(previewPage, /preview-file-name/);
  assert.match(previewPage, /当前文件/);
  assert.match(previewPage, /访问凭证/);
  assert.match(previewPage, /限时签名/);
  assert.match(styles, /\.preview-gallery-caption/);
  assert.match(styles, /\.preview-file-context/);
  assert.match(styles, /\.preview-file-context-item/);
});

test('preview page shows image position progress and save safety note', () => {
  const previewPage = read('src/pages/pickup/preview/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(previewPage, /preview-progress-track/);
  assert.match(previewPage, /previewProgressPercent/);
  assert.match(previewPage, /preview-save-note/);
  assert.match(previewPage, /保存原图会重新校验当前取片身份/);
  assert.match(previewPage, /不会在页面里暴露后台地址/);
  assert.match(styles, /\.preview-progress-track/);
  assert.match(styles, /\.preview-progress-fill/);
  assert.match(styles, /\.preview-save-note/);
});

test('result page gives diagnostic reason next step and safe pickup boundary', () => {
  const resultPage = read('src/pages/pickup/result/index.vue');
  const styles = read('src/styles/app.scss');

  assert.match(resultPage, /result-diagnostic-panel/);
  assert.match(resultPage, /result-diagnostic-item/);
  assert.match(resultPage, /result-next-steps/);
  assert.match(resultPage, /result-safety-note/);
  assert.match(resultPage, /当前状态/);
  assert.match(resultPage, /可能原因/);
  assert.match(resultPage, /下一步/);
  assert.match(resultPage, /手机号和取片码只用于校验当前相册/);
  assert.match(resultPage, /不会展示后台地址或长期图片链接/);
  assert.match(styles, /\.result-diagnostic-panel/);
  assert.match(styles, /\.result-diagnostic-item/);
  assert.match(styles, /\.result-next-steps/);
  assert.match(styles, /\.result-safety-note/);
});
