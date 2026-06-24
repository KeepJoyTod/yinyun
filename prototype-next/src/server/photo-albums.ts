import type { PhotoAlbumStatus } from "@prisma/client";
import { buildAlbumSummary, createAlbumDraft, createAssetDraft, createSelectionDraft, photoAlbumStatusLabel, type AlbumDraftInput, type AssetDraftInput } from "@/domain/photo-selection";
import { orderRows } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

export type PhotoAlbumCustomerOption = {
  id: string;
  name: string;
  phone: string;
};

export type PhotoAlbumOrderOption = {
  id: string;
  orderNo: string;
  customerName: string;
};

export type PhotoAssetRow = {
  id: string;
  fileName: string;
  url: string;
  sortOrder: number;
  selected: boolean;
};

export type PhotoAlbumRow = {
  id: string;
  customerId: string | null;
  orderId: string | null;
  customerName: string;
  orderNo: string;
  title: string;
  description: string;
  status: PhotoAlbumStatus;
  statusLabel: string;
  maxSelectCount: number;
  shareToken: string;
  sharePath: string;
  assetCount: number;
  selectedCount: number;
  progressLabel: string;
  assets: PhotoAssetRow[];
  selectedAssetIds: string[];
  selectionNote: string;
  createdAt: string;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

function fallbackPhotoAlbums() {
  const albums: PhotoAlbumRow[] = orderRows.slice(0, 2).map((order, index) => ({
    id: `fallback-album-${index}`,
    customerId: null,
    orderId: null,
    customerName: order.customer,
    orderNo: order.no,
    title: `${order.customer} 客片选片`,
    description: "演示相册，连接数据库后可维护真实照片。",
    status: "PUBLISHED" as PhotoAlbumStatus,
    statusLabel: "已发布",
    maxSelectCount: 3,
    shareToken: `fallback-share-${index}`,
    sharePath: `/photo-albums/share/fallback-share-${index}`,
    assetCount: 2,
    selectedCount: index,
    progressLabel: `已选 ${index}/2`,
    assets: [
      { id: `fallback-asset-${index}-1`, fileName: "demo-1.jpg", url: "/placeholder-photo.svg", sortOrder: 0, selected: index > 0 },
      { id: `fallback-asset-${index}-2`, fileName: "demo-2.jpg", url: "/placeholder-photo.svg", sortOrder: 1, selected: false }
    ],
    selectedAssetIds: index > 0 ? [`fallback-asset-${index}-1`] : [],
    selectionNote: "",
    createdAt: "演示数据"
  }));

  return {
    albums,
    customers: [],
    orders: [],
    source: "fallback" as const
  };
}

function toAlbumRow(album: {
  id: string;
  customerId: string | null;
  orderId: string | null;
  title: string;
  description: string | null;
  status: PhotoAlbumStatus;
  maxSelectCount: number;
  shareToken: string;
  createdAt: Date;
  customer: { name: string; phone: string } | null;
  order: { orderNo: string } | null;
  assets: Array<{ id: string; fileName: string; url: string; sortOrder: number }>;
  selections: Array<{ assetId: string; note: string | null }>;
}): PhotoAlbumRow {
  const summary = buildAlbumSummary({
    status: album.status,
    assets: album.assets,
    selections: album.selections
  });
  const selectedAssetIds = album.selections.map((selection) => selection.assetId);
  const selectionNote = album.selections.find((selection) => selection.note)?.note ?? "";
  const selectedSet = new Set(selectedAssetIds);

  return {
    id: album.id,
    customerId: album.customerId,
    orderId: album.orderId,
    customerName: album.customer?.name ?? "-",
    orderNo: album.order?.orderNo ?? "-",
    title: album.title,
    description: album.description ?? "",
    status: album.status,
    statusLabel: photoAlbumStatusLabel(album.status),
    maxSelectCount: album.maxSelectCount,
    shareToken: album.shareToken,
    sharePath: `/photo-albums/share/${album.shareToken}`,
    assetCount: summary.assetCount,
    selectedCount: summary.selectedCount,
    progressLabel: summary.progressLabel,
    assets: album.assets.map((asset) => ({
      ...asset,
      selected: selectedSet.has(asset.id)
    })),
    selectedAssetIds,
    selectionNote,
    createdAt: formatDate(album.createdAt)
  };
}

async function assertCustomerBelongsToBrand(brandId: string, customerId?: string | null) {
  if (!customerId) {
    return;
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, brandId },
    select: { id: true }
  });

  if (!customer) {
    throw new Error("客户不存在");
  }
}

async function assertOrderBelongsToBrand(brandId: string, orderId?: string | null) {
  if (!orderId) {
    return;
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, brandId },
    select: { id: true }
  });

  if (!order) {
    throw new Error("订单不存在");
  }
}

async function getAlbumForBrand(brandId: string, albumId: string) {
  const album = await prisma.photoAlbum.findFirst({
    where: { id: albumId, brandId },
    include: {
      customer: { select: { name: true, phone: true } },
      order: { select: { orderNo: true } },
      assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      selections: true
    }
  });

  if (!album) {
    throw new Error("相册不存在");
  }

  return album;
}

export async function getPhotoAlbumManagementData(brandId: string) {
  try {
    const [albums, customers, orders] = await Promise.all([
      prisma.photoAlbum.findMany({
        where: { brandId },
        include: {
          customer: { select: { name: true, phone: true } },
          order: { select: { orderNo: true } },
          assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
          selections: true
        },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      prisma.customer.findMany({
        where: { brandId },
        select: { id: true, name: true, phone: true },
        orderBy: { updatedAt: "desc" },
        take: 100
      }),
      prisma.order.findMany({
        where: { brandId },
        include: { customer: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
        take: 100
      })
    ]);

    return {
      albums: albums.map(toAlbumRow),
      customers,
      orders: orders.map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        customerName: order.customer.name
      })),
      source: "database" as const
    };
  } catch {
    return fallbackPhotoAlbums();
  }
}

export async function getPublicPhotoAlbum(token: string) {
  const album = await prisma.photoAlbum.findUnique({
    where: { shareToken: token },
    include: {
      customer: { select: { name: true, phone: true } },
      order: { select: { orderNo: true } },
      assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      selections: true
    }
  });

  if (!album || album.status !== "PUBLISHED") {
    return null;
  }

  return toAlbumRow(album);
}

export async function submitPublicPhotoSelection(
  token: string,
  input: {
    selectedAssetIds?: string[] | null;
    note?: string | null;
  }
) {
  const album = await prisma.photoAlbum.findUnique({
    where: { shareToken: token },
    include: {
      assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      selections: true
    }
  });

  if (!album || album.status !== "PUBLISHED") {
    throw new Error("相册不存在或未发布");
  }

  return submitPhotoSelection(album.brandId, album.id, input);
}

export async function createPhotoAlbum(
  brandId: string,
  input: AlbumDraftInput & {
    customerId?: string | null;
    orderId?: string | null;
  }
) {
  const draft = createAlbumDraft(input);
  await assertCustomerBelongsToBrand(brandId, input.customerId);
  await assertOrderBelongsToBrand(brandId, input.orderId);

  const album = await prisma.photoAlbum.create({
    data: {
      brandId,
      customerId: input.customerId || null,
      orderId: input.orderId || null,
      ...draft
    },
    include: {
      customer: { select: { name: true, phone: true } },
      order: { select: { orderNo: true } },
      assets: true,
      selections: true
    }
  });

  return toAlbumRow(album);
}

export async function updatePhotoAlbumStatus(brandId: string, id: string, status: PhotoAlbumStatus) {
  await getAlbumForBrand(brandId, id);
  const album = await prisma.photoAlbum.update({
    where: { id },
    data: { status },
    include: {
      customer: { select: { name: true, phone: true } },
      order: { select: { orderNo: true } },
      assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      selections: true
    }
  });

  return toAlbumRow(album);
}

export async function addPhotoAsset(brandId: string, albumId: string, input: AssetDraftInput) {
  await getAlbumForBrand(brandId, albumId);
  const draft = createAssetDraft(input);
  await prisma.photoAsset.create({
    data: {
      brandId,
      albumId,
      ...draft
    }
  });

  return toAlbumRow(await getAlbumForBrand(brandId, albumId));
}

export async function submitPhotoSelection(
  brandId: string,
  albumId: string,
  input: {
    selectedAssetIds?: string[] | null;
    note?: string | null;
  }
) {
  const album = await getAlbumForBrand(brandId, albumId);
  const draft = createSelectionDraft({
    selectedAssetIds: input.selectedAssetIds,
    maxSelectCount: album.maxSelectCount,
    note: input.note
  });
  const albumAssetIds = new Set(album.assets.map((asset) => asset.id));
  const invalid = draft.selectedAssetIds.find((assetId) => !albumAssetIds.has(assetId));
  if (invalid) {
    throw new Error("选片照片不属于当前相册");
  }

  await prisma.$transaction([
    prisma.photoSelection.deleteMany({ where: { brandId, albumId } }),
    ...draft.selectedAssetIds.map((assetId) =>
      prisma.photoSelection.create({
        data: {
          brandId,
          albumId,
          assetId,
          customerId: album.customerId,
          note: draft.note
        }
      })
    )
  ]);

  return toAlbumRow(await getAlbumForBrand(brandId, albumId));
}
