import { assertStaffCanBeDeleted, createStaffDraft, updateStaffDraft, type StaffDraftInput } from "@/domain/staff";
import { stores as fallbackStores } from "@/lib/camera-data";
import { prisma } from "@/lib/prisma";

export type StaffManagementRow = {
  id: string;
  storeId: string | null;
  storeName: string;
  name: string;
  phone: string;
  position: string;
  enabled: boolean;
  status: string;
  orderCount: number;
};

export type StaffStoreOption = {
  id: string;
  name: string;
};

function toStaffManagementRow(staff: {
  id: string;
  storeId: string | null;
  store: { name: string } | null;
  name: string;
  phone: string | null;
  position: string | null;
  enabled: boolean;
  _count: { orders: number };
}): StaffManagementRow {
  return {
    id: staff.id,
    storeId: staff.storeId,
    storeName: staff.store?.name ?? "未绑定门店",
    name: staff.name,
    phone: staff.phone ?? "-",
    position: staff.position ?? "-",
    enabled: staff.enabled,
    status: staff.enabled ? "在职" : "停用",
    orderCount: staff._count.orders
  };
}

function fallbackStaffRows(): StaffManagementRow[] {
  const firstStore = fallbackStores[0]?.name ?? "默认门店";
  const secondStore = fallbackStores[1]?.name ?? firstStore;

  return [
    {
      id: "fallback-staff-1",
      storeId: firstStore,
      storeName: firstStore,
      name: "张三",
      phone: "16620010001",
      position: "摄影师",
      enabled: true,
      status: "在职",
      orderCount: 0
    },
    {
      id: "fallback-staff-2",
      storeId: secondStore,
      storeName: secondStore,
      name: "李四",
      phone: "16620010002",
      position: "化妆师",
      enabled: true,
      status: "在职",
      orderCount: 0
    }
  ];
}

async function assertStoreBelongsToBrand(brandId: string, storeId: string | null | undefined) {
  if (!storeId) {
    return;
  }

  const store = await prisma.store.findFirst({
    where: { id: storeId, brandId },
    select: { id: true }
  });

  if (!store) {
    throw new Error("门店不存在");
  }
}

export async function getStaffManagementData(brandId: string) {
  try {
    const [staffRows, storeRows] = await Promise.all([
      prisma.staff.findMany({
        where: { brandId },
        include: {
          store: { select: { name: true } },
          _count: { select: { orders: true } }
        },
        orderBy: [{ enabled: "desc" }, { createdAt: "asc" }]
      }),
      prisma.store.findMany({
        where: { brandId, enabled: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return {
      staff: staffRows.map(toStaffManagementRow),
      stores: storeRows,
      source: "database" as const
    };
  } catch {
    return {
      staff: fallbackStaffRows(),
      stores: fallbackStores.map((store) => ({ id: store.name, name: store.name })),
      source: "fallback" as const
    };
  }
}

export async function createStaff(brandId: string, input: StaffDraftInput) {
  const draft = createStaffDraft(input);
  await assertStoreBelongsToBrand(brandId, draft.storeId);

  const staff = await prisma.staff.create({
    data: {
      brandId,
      ...draft
    },
    include: {
      store: { select: { name: true } },
      _count: { select: { orders: true } }
    }
  });

  return toStaffManagementRow(staff);
}

export async function updateStaff(brandId: string, id: string, input: StaffDraftInput) {
  const existing = await prisma.staff.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("员工不存在");
  }

  const draft = updateStaffDraft(input);
  await assertStoreBelongsToBrand(brandId, draft.storeId);

  const staff = await prisma.staff.update({
    where: { id },
    data: draft,
    include: {
      store: { select: { name: true } },
      _count: { select: { orders: true } }
    }
  });

  return toStaffManagementRow(staff);
}

export async function deleteStaff(brandId: string, id: string) {
  const existing = await prisma.staff.findFirst({
    where: { id, brandId },
    select: {
      id: true,
      _count: { select: { orders: true } }
    }
  });

  if (!existing) {
    throw new Error("员工不存在");
  }

  assertStaffCanBeDeleted({ orderCount: existing._count.orders });

  await prisma.staff.delete({ where: { id } });
}
