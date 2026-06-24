import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const photoPageSource = readFileSync(resolve(__dirname, '../photo/index.vue'), 'utf-8');

function expectFieldOptions(label: string, prop: string, optionsName: string) {
  const pattern = new RegExp(
    `<el-form-item\\s+label="${label}"\\s+prop="${prop}"[\\s\\S]*?<el-option\\s+v-for="item in ${optionsName}"`,
  );
  expect(photoPageSource).toMatch(pattern);
}

describe('photo page template contracts', () => {
  it('keeps asset yes/no filters separate from access log success filters', () => {
    expectFieldOptions('是否已选', 'isSelected', 'yesNoOptions');
    expectFieldOptions('成功', 'success', 'photoAccessSuccessOptions');
  });

  it('uses customer-facing pickup code wording in album operations', () => {
    expect(photoPageSource).toContain('客户取片码');
    expect(photoPageSource).toContain('发给客户登录相册的取片码');
    expect(photoPageSource).not.toContain('公开令牌');
    expect(photoPageSource).not.toContain('公开选片 token');
  });

  it('keeps a gallery mode for asset review without dropping row actions', () => {
    expect(photoPageSource).toContain("assetViewMode = ref<'table' | 'gallery'>('table')");
    expect(photoPageSource).toContain('yy-photo-gallery');
    expect(photoPageSource).toContain('yy-photo-gallery-card');
    expect(photoPageSource).toContain("v-hasPermi=\"['yy:photoAccessLog:list']\"");
    expect(photoPageSource).toContain("v-hasPermi=\"['yy:photoAsset:edit']\"");
    expect(photoPageSource).toContain("v-hasPermi=\"['yy:photoAsset:remove']\"");
  });

  it('keeps visible diagnostics on asset gallery cards', () => {
    expect(photoPageSource).toContain('yy-photo-gallery-diagnostics');
    expect(photoPageSource).toContain('getAssetGalleryDiagnostics(asset)');
    expect(photoPageSource).toContain('const getAssetGalleryDiagnostics');
    expect(photoPageSource).toContain('缺 OSS Key');
    expect(photoPageSource).toContain('缺预览地址');
    expect(photoPageSource).toContain('隐藏');
    expect(photoPageSource).toContain('已选');
    expect(photoPageSource).toContain('可交付');
  });

  it('keeps an operations overview before the photo tables', () => {
    expect(photoPageSource).toContain('客片选片工作台');
    expect(photoPageSource).toContain('yy-photo-overview-grid');
    expect(photoPageSource).toContain('activeTabLabel');
    expect(photoPageSource).toContain('activeFilterSummary');
    expect(photoPageSource).toContain('私有 OSS + 短期授权');
  });

  it('keeps upload asset recovery visible after OSS upload succeeds', () => {
    expect(photoPageSource).toContain('重试建底片');
    expect(photoPageSource).toContain('isRecoverableUploadResult(scope.row)');
    expect(photoPageSource).toContain('retryCreateAssetFromUploadResult');
    expect(photoPageSource).toContain('可重试');
  });

  it('keeps a copyable production preflight command after real OSS uploads', () => {
    expect(photoPageSource).toContain('复制预检命令');
    expect(photoPageSource).toContain('canCopyPhotoPickupPreflightCommand(scope.row)');
    expect(photoPageSource).toContain('copyPhotoPickupPreflightCommand(scope.row)');
    expect(photoPageSource).toContain('buildPhotoPickupPreflightCommand');
    expect(photoPageSource).toContain('resolveBareOssUrlFromUploadResult');
    expect(photoPageSource).toContain('findUploadedAssetByObjectKey');
    expect(photoPageSource).toContain('VITE_APP_PUBLIC_API_URL');
  });

  it('keeps production preflight commands available from existing asset rows', () => {
    expect(photoPageSource).toContain('copyAssetPreflightCommand(scope.row)');
    expect(photoPageSource).toContain('copyAssetPreflightCommand(asset)');
    expect(photoPageSource).toContain('const copyAssetPreflightCommand');
    expect(photoPageSource).toContain('const findAlbumForAsset');
    expect(photoPageSource).toContain('getYyPhotoAlbum(asset.albumId)');
    expect(photoPageSource).toContain('当前底片缺少可验证的阿里云 OSS 裸链');
    expect(photoPageSource).toContain('底片预检命令已复制');
  });

  it('accepts order troubleshooting query params from the order page', () => {
    expect(photoPageSource).toContain('useRoute()');
    expect(photoPageSource).toContain('applyPhotoWorkbenchRouteQuery');
    expect(photoPageSource).toContain('route.query.tab');
    expect(photoPageSource).toContain('route.query.orderId');
    expect(photoPageSource).toContain('route.query.customerPhone');
    expect(photoPageSource).toContain("activeTab.value = 'accessLog'");
    expect(photoPageSource).toContain("intent === 'pickup-entry'");
    expect(photoPageSource).toContain('openSingleAlbumPickupEntryFromRoute');
    expect(photoPageSource).toContain('handleAlbumPickupEntry(albums[0])');
  });

  it('keeps the customer pickup entry dialog on album rows', () => {
    expect(photoPageSource).toContain('取片入口');
    expect(photoPageSource).toContain('取片健康');
    expect(photoPageSource).toContain('getPickupDeliveryHealth(scope.row)');
    expect(photoPageSource).toContain('pickupEntryDialog');
    expect(photoPageSource).toContain('handleAlbumPickupEntry');
    expect(photoPageSource).toContain('客户取片说明');
    expect(photoPageSource).toContain('客户入口渠道');
    expect(photoPageSource).toContain('pickupPlatformEntryTips');
    expect(photoPageSource).toContain('yy-pickup-platform-list');
    expect(photoPageSource).toContain('copyPickupShareText');
    expect(photoPageSource).toContain('copyPickupChannelShareText');
    expect(photoPageSource).toContain('buildPickupChannelShareText');
    expect(photoPageSource).toContain('复制话术');
    expect(photoPageSource).toContain('yy-pickup-channel-copy');
    expect(photoPageSource).toContain('buildPickupShareText');
    expect(photoPageSource).toContain('buildPickupPlatformEntryTips');
    expect(photoPageSource).toContain('运营验收命令');
    expect(photoPageSource).toContain('复制相册验收命令');
    expect(photoPageSource).toContain('pickupSmokeCommand');
    expect(photoPageSource).toContain('copyPickupSmokeCommand');
    expect(photoPageSource).toContain('buildPickupSmokeCommand');
    expect(photoPageSource).toContain('真实 OSS 证据');
    expect(photoPageSource).toContain('realOssEvidenceInputCommand');
    expect(photoPageSource).toContain('copyRealOssEvidenceInputCommand');
    expect(photoPageSource).toContain('new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs');
    expect(photoPageSource).toContain('下载二维码');
    expect(photoPageSource).toContain('downloadPickupQrImage');
    expect(photoPageSource).toContain('buildPickupQrDownloadFileName');
    expect(photoPageSource).toContain('photo-pickup-${albumName}-${albumId}.png');
    expect(photoPageSource).toContain('allowEmptyAlbum: visibleAssets === 0');
    expect(photoPageSource).toContain('yy-pickup-ops-section');
  });

  it('keeps a selected-photo shortcut for submitted album selections', () => {
    expect(photoPageSource).toContain('查看已选');
    expect(photoPageSource).toContain('handleAlbumSelectedAssets');
    expect(photoPageSource).toContain("isSelected: '1'");
    expect(photoPageSource).toContain("visible: '1'");
  });

  it('keeps a confirm-selection shortcut for submitted album selections', () => {
    expect(photoPageSource).toContain('确认选片');
    expect(photoPageSource).toContain('handleAlbumSelectionConfirm');
    expect(photoPageSource).toContain("selectionStatus === 'SUBMITTED'");
    expect(photoPageSource).toContain("selectionStatus: 'COMPLETED'");
    expect(photoPageSource).toContain("v-hasPermi=\"['yy:photoAlbum:edit']\"");
  });

  it('keeps an operations troubleshooting summary on album rows', () => {
    expect(photoPageSource).toContain('运营排障');
    expect(photoPageSource).toContain('getAlbumOperationsSummary(scope.row)');
    expect(photoPageSource).toContain('yy-album-ops-summary');
    expect(photoPageSource).toContain('yy-album-ops-issues');
    expect(photoPageSource).toContain('handleAlbumAudit(scope.row)');
    expect(photoPageSource).toContain('buildAlbumOperationsSummary');
  });

  it('keeps row-level operation actions for album troubleshooting', () => {
    expect(photoPageSource).toContain('yy-album-ops-actions');
    expect(photoPageSource).toContain('getAlbumOperationActions(scope.row)');
    expect(photoPageSource).toContain('handleAlbumOperationAction(action, scope.row)');
    expect(photoPageSource).toContain('v-if="action.perms.length"');
    expect(photoPageSource).toContain('v-else');
    expect(photoPageSource).toContain('编辑相册');
    expect(photoPageSource).toContain('上传照片');
    expect(photoPageSource).toContain('查看缺 Key');
    expect(photoPageSource).toContain('查看审计');
    expect(photoPageSource).toContain('取片入口');
    expect(photoPageSource).toContain('yy-album-workspace-action-plan');
  });

  it('loads album operations summary from backend before falling back to local rows', () => {
    expect(photoPageSource).toContain('listYyPhotoAlbumOperationsSummary');
    expect(photoPageSource).toContain('albumOperationsSummaryMap');
    expect(photoPageSource).toContain('loadAlbumOperationsSummaries');
    expect(photoPageSource).toContain('getFallbackAlbumOperationsStats');
  });

  it('keeps an album workspace drawer for one-screen delivery troubleshooting', () => {
    expect(photoPageSource).toContain('相册工作台');
    expect(photoPageSource).toContain('handleAlbumWorkspace');
    expect(photoPageSource).toContain('albumWorkspaceDialog');
    expect(photoPageSource).toContain('yy-album-workspace');
    expect(photoPageSource).toContain('工作台摘要');
    expect(photoPageSource).toContain('照片交付');
    expect(photoPageSource).toContain('取片入口');
    expect(photoPageSource).toContain('选片结果');
    expect(photoPageSource).toContain('访问排障');
  });

  it('keeps a focused pending checklist inside the album workspace drawer', () => {
    expect(photoPageSource).toContain('yy-album-workspace-pending-list');
    expect(photoPageSource).toContain('本相册待处理清单');
    expect(photoPageSource).toContain('getAlbumWorkspacePendingItems(albumWorkspaceAlbum)');
    expect(photoPageSource).toContain('getAlbumWorkspacePendingItems');
    expect(photoPageSource).toContain('yy-album-workspace-pending-item');
    expect(photoPageSource).toContain('yy-album-workspace-pending-empty');
    expect(photoPageSource).toContain('缺手机号');
    expect(photoPageSource).toContain('缺取片码');
    expect(photoPageSource).toContain('无可见照片');
    expect(photoPageSource).toContain('缺 OSS Key');
    expect(photoPageSource).toContain('最近访问失败');
    expect(photoPageSource).toContain('handleAlbumOperationAction(item.action, albumWorkspaceAlbum)');
  });

  it('keeps real OSS evidence command directly inside the album workspace drawer', () => {
    expect(photoPageSource).toContain('yy-album-workspace-evidence');
    expect(photoPageSource).toContain('真实 OSS 证据');
    expect(photoPageSource).toContain('realOssEvidenceInputCommand');
    expect(photoPageSource).toContain('copyRealOssEvidenceInputCommand');
    expect(photoPageSource).toContain('复制证据清单命令');
    expect(photoPageSource).toContain('new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs');
    expect(photoPageSource).toContain('workspaceRealOssEvidenceAsset');
    expect(photoPageSource).toContain('copyWorkspaceRealOssEvidenceCommand');
    expect(photoPageSource).toContain('复制自动证据命令');
    expect(photoPageSource).toContain('workspaceRealOssEvidenceFinalPassCommand');
    expect(photoPageSource).toContain('copyWorkspaceRealOssEvidenceFinalPassCommand');
    expect(photoPageSource).toContain('复制最终 PASS 命令');
    expect(photoPageSource).toContain('manualConfirm: true');
    expect(photoPageSource).toContain('buildRealOssEvidenceCommand');
  });

  it('keeps scoped photo troubleshooting inside the album workspace drawer', () => {
    expect(photoPageSource).toContain('照片排障');
    expect(photoPageSource).toContain('yy-album-workspace-assets');
    expect(photoPageSource).toContain('workspaceAssetDiagnostics');
    expect(photoPageSource).toContain('workspaceAssetPreviewList');
    expect(photoPageSource).toContain('workspaceAssetStatusCounts');
    expect(photoPageSource).toContain('workspaceAssetIssueCounts');
    expect(photoPageSource).toContain('加载照片排障');
    expect(photoPageSource).toContain('handleWorkspaceAssetTroubleshooting');
    expect(photoPageSource).toContain('handleWorkspaceMissingObjectKeys');
    expect(photoPageSource).toContain('缺 OSS Key');
    expect(photoPageSource).toContain('隐藏');
    expect(photoPageSource).toContain('已选');
  });

  it('keeps batch visible controls for selected album assets', () => {
    expect(photoPageSource).toContain('批量可见');
    expect(photoPageSource).toContain('批量隐藏');
    expect(photoPageSource).toContain("handleAssetBatchVisible('1')");
    expect(photoPageSource).toContain("handleAssetBatchVisible('0')");
    expect(photoPageSource).toContain('const handleAssetBatchVisible');
    expect(photoPageSource).toContain('await getYyPhotoAsset(id)');
    expect(photoPageSource).toContain('await updateYyPhotoAsset');
    expect(photoPageSource).toContain('批量设为可见');
  });

  it('keeps quick rename controls for album assets without opening the full edit dialog', () => {
    expect(photoPageSource).toContain('快捷重命名');
    expect(photoPageSource).toContain('handleAssetQuickRename(scope.row)');
    expect(photoPageSource).toContain('handleAssetQuickRename(asset)');
    expect(photoPageSource).toContain('const handleAssetQuickRename');
    expect(photoPageSource).toContain('请输入新的照片名称');
    expect(photoPageSource).toContain('await getYyPhotoAsset(row.id)');
    expect(photoPageSource).toContain('fileName: nextName');
    expect(photoPageSource).toContain('照片名称已更新');
  });

  it('keeps simple move controls for photo delivery order without adding a new backend endpoint', () => {
    expect(photoPageSource).toContain('上移');
    expect(photoPageSource).toContain('下移');
    expect(photoPageSource).toContain('handleAssetMove(scope.row, -1)');
    expect(photoPageSource).toContain('handleAssetMove(scope.row, 1)');
    expect(photoPageSource).toContain('handleAssetMove(asset, -1)');
    expect(photoPageSource).toContain('handleAssetMove(asset, 1)');
    expect(photoPageSource).toContain('const handleAssetMove');
    expect(photoPageSource).toContain('const sortedAssets');
    expect(photoPageSource).toContain('currentSort');
    expect(photoPageSource).toContain('targetSort');
    expect(photoPageSource).toContain('照片顺序已更新');
  });

  it('keeps recent access troubleshooting inside the customer pickup entry dialog', () => {
    expect(photoPageSource).toContain('最近访问');
    expect(photoPageSource).toContain('最近失败');
    expect(photoPageSource).toContain('pickupEntryAccessLoading');
    expect(photoPageSource).toContain('pickupEntryRecentAccessLog');
    expect(photoPageSource).toContain('pickupEntryRecentFailureLog');
    expect(photoPageSource).toContain('loadPickupEntryAccessSummary(row)');
    expect(photoPageSource).toContain('listYyPhotoAccessLog');
    expect(photoPageSource).toContain("pageSize: 10");
    expect(photoPageSource).toContain("success: '0'");
    expect(photoPageSource).toContain('handlePickupEntryAccessLog');
  });

  it('keeps visible operation feedback inside the customer pickup entry dialog', () => {
    expect(photoPageSource).toContain('最近操作');
    expect(photoPageSource).toContain('pickupEntryCopyState');
    expect(photoPageSource).toContain('pickupEntryCopyFeedbackText');
    expect(photoPageSource).toContain('copyPickupEntryText');
    expect(photoPageSource).toContain('尚未操作，本次打开入口后可复制取片码、H5 入口、客户说明或下载二维码。');
    expect(photoPageSource).toContain('暂无可下载二维码，请先配置正式 H5 入口或使用小程序话术。');
    expect(photoPageSource).toContain('可发给客户扫码取片');
    expect(photoPageSource).toContain('yy-pickup-copy-feedback');
  });
});
