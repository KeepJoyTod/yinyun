import { prisma } from "@/lib/prisma";

export async function getBookingOptions() {
  const brand = await prisma.brand.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      stores: {
        where: { enabled: true },
        orderBy: { createdAt: "asc" }
      },
      serviceGroups: {
        where: { enabled: true },
        orderBy: { createdAt: "asc" }
      },
      products: {
        where: { enabled: true },
        orderBy: { createdAt: "asc" }
      },
      slots: {
        where: {
          startsAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        include: {
          orders: {
            select: { status: true }
          }
        },
        orderBy: { startsAt: "asc" }
      }
    }
  });

  if (!brand) {
    return null;
  }

  return {
    brand: {
      id: brand.id,
      name: brand.name
    },
    stores: brand.stores.map((store) => ({
      id: store.id,
      name: store.name
    })),
    serviceGroups: brand.serviceGroups.map((group) => ({
      id: group.id,
      name: group.name,
      slotMinutes: group.slotMinutes,
      capacityPerSlot: group.capacityPerSlot
    })),
    products: brand.products.map((product) => ({
      id: product.id,
      serviceGroupId: product.serviceGroupId,
      name: product.name,
      priceCents: product.priceCents,
      type: product.type
    })),
    slots: brand.slots.map((slot) => ({
      id: slot.id,
      storeId: slot.storeId,
      serviceGroupId: slot.serviceGroupId,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      capacity: slot.capacity,
      bookedCount: slot.orders.filter((order) => order.status !== "CANCELLED").length
    }))
  };
}
