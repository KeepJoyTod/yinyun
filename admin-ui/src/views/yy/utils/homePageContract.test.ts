import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const homePageSource = readFileSync(resolve(__dirname, '../../index.vue'), 'utf-8');

describe('home page navigation contracts', () => {
  it('keeps internal workbench entries inside vue-router', () => {
    expect(homePageSource).toContain('const router = useRouter()');
    expect(homePageSource).toContain('router.push(target)');
    expect(homePageSource).toContain("goTarget('/yy/order')");
    expect(homePageSource).toContain('查看订单');
    expect(homePageSource).toContain('进入订单');
    expect(homePageSource).not.toContain("window.open(url, '__blank')");
  });

  it('keeps external links opening in a safe new tab only when needed', () => {
    expect(homePageSource).toContain('/^https?:\\/\\//i.test(target)');
    expect(homePageSource).toContain("window.open(target, '_blank', 'noopener,noreferrer')");
  });

  it('keeps the home page tied to real douyin life operations', () => {
    expect(homePageSource).toContain("getYyChannelAutoSyncStatus('DOUYIN_LIFE')");
    expect(homePageSource).toContain("syncYyChannelOrders('DOUYIN_LIFE'");
    expect(homePageSource).toContain("listYyOrder({ pageNum: 1, pageSize: 6, source: 'DOUYIN_LIFE' }");
    expect(homePageSource).toContain("inventoryStatus: 'CONFLICT'");
    expect(homePageSource).toContain("photoDeliveryIssueOnly: '1'");
    expect(homePageSource).toContain('最近同步订单');
    expect(homePageSource).toContain('异常处理入口');
    expect(homePageSource).not.toContain('今日待办队列');
  });
});
