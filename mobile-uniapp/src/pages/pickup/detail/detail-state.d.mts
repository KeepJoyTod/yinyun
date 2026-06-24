import type { ClientPhotoAsset } from '@/types/clientPhoto';
import type { DetailPreviewLoadState } from '@/pages/pickup/preview/preview-state.mjs';

export type AssetFilterKey = 'all' | 'pending' | 'selected' | 'error';

export interface AssetFilterItem {
  key: AssetFilterKey;
  label: string;
  count: number;
}

export interface AssetFilterCounts {
  all: number;
  pending: number;
  selected: number;
  error: number;
}

export const ASSET_FILTERS: Array<Pick<AssetFilterItem, 'key' | 'label'>>;
export function getAssetFilterKey(
  asset: Partial<ClientPhotoAsset>,
  selectedAssetIds?: string[] | Set<string>,
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
): Exclude<AssetFilterKey, 'all'>;
export function countAssetsByFilter(
  assets?: Array<Partial<ClientPhotoAsset>>,
  selectedAssetIds?: string[] | Set<string>,
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
): AssetFilterCounts;
export function createAssetFilterItems(
  assets?: Array<Partial<ClientPhotoAsset>>,
  selectedAssetIds?: string[] | Set<string>,
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
): AssetFilterItem[];
export function filterAssetsByKey<T extends Partial<ClientPhotoAsset>>(
  assets?: T[],
  filterKey?: AssetFilterKey | string,
  selectedAssetIds?: string[] | Set<string>,
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
): T[];
export function getAssetFilterEmptyCopy(filterKey?: AssetFilterKey | string): string;
export function getSelectedSequence(
  asset: Partial<ClientPhotoAsset>,
  selectedAssetIds?: string[] | Set<string>,
): number;
export function getSelectionSummary(
  selectedCount?: number,
  totalCount?: number,
  submittedCount?: number,
  selectionStatus?: string,
): {
  title: string;
  subtitle: string;
  submitted: boolean;
  status: string;
};
export function formatSelectionSubmitTime(value?: string): string;
export function getSelectionTimelineCopy(selectionStatus?: string, lastSelectionSubmitTime?: string): string;
export function isSelectionLocked(selectionStatus?: string): boolean;
export function getSelectionActionState(
  selectionStatus?: string,
  selectedCount?: number,
  submitting?: boolean,
): {
  locked: boolean;
  disabled: boolean;
  label: string;
  toast: string;
};
export function getAssetTileActionState(
  asset: Partial<ClientPhotoAsset>,
  selectedAssetIds?: string[] | Set<string>,
  previewLoadMap?: Record<string, DetailPreviewLoadState>,
  selectionStatus?: string,
): {
  cornerLabel: string;
  previewLabel: string;
  actionLabel: string;
  showSequence: boolean;
  sequence: number;
  locked: boolean;
};
export function getSelectionGuideContent(selectionStatus?: string): {
  steps: string[];
  note: string;
};
export interface DeliveryNextStepInput {
  totalCount?: number;
  selectedCount?: number;
  submittedCount?: number;
  previewFailed?: number;
  selectionStatus?: string;
}
export interface DeliveryNextStep {
  tone: 'waiting' | 'ready' | 'submit' | 'submitted' | 'retouching' | 'delivered' | 'warning';
  title: string;
  subtitle: string;
  action: string;
}
export function getDeliveryNextStep(input?: DeliveryNextStepInput): DeliveryNextStep;

declare const detailState: {
  ASSET_FILTERS: typeof ASSET_FILTERS;
  getAssetFilterKey: typeof getAssetFilterKey;
  countAssetsByFilter: typeof countAssetsByFilter;
  createAssetFilterItems: typeof createAssetFilterItems;
  filterAssetsByKey: typeof filterAssetsByKey;
  getAssetFilterEmptyCopy: typeof getAssetFilterEmptyCopy;
  getSelectedSequence: typeof getSelectedSequence;
  getSelectionSummary: typeof getSelectionSummary;
  formatSelectionSubmitTime: typeof formatSelectionSubmitTime;
  getSelectionTimelineCopy: typeof getSelectionTimelineCopy;
  isSelectionLocked: typeof isSelectionLocked;
  getSelectionActionState: typeof getSelectionActionState;
  getAssetTileActionState: typeof getAssetTileActionState;
  getSelectionGuideContent: typeof getSelectionGuideContent;
  getDeliveryNextStep: typeof getDeliveryNextStep;
};

export default detailState;
