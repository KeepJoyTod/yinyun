import { describe, expect, it } from 'vitest';
import {
  buildAssetQueryForUploadedAlbum,
  buildPhotoPickupPreflightCommand,
  buildRealOssEvidenceCommand,
  buildPhotoAssetFormFromOss,
  buildRetryPhotoAssetFormFromUploadResult,
  isRecoverableUploadResult,
  isLikelyOssUrl,
  resolveBareOssUrlFromUploadResult,
  resolveNextUploadSort
} from './photoUpload';

describe('photo upload ui helpers', () => {
  it('uses max existing sort + 1 instead of current row count', () => {
    expect(resolveNextUploadSort([{ sort: 0 }, { sort: 1 }, { sort: 8 }], 3)).toBe(9);
  });

  it('falls back to total count when no numeric sort exists', () => {
    expect(resolveNextUploadSort([{ sort: undefined }, { sort: 'bad' }], 2)).toBe(2);
  });

  it('builds the asset query used after uploading photos to an album', () => {
    expect(buildAssetQueryForUploadedAlbum(903001, 20)).toMatchObject({
      pageNum: 1,
      pageSize: 20,
      albumId: 903001,
      storeId: undefined,
      fileName: '',
      isSelected: '',
      visible: ''
    });
  });

  it('builds the photo asset form from a persisted OSS record', () => {
    expect(
      buildPhotoAssetFormFromOss(
        { id: 903001, storeId: 1001 },
        { originalName: '客户成片.webp', fileName: 'i/2026/06/08/photo.webp', url: 'https://oss.example/photo.webp' },
        'fallback.webp',
        9,
        '2063'
      )
    ).toEqual({
      storeId: 1001,
      albumId: 903001,
      fileName: '客户成片.webp',
      fileUrl: 'https://oss.example/photo.webp',
      objectKey: 'i/2026/06/08/photo.webp',
      thumbnailObjectKey: '',
      sort: 9,
      isSelected: '0',
      visible: '1',
      remark: 'OSS ID: 2063'
    });
  });

  it('marks only OSS-persisted asset failures as recoverable', () => {
    expect(isRecoverableUploadResult({ success: false, recoverable: true, ossId: '1', ossKey: 'a.webp', fileUrl: 'https://oss/a.webp' })).toBe(true);
    expect(isRecoverableUploadResult({ success: false, recoverable: true, ossId: '1', ossKey: '', fileUrl: 'https://oss/a.webp' })).toBe(false);
    expect(isRecoverableUploadResult({ success: true, recoverable: true, ossId: '1', ossKey: 'a.webp', fileUrl: 'https://oss/a.webp' })).toBe(false);
  });

  it('preserves uploaded thumbnail key when retrying asset creation', () => {
    expect(
      buildRetryPhotoAssetFormFromUploadResult(
        { id: 903001, storeId: 1001 },
        {
          fileName: '客户成片.webp',
          success: false,
          message: '创建底片失败',
          ossKey: 'i/2026/06/08/photo.webp',
          ossId: '2063',
          fileUrl: 'https://oss.example/photo.webp',
          thumbnailObjectKey: 'i/2026/06/08/photo-thumb.webp',
          originalName: '客户成片.webp',
          sort: 10
        },
        10
      )
    ).toMatchObject({
      albumId: 903001,
      storeId: 1001,
      objectKey: 'i/2026/06/08/photo.webp',
      thumbnailObjectKey: 'i/2026/06/08/photo-thumb.webp',
      sort: 10,
      visible: '1'
    });
  });

  it('strips signed OSS query params before building production preflight commands', () => {
    const bareOssUrl = 'https://bucket.oss-cn-beijing.aliyuncs.com/i/2026/06/08/photo.webp';
    const command = buildPhotoPickupPreflightCommand({
      phone: '13900001111',
      accessCode: 'PREVIEW-20260608',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: `${bareOssUrl}?Expires=1800000000&OSSAccessKeyId=test&Signature=secret`
    });

    expect(command).toContain('yingyue-production-preflight.ps1');
    expect(command).toContain('-BareOssUrl');
    expect(command).toContain('-VerifyBareOssBlocked');
    expect(command).toContain(bareOssUrl);
    expect(command).toContain('13900001111');
    expect(command).toContain('PREVIEW-20260608');
    expect(command).not.toContain('Signature=');
    expect(command).not.toContain('OSSAccessKeyId=');
  });

  it('only uses likely OSS URLs for raw object blocking validation', () => {
    const signedOss = 'https://bucket.oss-cn-beijing.aliyuncs.com/i/photo.webp?Signature=secret';
    expect(isLikelyOssUrl(signedOss)).toBe(true);
    expect(resolveBareOssUrlFromUploadResult({ success: true, fileUrl: signedOss })).toBe('https://bucket.oss-cn-beijing.aliyuncs.com/i/photo.webp');
    expect(resolveBareOssUrlFromUploadResult({ success: true, fileUrl: 'https://api.evanshine.me/client/photo/assets/1/stream' })).toBe('');
  });

  it('builds a full real OSS evidence command when an album and asset are available', () => {
    const command = buildRealOssEvidenceCommand({
      baseUrl: 'https://api.evanshine.me',
      phone: '13900001111',
      accessCode: 'PREVIEW-20260608',
      albumId: '990202606080001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/i/2026/06/08/photo.webp?Signature=secret',
      objectKey: 'i/2026/06/08/photo.webp',
      thumbnailObjectKey: 'i/2026/06/08/photo-thumb.webp'
    });

    expect(command).toContain('new-photo-pickup-real-oss-evidence.ps1');
    expect(command).toContain('-RunPreflight');
    expect(command).toContain('-RunLocalAcceptance');
    expect(command).toContain('-ObjectKey "i/2026/06/08/photo.webp"');
    expect(command).toContain('-ThumbnailObjectKey "i/2026/06/08/photo-thumb.webp"');
    expect(command).toContain('https://bucket.oss-cn-beijing.aliyuncs.com/i/2026/06/08/photo.webp');
    expect(command).not.toContain('Signature=');
    expect(command).not.toContain('-ConfirmH5Pickup');
  });

  it('can build a final PASS real OSS evidence command after manual acceptance', () => {
    const command = buildRealOssEvidenceCommand({
      phone: '13900001111',
      accessCode: 'PREVIEW-20260608',
      albumId: '990202606080001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/i/2026/06/08/photo.webp',
      objectKey: 'i/2026/06/08/photo.webp',
      manualConfirm: true
    });

    expect(command).toContain('-ConfirmH5Pickup');
    expect(command).toContain('-ConfirmWechatMiniapp');
    expect(command).toContain('-ConfirmDouyinMiniapp');
    expect(command).toContain('-ConfirmAdminAudit');
  });
});
