import { describe, expect, it } from 'vitest';
import { buildAlbumOperationsSummary } from './photoOperationsHealth';

describe('photo operations health helpers', () => {
  it('flags albums that cannot be delivered to customers', () => {
    const summary = buildAlbumOperationsSummary(
      {
        id: '903001',
        albumName: '客户相册',
        customerPhone: '',
        accessCode: '',
        expireTime: '2099-01-01 00:00:00'
      },
      {
        totalAssets: 0,
        visibleAssets: 0,
        selectedAssets: 0,
        missingObjectKeyAssets: 0,
        recentFailure: undefined
      }
    );

    expect(summary.type).toBe('danger');
    expect(summary.label).toBe('需处理');
    expect(summary.issues).toEqual(['缺手机号', '缺取片码', '无可见照片']);
    expect(summary.nextAction).toBe('先补手机号、取片码并上传可见照片');
  });

  it('shows OSS object key and recent failure as troubleshooting issues', () => {
    const summary = buildAlbumOperationsSummary(
      {
        id: '903001',
        albumName: '客户相册',
        customerPhone: '13900001111',
        accessCode: 'PICK-001',
        expireTime: '2099-01-01 00:00:00'
      },
      {
        totalAssets: 3,
        visibleAssets: 2,
        selectedAssets: 1,
        missingObjectKeyAssets: 1,
        recentFailure: {
          action: 'PREVIEW',
          remark: 'OSS 对象不存在',
          createTime: '2026-06-09 10:00:00'
        }
      }
    );

    expect(summary.type).toBe('danger');
    expect(summary.label).toBe('需处理');
    expect(summary.issues).toEqual(['1 张缺 OSS Key', '最近访问失败']);
    expect(summary.assetText).toBe('照片 2/3，已选 1，缺Key 1');
    expect(summary.failureText).toBe('最近失败：预览，OSS 对象不存在');
    expect(summary.nextAction).toBe('检查底片 OSS Key 和最近失败访问日志');
  });

  it('summarizes albums that are ready to send', () => {
    const summary = buildAlbumOperationsSummary(
      {
        id: '903001',
        albumName: '客户相册',
        customerPhone: '13900001111',
        accessCode: 'PICK-001',
        expireTime: '2099-01-01 00:00:00'
      },
      {
        totalAssets: 2,
        visibleAssets: 2,
        selectedAssets: 0,
        missingObjectKeyAssets: 0,
        recentFailure: undefined
      }
    );

    expect(summary.type).toBe('success');
    expect(summary.label).toBe('可交付');
    expect(summary.issues).toEqual([]);
    expect(summary.phoneText).toBe('手机 13900001111');
    expect(summary.assetText).toBe('照片 2/2，已选 0，缺Key 0');
    expect(summary.nextAction).toBe('可复制取片入口发给客户');
  });

  it('blocks expired albums even when pickup data and photos are ready', () => {
    const summary = buildAlbumOperationsSummary(
      {
        id: '903001',
        albumName: '客户相册',
        customerPhone: '13900001111',
        accessCode: 'PICK-001',
        expireTime: '2020-01-01 00:00:00'
      },
      {
        totalAssets: 2,
        visibleAssets: 2,
        selectedAssets: 0,
        missingObjectKeyAssets: 0,
        recentFailure: undefined
      }
    );

    expect(summary.type).toBe('danger');
    expect(summary.label).toBe('需处理');
    expect(summary.issues).toEqual(['已过期']);
    expect(summary.nextAction).toBe('延长相册有效期后再发送给客户');
  });
});
