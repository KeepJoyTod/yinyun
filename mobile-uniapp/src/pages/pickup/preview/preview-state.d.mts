export interface PreviewState {
  previewUrl: string;
  imageLoaded: boolean;
  errorMessage: string;
}

export type DetailPreviewLoadState = 'waiting' | 'loading' | 'ready' | 'loaded' | 'error';

export const DEFAULT_ERROR_MESSAGE: string;
export const PREVIEW_ERROR_HELP_TEXT: string;
export function initPreviewState(): PreviewState;
export function applyPreviewImageLoad(state: PreviewState): PreviewState;
export function applyPreviewImageError(state: PreviewState, message?: string): PreviewState;
export function resetPreviewImageState(state: PreviewState): PreviewState;
export function canDownloadPreview(options: {
  assetId?: string;
  previewUrl?: string;
  imageLoaded?: boolean;
  loading?: boolean;
  downloading?: boolean;
}): boolean;
export function applyDetailPreviewError<T extends Record<string, DetailPreviewLoadState>>(
  state: {
    previewLoadMap: T;
    previewErrorMap: Record<string, string>;
  },
  assetKey: string,
  message?: string,
): {
  previewLoadMap: T & Record<string, 'error'>;
  previewErrorMap: Record<string, string>;
};
export function createBatchesByPriority<T>(
  items: T[],
  options?: {
    firstBatchSize?: number;
    batchSize?: number;
  },
): T[][];
export function createDetailPreviewSigningBatches<T>(
  assets: T[],
  options?: {
    firstBatchSize?: number;
    batchSize?: number;
  },
): T[][];
export function createAlbumCoverSigningBatches<T>(
  albums: T[],
  options?: {
    firstBatchSize?: number;
    batchSize?: number;
  },
): T[][];
export function getDetailPreviewProgress<T extends { assetId?: string | number }>(
  assets: T[],
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
): {
  total: number;
  prepared: number;
  failed: number;
  loading: number;
  waiting: number;
};
export function getPreviewBackUrl(albumId?: string): string;
export function getPreviewErrorHelpText(errorMessage?: string): string;
export function getDownloadFailureFeedback(
  errorMessage?: string,
  options?: {
    action?: 'download' | 'save';
  },
): {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  help: string;
  shouldOpenSetting: boolean;
  shouldReauth: boolean;
};

declare const previewState: {
  DEFAULT_ERROR_MESSAGE: typeof DEFAULT_ERROR_MESSAGE;
  PREVIEW_ERROR_HELP_TEXT: typeof PREVIEW_ERROR_HELP_TEXT;
  initPreviewState: typeof initPreviewState;
  applyPreviewImageLoad: typeof applyPreviewImageLoad;
  applyPreviewImageError: typeof applyPreviewImageError;
  resetPreviewImageState: typeof resetPreviewImageState;
  canDownloadPreview: typeof canDownloadPreview;
  applyDetailPreviewError: typeof applyDetailPreviewError;
  createBatchesByPriority: typeof createBatchesByPriority;
  createDetailPreviewSigningBatches: typeof createDetailPreviewSigningBatches;
  createAlbumCoverSigningBatches: typeof createAlbumCoverSigningBatches;
  getDetailPreviewProgress: typeof getDetailPreviewProgress;
  getPreviewBackUrl: typeof getPreviewBackUrl;
  getPreviewErrorHelpText: typeof getPreviewErrorHelpText;
  getDownloadFailureFeedback: typeof getDownloadFailureFeedback;
};

export default previewState;
