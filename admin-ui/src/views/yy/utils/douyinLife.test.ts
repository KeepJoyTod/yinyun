import { describe, expect, it } from 'vitest';
import { autoSyncTagType, buildDouyinRecentSyncQuery, buildSyncResultMessage, formatDateTime, isSyncSuccess } from './douyinLife';

describe('douyinLife ui helpers', () => {
  it('builds recent sync query without single-order filters', () => {
    const query = buildDouyinRecentSyncQuery(
      7,
      {
        storeId: 7407304729216157722,
        accountId: 'account-1',
        orderId: 'single-order',
        outOrderNo: 'single-out',
        openId: 'open-1',
        orderStatus: 'PAY_SUCCESS',
        useTestDataHeader: true
      },
      new Date('2026-06-02T20:00:00')
    );

    expect(query).toMatchObject({
      storeId: 7407304729216157722,
      accountId: 'account-1',
      orderStatus: 'PAY_SUCCESS',
      startTime: '2026-05-26 20:00:00',
      endTime: '2026-06-02 20:00:00',
      pageSize: 50,
      useTestDataHeader: true
    });
    expect(query.orderId).toBeUndefined();
    expect(query.outOrderNo).toBeUndefined();
    expect(query.openId).toBeUndefined();
  });

  it('formats sync result message with logid and failure hint', () => {
    const message = buildSyncResultMessage({
      channelType: 'DOUYIN_LIFE',
      syncStatus: 'FAILED',
      total: 0,
      created: 0,
      updated: 0,
      failed: 1,
      lastLogId: 'log-1',
      message: '应用未获得该能力'
    });

    expect(message).toBe('应用未获得该能力：总数 0，新增 0，更新 0，失败 1，logid log-1');
    expect(isSyncSuccess({ channelType: 'DOUYIN_LIFE', syncStatus: 'PARTIAL', total: 2, created: 1, updated: 0, failed: 1 })).toBe(false);
    expect(isSyncSuccess({ channelType: 'DOUYIN_LIFE', syncStatus: 'SYNCED', total: 2, created: 1, updated: 1, failed: 0 })).toBe(true);
  });

  it('formats date time in backend expected shape', () => {
    expect(formatDateTime(new Date('2026-06-02T03:04:05'))).toBe('2026-06-02 03:04:05');
  });

  it('maps auto sync status to dashboard tag types', () => {
    expect(autoSyncTagType('SYNCED', true)).toBe('success');
    expect(autoSyncTagType('WAITING', false)).toBe('info');
    expect(autoSyncTagType('FAILED', false)).toBe('warning');
  });
});
