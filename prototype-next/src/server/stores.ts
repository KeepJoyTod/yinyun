import { assertStoreCanBeDeleted, buildStoreBusinessMetrics, createStoreDraft, updateStoreDraft, type StoreDraftInput } from "@/domain/store";
import { stores as fallbackStores } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

export type StoreManagementRow = {
  id: string;
  name: string;
  status: string;
  staff: number;
  slots: string;
  monthOrderCount: number;
  waitingServiceCount: number;
  phone: string;
  address: string;
  enabled: boolean;
};

function toStoreManagementRow(store: {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  enabled: boolean;
  orders?: Array<{ status: "PENDING_CONFIRM" | "WAITING_SERVICE" | "IN_SERVICE" | "COMPLETED" | "CANCELLED"; scheduledAt: Date }>;
  _count: { staff: number; slots: number; orders: number };
}): StoreManagementRow {
  const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const business = buildStoreBusinessMetrics(store.orders ?? [], month);

  return {
    id: store.id,
    name: store.name,
    status: store.enabled ? "正常" : "停用",
    staff: store._count.staff,
    slots: `${store._count.orders}/${store._count.slots}`,
    monthOrderCount: business.monthOrderCount || store._count.orders,
    waitingServiceCount: business.waitingServiceCount,
    phone: store.phone ?? "-",
    address: store.address ?? "-",
    enabled: store.enabled
  };
}

function fallbackRows(): StoreManagementRow[] {
  return fallbackStores.map((store) => ({
    id: store.name,
    name: store.name,
    status: store.status,
    staff: store.staff,
    slots: store.slots,
    monthOrderCount: Number(store.slots.split("/")[0]) || 0,
    waitingServiceCount: 0,
    phone: store.phone,
    address: "-",
    enabled: store.status === "正常"
  }));
}

export async function getStoreManagementData(brandId: string) {
  try {
    const rows = await prisma.store.findMany({
      where: { brandId },
      include: {
        _count: {
          select: {
            staff: true,
            slots: true,
            orders: true
          }
        },
        orders: { select: { status: true, scheduledAt: true } }
      },
      orderBy: [{ enabled: "desc" }, { createdAt: "asc" }]
    });

    return {
      stores: rows.map(toStoreManagementRow),
      source: "database" as const
    };
  } catch {
    return {
      stores: fallbackRows(),
      source: "fallback" as const
    };
  }
}

export async function createStore(brandId: string, input: StoreDraftInput) {
  const draft = createStoreDraft(input);
  const store = await prisma.store.create({
    data: {
      brandId,
      ...draft
    },
    include: {
      _count: { select: { staff: true, slots: true, orders: true } }
    }
  });

  return toStoreManagementRow(store);
}

export async function updateStore(brandId: string, id: string, input: StoreDraftInput) {
  const existing = await prisma.store.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("门店不存在");
  }

  const store = await prisma.store.update({
    where: { id },
    data: updateStoreDraft(input),
    include: {
      _count: { select: { staff: true, slots: true, orders: true } }
    }
  });

  return toStoreManagementRow(store);
}

export async function deleteStore(brandId: string, id: string) {
  const existing = await prisma.store.findFirst({
    where: { id, brandId },
    select: {
      id: true,
      _count: { select: { orders: true } }
    }
  });

  if (!existing) {
    throw new Error("门店不存在");
  }

  assertStoreCanBeDeleted({ orderCount: existing._count.orders });

  await prisma.store.delete({ where: { id } });
}
