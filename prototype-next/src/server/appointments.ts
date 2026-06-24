import { z } from "zod";
import { calculateSlotAvailability } from "@/domain/booking";
import { createAppointmentDraft } from "@/domain/appointment";
import { prisma } from "@/lib/prisma";

export const createAppointmentSchema = z.object({
  brandId: z.string().min(1),
  storeId: z.string().min(1),
  serviceGroupId: z.string().min(1),
  slotId: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(6),
  productIds: z.array(z.string().min(1)).min(1),
  source: z.enum(["WALK_IN", "ONLINE", "DOUYIN", "MEITUAN", "PHONE"]).optional(),
  bookingMethod: z.enum(["ONLINE", "STORE", "PHONE"]).optional(),
  remark: z.string().optional()
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export async function createAppointment(input: CreateAppointmentInput) {
  const data = createAppointmentSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const slot = await tx.appointmentSlot.findUnique({
      where: { id: data.slotId },
      include: {
        orders: {
          select: { status: true }
        }
      }
    });

    if (!slot) {
      throw new Error("预约时段不存在");
    }

    const bookedCount = slot.orders.filter((order) => order.status !== "CANCELLED").length;
    const availability = calculateSlotAvailability({
      capacity: slot.capacity,
      bookedCount,
      cancelledCount: 0
    });

    if (!availability.isAvailable) {
      throw new Error("预约时段已满");
    }

    const products = await tx.product.findMany({
      where: {
        id: { in: data.productIds },
        brandId: data.brandId,
        enabled: true
      }
    });

    if (products.length !== data.productIds.length) {
      throw new Error("预约产品不存在或已停用");
    }

    const customer = await tx.customer.upsert({
      where: {
        brandId_phone: {
          brandId: data.brandId,
          phone: data.customerPhone
        }
      },
      update: {
        name: data.customerName
      },
      create: {
        brandId: data.brandId,
        name: data.customerName,
        phone: data.customerPhone
      }
    });

    const draft = createAppointmentDraft({
      brandId: data.brandId,
      storeId: data.storeId,
      serviceGroupId: data.serviceGroupId,
      slotId: data.slotId,
      customer: {
        name: customer.name,
        phone: customer.phone
      },
      scheduledAt: slot.startsAt,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity: 1
      })),
      remark: data.remark
    });

    return tx.order.create({
      data: {
        orderNo: draft.orderNo,
        brandId: draft.brandId,
        storeId: draft.storeId,
        serviceGroupId: draft.serviceGroupId,
        slotId: draft.slotId,
        customerId: customer.id,
        scheduledAt: draft.scheduledAt,
        source: data.source ?? "ONLINE",
        bookingMethod: data.bookingMethod ?? "ONLINE",
        status: draft.status,
        paymentStatus: draft.paymentStatus,
        totalCents: draft.totalCents,
        remark: draft.remark,
        items: {
          create: draft.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            priceCents: item.priceCents
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });
  });
}
