import { describe, expect, it } from 'vitest';
import {
  buildPickupChannelShareText,
  buildPickupH5EntryUrl,
  buildPickupPlatformEntryTips,
  buildPickupQrImageDataUrl,
  buildPickupQrState,
  buildPickupShareText,
  buildPickupSmokeCommand,
  getPickupDeliveryHealth,
  resolveAlbumPickupCode
} from './photoPickupEntry';

describe('photo pickup entry helpers', () => {
  it('prefers accessCode and falls back to publicToken', () => {
    expect(resolveAlbumPickupCode({ accessCode: 'PICK-A', publicToken: 'TOKEN-A' })).toBe('PICK-A');
    expect(resolveAlbumPickupCode({ publicToken: 'TOKEN-A' })).toBe('TOKEN-A');
  });

  it('builds the uni-app H5 login route from a base url', () => {
    expect(buildPickupH5EntryUrl('https://photo.example.com')).toBe('https://photo.example.com/#/pages/pickup/login/index');
    expect(buildPickupH5EntryUrl('https://photo.example.com/#/pages/pickup/login/index')).toBe('https://photo.example.com/#/pages/pickup/login/index');
    expect(buildPickupH5EntryUrl('')).toBe('');
  });

  it('builds customer-facing share copy without exposing backend details', () => {
    const text = buildPickupShareText(
      {
        albumName: '陈女士证件照',
        customerName: '陈女士',
        customerPhone: '13900001111',
        accessCode: 'PICK-001',
        expireTime: '2026-06-30 23:59:59'
      },
      'https://photo.example.com/#/pages/pickup/login/index'
    );

    expect(text).toContain('影约云客户取片');
    expect(text).toContain('取片码：PICK-001');
    expect(text).toContain('微信小程序：打开影约云客户取片页');
    expect(text).toContain('抖音小程序：打开影约云客户取片页');
    expect(text).toContain('照片仅对当前客户开放');
    expect(text).not.toContain('/dev-api');
    expect(text).not.toContain('OSS');
  });

  it('builds channel-specific share copy for H5, WeChat and Douyin operators', () => {
    const album = {
      albumName: '陈女士证件照',
      customerPhone: '13900001111',
      accessCode: 'PICK-001',
      expireTime: '2026-06-30 23:59:59'
    };
    const entryUrl = 'https://photo.example.com/#/pages/pickup/login/index';

    const h5Text = buildPickupChannelShareText(album, 'H5 网页', entryUrl);
    expect(h5Text).toContain('请打开以下 H5 取片链接');
    expect(h5Text).toContain(entryUrl);
    expect(h5Text).toContain('取片码：PICK-001');

    const wechatText = buildPickupChannelShareText(album, '微信小程序', entryUrl);
    expect(wechatText).toContain('请在微信小程序打开「影约云客户取片」');
    expect(wechatText).toContain('手机号：13900001111');
    expect(wechatText).not.toContain(entryUrl);

    const douyinText = buildPickupChannelShareText(album, '抖音小程序', entryUrl);
    expect(douyinText).toContain('请在抖音小程序打开「影约云客户取片」');
    expect(douyinText).not.toContain('/dev-api');
    expect(douyinText).not.toContain('oss-cn-');
  });

  it('builds a copyable album-level smoke command for operators', () => {
    const command = buildPickupSmokeCommand({
      baseUrl: 'https://api.evanshine.me',
      phone: '13900001111',
      accessCode: 'PREVIEW-20260608',
      albumId: '903001'
    });

    expect(command).toContain('photo-pickup-smoke.ps1');
    expect(command).toContain('-BaseUrl "https://api.evanshine.me"');
    expect(command).toContain('-Phone "13900001111"');
    expect(command).toContain('-AccessCode "PREVIEW-20260608"');
    expect(command).toContain('-AlbumId "903001"');
    expect(command).not.toContain('client_token');
    expect(command).not.toContain('oss-cn-beijing');
  });

  it('marks album-level smoke commands as empty-album probes when requested', () => {
    const command = buildPickupSmokeCommand({
      baseUrl: 'https://api.evanshine.me',
      phone: '13900001111',
      accessCode: 'PREVIEW-20260608',
      albumId: '903001',
      allowEmptyAlbum: true
    });

    expect(command).toContain('-AlbumId "903001"');
    expect(command).toContain('-AllowEmptyAlbum');
    expect(command).not.toContain('client_token');
  });

  it('does not add empty-album allowance for normal album smoke commands', () => {
    const command = buildPickupSmokeCommand({
      baseUrl: 'https://api.evanshine.me',
      phone: '13800003333',
      accessCode: 'PICK-202606-001',
      albumId: '903002'
    });

    expect(command).not.toContain('-AllowEmptyAlbum');
  });

  it('builds platform entry tips for H5, WeChat and Douyin without backend addresses', () => {
    const tips = buildPickupPlatformEntryTips('https://photo.example.com/#/pages/pickup/login/index');

    expect(tips).toEqual([
      {
        label: 'H5 网页',
        value: 'https://photo.example.com/#/pages/pickup/login/index',
        available: true,
        copyable: true
      },
      {
        label: '微信小程序',
        value: '打开影约云客户取片页，输入手机号和取片码',
        available: true,
        copyable: false
      },
      {
        label: '抖音小程序',
        value: '打开影约云客户取片页，输入手机号和取片码',
        available: true,
        copyable: false
      }
    ]);

    const fallbackTips = buildPickupPlatformEntryTips('/dev-api/client/photo/albums');
    expect(fallbackTips[0]).toMatchObject({
      label: 'H5 网页',
      available: false,
      copyable: false
    });
    expect(fallbackTips[0].value).not.toContain('/dev-api');
  });

  it('builds a scannable H5 QR state only when a customer entry url exists', () => {
    expect(buildPickupQrState('https://photo.example.com/#/pages/pickup/login/index')).toEqual({
      available: true,
      value: 'https://photo.example.com/#/pages/pickup/login/index',
      title: '扫码进入 H5 取片',
      description: '客户扫码后输入手机号和取片码查看相册。'
    });

    expect(buildPickupQrState('')).toEqual({
      available: false,
      value: '',
      title: '暂未配置 H5 二维码',
      description: '可先复制取片码，引导客户从微信/抖音小程序进入客户取片页。'
    });
  });

  it('does not allow backend or oss addresses as QR targets', () => {
    expect(buildPickupQrState('/dev-api/client/photo/albums').available).toBe(false);
    expect(buildPickupQrState('https://bucket.oss-cn-beijing.aliyuncs.com/private-photo.jpg').available).toBe(false);
  });

  it('generates a real QR image data url for a safe H5 entry', async () => {
    const dataUrl = await buildPickupQrImageDataUrl('https://photo.example.com/#/pages/pickup/login/index');

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(1000);
    expect(await buildPickupQrImageDataUrl('/dev-api/client/photo/albums')).toBe('');
  });

  it('summarizes pickup delivery health for album operations', () => {
    expect(getPickupDeliveryHealth({ accessCode: '', expireTime: '2099-01-01 00:00:00' })).toEqual({
      type: 'danger',
      label: '缺取片码',
      description: '客户无法登录取片，请先补充客户取片码。'
    });

    expect(getPickupDeliveryHealth({ accessCode: 'PICK-OK', expireTime: '2000-01-01 00:00:00' })).toEqual({
      type: 'danger',
      label: '已过期',
      description: '客户入口已过有效期，发送前请延长有效期。'
    });

    expect(getPickupDeliveryHealth({ accessCode: 'PICK-OK', expireTime: '2099-01-01 00:00:00' })).toEqual({
      type: 'success',
      label: '可发送',
      description: '取片码和有效期可用，可复制客户说明。'
    });
  });
});
