export type PhotoAlbumStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AlbumDraftInput = {
  title?: string | null;
  description?: string | null;
  maxSelectCount?: number | null;
};

export type AlbumDraft = {
  title: string;
  description: string | null;
  maxSelectCount: number;
};

export type AssetDraftInput = {
  fileName?: string | null;
  url?: string | null;
  sortOrder?: number | null;
};

export type AssetDraft = {
  fileName: string;
  url: string;
  sortOrder: number;
};

export type SelectionDraftInput = {
  selectedAssetIds?: string[] | null;
  maxSelectCount: number;
  note?: string | null;
};

export type SelectionDraft = {
  selectedAssetIds: string[];
  note: string | null;
};

export type AlbumSummaryInput = {
  status: PhotoAlbumStatus;
  assets: Array<{ id: string }>;
  selections: Array<{ assetId: string }>;
};

const statusLabels: Record<PhotoAlbumStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档"
};

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function normalizePositiveInteger(value: number | null | undefined, fallback: number, message: string) {
  const normalized = value ?? fallback;
  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error(message);
  }
  return normalized;
}

export function createAlbumDraft(input: AlbumDraftInput): AlbumDraft {
  const title = normalizeOptionalText(input.title);
  if (!title) {
    throw new Error("请填写相册名称");
  }

  return {
    title,
    description: normalizeOptionalText(input.description),
    maxSelectCount: normalizePositiveInteger(input.maxSelectCount, 6, "最多选片数量必须大于 0")
  };
}

export function createAssetDraft(input: AssetDraftInput): AssetDraft {
  const url = normalizeOptionalText(input.url);
  if (!url) {
    throw new Error("请填写照片地址");
  }

  const fileName = normalizeOptionalText(input.fileName) ?? url.split(/[\\/]/).pop() ?? "未命名照片";
  const sortOrder = input.sortOrder ?? 0;
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("排序值不能小于 0");
  }

  return {
    fileName,
    url,
    sortOrder
  };
}

export function createSelectionDraft(input: SelectionDraftInput): SelectionDraft {
  const selectedAssetIds = [...new Set((input.selectedAssetIds ?? []).map((id) => normalizeOptionalText(id)).filter((id): id is string => Boolean(id)))];
  if (selectedAssetIds.length === 0) {
    throw new Error("请选择至少 1 张照片");
  }
  if (selectedAssetIds.length > input.maxSelectCount) {
    throw new Error(`最多选择 ${input.maxSelectCount} 张照片`);
  }

  return {
    selectedAssetIds,
    note: normalizeOptionalText(input.note)
  };
}

export function toggleSelectedAssetId(current: string[], assetId: string, maxSelectCount: number) {
  if (current.includes(assetId)) {
    return current.filter((id) => id !== assetId);
  }
  if (current.length >= maxSelectCount) {
    return current;
  }
  return [...current, assetId];
}

export function photoAlbumStatusLabel(status: PhotoAlbumStatus) {
  return statusLabels[status] ?? status;
}

export function buildAlbumSummary(input: AlbumSummaryInput) {
  const selectedIds = new Set(input.selections.map((selection) => selection.assetId));

  return {
    assetCount: input.assets.length,
    selectedCount: selectedIds.size,
    statusLabel: photoAlbumStatusLabel(input.status),
    progressLabel: `已选 ${selectedIds.size}/${input.assets.length}`
  };
}
