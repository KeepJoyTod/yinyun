import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lifePageSource = readFileSync(resolve(__dirname, '../channel/life/index.vue'), 'utf-8');

describe('douyin life page template contracts', () => {
  it('keeps real order entry configuration for Douyin Life products', () => {
    expect(lifePageSource).toContain('真实下单入口配置');
    expect(lifePageSource).toContain('DOUYIN_LIFE');
    expect(lifePageSource).toContain('externalProductId');
    expect(lifePageSource).toContain('externalSkuId');
    expect(lifePageSource).toContain('externalPoiId');
    expect(lifePageSource).toContain('landingUrl');
    expect(lifePageSource).toContain('landingPath');
    expect(lifePageSource).toContain('copyLifeEntry');
    expect(lifePageSource).toContain('listYyChannelProductMapping');
  });

  it('keeps the real-order operation guide separated from miniapp tt.pay', () => {
    expect(lifePageSource).toContain('yy-life-order-guide');
    expect(lifePageSource).toContain('P0：来客商品页支付');
    expect(lifePageSource).toContain('先同步后导出');
    expect(lifePageSource).toContain('P1：小程序 tt.pay');
    expect(lifePageSource).toContain('openDouyinLifeOrders');
    expect(lifePageSource).toContain('openAllChannelExport');
    expect(lifePageSource).toContain("path: '/yy/order'");
    expect(lifePageSource).toContain("source: 'DOUYIN_LIFE'");
    expect(lifePageSource).toContain('DOUYIN_MINI_APP');
  });

  it('shows webhook inbox health and retry operations for production diagnosis', () => {
    expect(lifePageSource).toContain('订单同步健康');
    expect(lifePageSource).toContain('事件收件箱');
    expect(lifePageSource).toContain('getYyChannelSyncHealth');
    expect(lifePageSource).toContain('listYyChannelEventInbox');
    expect(lifePageSource).toContain('retryYyChannelEventInbox');
    expect(lifePageSource).toContain('retryInboxEvent');
  });
});
