import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const orderPageSource = readFileSync(resolve(__dirname, '../order/index.vue'), 'utf-8');

describe('order page template contracts', () => {
  it('keeps the order operations overview on the first screen', () => {
    expect(orderPageSource).toContain('yy-order-overview');
    expect(orderPageSource).toContain('订单运营工作台');
    expect(orderPageSource).toContain('抖音同步');
    expect(orderPageSource).toContain('取片排障');
    expect(orderPageSource).toContain('orderPendingCount');
    expect(orderPageSource).toContain('orderActiveCount');
    expect(orderPageSource).toContain('orderCompletedCount');
    expect(orderPageSource).toContain('orderOverviewFilterSummary');
    expect(orderPageSource).toContain('orderOverviewDouyinText');
    expect(orderPageSource).toContain('orderOverviewPhotoText');
  });

  it('keeps a first-screen order delivery action guide for store operators', () => {
    expect(orderPageSource).toContain('yy-order-action-guide');
    expect(orderPageSource).toContain('交付处理顺序');
    expect(orderPageSource).toContain('先同步订单');
    expect(orderPageSource).toContain('再筛不可交付');
    expect(orderPageSource).toContain('最后发取片入口');
    expect(orderPageSource).toContain("syncDouyinOrders(1)");
    expect(orderPageSource).toContain('showPhotoDeliveryIssues');
    expect(orderPageSource).toContain('copyOrderPickupShareText');
    expect(orderPageSource).toContain('yy-order-action-step');
    expect(orderPageSource).toContain('yy-order-action-tip');
  });

  it('keeps photo troubleshooting entry on order rows and details', () => {
    expect(orderPageSource).toContain('取片排障');
    expect(orderPageSource).toContain('取片状态');
    expect(orderPageSource).toContain('photoAlbumCount');
    expect(orderPageSource).toContain('photoVisibleAssetCount');
    expect(orderPageSource).toContain('photoMissingObjectKeyCount');
    expect(orderPageSource).toContain('getPhotoStatusLabel');
    expect(orderPageSource).toContain('getPhotoStatusDescription');
    expect(orderPageSource).toContain('getPhotoStatusClass');
    expect(orderPageSource).toContain('buildPhotoStatusHint');
    expect(orderPageSource).toContain('可交付');
    expect(orderPageSource).toContain('待上传照片');
    expect(orderPageSource).toContain('缺 Key');
    expect(orderPageSource).toContain('待生成相册');
    expect(orderPageSource).toContain('缺手机号');
    expect(orderPageSource).toContain('handlePhotoTroubleshoot');
    expect(orderPageSource).toContain('buildPhotoTroubleshootHint');
    expect(orderPageSource).toContain('maskPhone');
    expect(orderPageSource).toContain('按订单查相册');
    expect(orderPageSource).toContain('按客户查访问审计');
    expect(orderPageSource).toContain('客片选片工作台');
    expect(orderPageSource).toContain('useRouter()');
    expect(orderPageSource).toContain('buildPhotoWorkbenchRoute');
    expect(orderPageSource).toContain("path: '/yy/photo'");
    expect(orderPageSource).toContain("tab: 'album' | 'accessLog'");
  });

  it('keeps undeliverable pickup filtering and direct photo action shortcuts', () => {
    expect(orderPageSource).toContain('只看不可交付');
    expect(orderPageSource).toContain('photoDeliveryIssueOnly');
    expect(orderPageSource).toContain('showPhotoDeliveryIssues');
    expect(orderPageSource).toContain('clearPhotoDeliveryIssues');
    expect(orderPageSource).toContain('isPhotoDeliveryIssueFilterActive');
    expect(orderPageSource).toContain('orderOverviewPhotoIssueText');
    expect(orderPageSource).toContain('跳相册');
    expect(orderPageSource).toContain('生成相册');
    expect(orderPageSource).toContain('生成/修复相册');
    expect(orderPageSource).toContain('repairYyOrderPhotoAlbumPlaceholder');
    expect(orderPageSource).toContain('repairPhotoAlbumPlaceholder');
    expect(orderPageSource).toContain("v-hasPermi=\"['yy:photoAlbum:add']\"");
    expect(orderPageSource).toContain('上传照片');
    expect(orderPageSource).toContain('复制取片说明');
    expect(orderPageSource).toContain('打开取片入口');
    expect(orderPageSource).toContain('copyOrderPickupShareText');
    expect(orderPageSource).toContain('sharingAlbumOrderId');
    expect(orderPageSource).toContain('buildPickupShareText');
    expect(orderPageSource).toContain('buildPickupChannelShareText');
    expect(orderPageSource).toContain('buildPickupH5EntryUrl');
    expect(orderPageSource).toContain('resolveAlbumPickupCode');
    expect(orderPageSource).toContain('openPhotoWorkbenchForUpload');
    expect(orderPageSource).toContain('intent,');
    expect(orderPageSource).toContain("buildPhotoWorkbenchRoute(row, 'album', 'upload')");
    expect(orderPageSource).toContain("buildPhotoWorkbenchRoute(row, 'album', 'pickup-entry')");
  });

  it('keeps channel status filters for all-channel order export', () => {
    expect(orderPageSource).toContain('外部状态');
    expect(orderPageSource).toContain('同步状态');
    expect(orderPageSource).toContain('queryParams.externalStatus');
    expect(orderPageSource).toContain('queryParams.syncStatus');
    expect(orderPageSource).toContain('syncStatusOptions');
    expect(orderPageSource).toContain('handleExport');
    expect(orderPageSource).toContain("proxy?.download('yy/order/export', buildQuery()");
  });

  it('keeps manual reschedule fields in the order editor', () => {
    expect(orderPageSource).toContain('预约库存');
    expect(orderPageSource).toContain('form.serviceGroupId');
    expect(orderPageSource).toContain('form.externalSkuId');
    expect(orderPageSource).toContain('form.slotDate');
    expect(orderPageSource).toContain('form.slotStartTime');
    expect(orderPageSource).toContain('form.slotEndTime');
    expect(orderPageSource).toContain('form.inventoryStatus');
    expect(orderPageSource).toContain('form.inventorySlotId');
    expect(orderPageSource).toContain('timeSelectRange');
  });

  it('accepts route query from Douyin Life entry page for sync-then-export work', () => {
    expect(orderPageSource).toContain('useRoute()');
    expect(orderPageSource).toContain('applyRouteQueryIntent');
    expect(orderPageSource).toContain('route.query.source');
    expect(orderPageSource).toContain('route.query.intent');
    expect(orderPageSource).toContain("queryParams.value.source = String(routeSource)");
    expect(orderPageSource).toContain("routeIntent === 'export'");
    expect(orderPageSource).toContain('已筛选抖音来客订单，可确认同步状态后点击导出。');
  });

  it('auto prepares an album before opening the upload shortcut', () => {
    expect(orderPageSource).toContain('uploadingAlbumOrderId');
    expect(orderPageSource).toContain('ensurePhotoAlbumPlaceholder');
    expect(orderPageSource).toContain('ensurePhotoAlbumPlaceholderForUpload');
    expect(orderPageSource).toContain('getPhotoAlbumCount(row) <= 0');
    expect(orderPageSource).toContain("await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在打开上传窗口。')");
    expect(orderPageSource).toContain("router.push(buildPhotoWorkbenchRoute(row, 'album', 'upload'))");
  });

  it('auto prepares an album before copying pickup share text', () => {
    expect(orderPageSource).toContain('ensurePhotoAlbumPlaceholderForShare');
    expect(orderPageSource).toContain("await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在复制取片说明。')");
    expect(orderPageSource).toContain('albums = await loadOrderPhotoAlbums(row)');
    expect(orderPageSource).toContain('客户取片说明已复制');
  });

  it('auto prepares an album before opening the pickup entry shortcut', () => {
    expect(orderPageSource).toContain('ensurePhotoAlbumPlaceholderForPickupEntry');
    expect(orderPageSource).toContain("await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在打开取片入口。')");
    expect(orderPageSource).toContain('openPhotoWorkbenchForPickupEntry');
    expect(orderPageSource).toContain("router.push(buildPhotoWorkbenchRoute(row, 'album', 'pickup-entry'))");
  });

  it('keeps channel-specific pickup share shortcuts on order rows and details', () => {
    expect(orderPageSource).toContain('copyOrderPickupChannelShareText');
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(scope.row, 'H5 网页')");
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(scope.row, '微信小程序')");
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(scope.row, '抖音小程序')");
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(detail, 'H5 网页')");
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(detail, '微信小程序')");
    expect(orderPageSource).toContain("copyOrderPickupChannelShareText(detail, '抖音小程序')");
    expect(orderPageSource).toContain('buildPickupChannelShareText(album, channelLabel, pickupEntryUrl.value)');
    expect(orderPageSource).toContain('客户话术已复制');
    expect(orderPageSource).toContain(':disabled="sharingAlbumOrderId === scope.row.id"');
    expect(orderPageSource).toContain(':disabled="sharingAlbumOrderId === detail.id"');
  });

  it('keeps a customer pickup copy shortcut in the order detail drawer', () => {
    expect(orderPageSource).toContain('yy-order-photo-actions');
    expect(orderPageSource).toContain('按订单查相册');
    expect(orderPageSource).toContain('@click="openPhotoWorkbenchForUpload(detail)"');
    expect(orderPageSource).toContain(':loading="uploadingAlbumOrderId === detail.id"');
    expect(orderPageSource).toContain('@click="openPhotoWorkbenchForPickupEntry(detail)"');
    expect(orderPageSource).toContain('按客户查访问审计');
    expect(orderPageSource).toContain('复制取片说明');
    expect(orderPageSource).toContain('@click="copyOrderPickupShareText(detail)"');
  });

  it('keeps the photo troubleshooting summary in the order detail drawer', () => {
    expect(orderPageSource).toContain('取片排障摘要');
    expect(orderPageSource).toContain('loadPhotoTroubleshootSummary');
    expect(orderPageSource).toContain('关联相册');
    expect(orderPageSource).toContain('可见照片');
    expect(orderPageSource).toContain('访问失败');
    expect(orderPageSource).toContain('下一步建议');
    expect(orderPageSource).toContain('buildPhotoTroubleshootDiagnosis');
    expect(orderPageSource).toContain('最近失败记录');
    expect(orderPageSource).toContain('listYyPhotoAlbum');
    expect(orderPageSource).toContain('listYyPhotoAlbumOperationsSummary');
    expect(orderPageSource).toContain('listYyPhotoAccessLog');
    expect(orderPageSource).toContain('sumAlbumOperationsSummaries');
  });
});
