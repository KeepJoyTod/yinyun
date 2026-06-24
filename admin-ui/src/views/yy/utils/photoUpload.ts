type SortableAsset = {
  sort?: number | string | null;
};

type UploadedAlbum = {
  id?: string | number;
  storeId?: string | number;
};

type UploadedOss = {
  fileName?: string;
  originalName?: string;
  url?: string;
};

type RecoverableUploadResult = {
  success: boolean;
  ossId?: string | number;
  ossKey?: string;
  fileUrl?: string;
  fileName?: string;
  thumbnailObjectKey?: string;
  originalName?: string;
  recoverable?: boolean;
};

type PhotoPickupPreflightInput = {
  baseUrl?: string;
  phone?: string;
  accessCode?: string;
  albumId?: string | number;
  assetId?: string | number;
  bareOssUrl?: string;
};

type RealOssEvidenceInput = PhotoPickupPreflightInput & {
  objectKey?: string;
  thumbnailObjectKey?: string;
  manualConfirm?: boolean;
};

export function resolveNextUploadSort(rows: SortableAsset[], fallbackTotal = 0) {
  const numericSorts = rows
    .map((item) => Number(item.sort))
    .filter((value) => Number.isFinite(value));
  if (!numericSorts.length) {
    return Number(fallbackTotal || 0);
  }
  return Math.max(...numericSorts) + 1;
}

export function buildAssetQueryForUploadedAlbum(albumId: string | number, pageSize = 10) {
  return {
    pageNum: 1,
    pageSize,
    storeId: undefined,
    albumId,
    fileName: '',
    isSelected: '',
    visible: ''
  };
}

export function buildPhotoAssetFormFromOss(album: UploadedAlbum, oss: UploadedOss, fallbackName: string, sort: number, ossId: string | number) {
  return {
    storeId: album.storeId || '',
    albumId: album.id || '',
    fileName: oss.originalName || fallbackName,
    fileUrl: oss.url || '',
    objectKey: oss.fileName || '',
    thumbnailObjectKey: '',
    sort,
    isSelected: '0',
    visible: '1',
    remark: `OSS ID: ${ossId}`
  };
}

export function buildRetryPhotoAssetFormFromUploadResult(album: UploadedAlbum, result: RecoverableUploadResult, sort: number) {
  const form = buildPhotoAssetFormFromOss(
    album,
    {
      fileName: result.ossKey,
      originalName: result.originalName || result.fileName,
      url: result.fileUrl
    },
    result.fileName || '未知文件',
    sort,
    result.ossId as string | number
  );
  form.thumbnailObjectKey = result.thumbnailObjectKey || '';
  return form;
}

export function isRecoverableUploadResult(result: RecoverableUploadResult) {
  return !result.success && Boolean(result.recoverable && result.ossId && result.ossKey && result.fileUrl);
}

export function stripSignedQuery(url?: string) {
  const text = String(url || '').trim();
  if (!text) {
    return '';
  }
  try {
    const parsed = new URL(text);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return text.split('?')[0].split('#')[0];
  }
}

export function isLikelyOssUrl(url?: string) {
  const text = stripSignedQuery(url).toLowerCase();
  return /^https?:\/\//.test(text) && (text.includes('.aliyuncs.com/') || text.includes('.aliyuncs.com.cn/') || text.includes('.oss-'));
}

export function resolveBareOssUrlFromUploadResult(result: RecoverableUploadResult) {
  const bareUrl = stripSignedQuery(result.fileUrl);
  return isLikelyOssUrl(bareUrl) ? bareUrl : '';
}

function quotePowerShell(value?: string | number) {
  const text = String(value ?? '').trim();
  return `"${text.replace(/"/g, '`"')}"`;
}

export function buildPhotoPickupPreflightCommand(input: PhotoPickupPreflightInput) {
  const parts = [
    '.\\tools\\yingyue-production-preflight.ps1',
    '-BaseUrl',
    quotePowerShell(input.baseUrl || 'https://api.evanshine.me'),
    '-Phone',
    quotePowerShell(input.phone || '<手机号>'),
    '-AccessCode',
    quotePowerShell(input.accessCode || '<取片码>'),
    '-AlbumId',
    quotePowerShell(input.albumId || '<相册ID>'),
    '-AssetId',
    quotePowerShell(input.assetId || '<底片ID>'),
  ];
  const bareOssUrl = stripSignedQuery(input.bareOssUrl);
  if (bareOssUrl) {
    parts.push('-BareOssUrl', quotePowerShell(bareOssUrl), '-VerifyBareOssBlocked');
  }
  return ['cd D:\\OtherProject\\CameraApp\\yingyue-cloud-repo', parts.join(' ')].join('\n');
}

export function buildRealOssEvidenceCommand(input: RealOssEvidenceInput) {
  const parts = [
    '.\\tools\\new-photo-pickup-real-oss-evidence.ps1',
    '-BaseUrl',
    quotePowerShell(input.baseUrl || 'https://api.evanshine.me'),
    '-Phone',
    quotePowerShell(input.phone || '<手机号>'),
    '-AccessCode',
    quotePowerShell(input.accessCode || '<取片码>'),
    '-AlbumId',
    quotePowerShell(input.albumId || '<相册ID>'),
    '-AssetId',
    quotePowerShell(input.assetId || '<底片ID>')
  ];
  const bareOssUrl = stripSignedQuery(input.bareOssUrl);
  if (bareOssUrl) {
    parts.push('-BareOssUrl', quotePowerShell(bareOssUrl));
  }
  const objectKey = String(input.objectKey || '').trim();
  if (objectKey) {
    parts.push('-ObjectKey', quotePowerShell(objectKey));
  }
  const thumbnailObjectKey = String(input.thumbnailObjectKey || '').trim();
  if (thumbnailObjectKey) {
    parts.push('-ThumbnailObjectKey', quotePowerShell(thumbnailObjectKey));
  }
  parts.push('-RunPreflight', '-RunLocalAcceptance');
  if (input.manualConfirm) {
    parts.push('-ConfirmH5Pickup', '-ConfirmWechatMiniapp', '-ConfirmDouyinMiniapp', '-ConfirmAdminAudit');
  }
  return ['cd D:\\OtherProject\\CameraApp\\yingyue-cloud-repo', parts.join(' ')].join('\n');
}
