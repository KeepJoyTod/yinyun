import { NextResponse } from "next/server";
import { createAppointment } from "@/server/appointments";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const order = await createAppointment(payload);

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalCents: order.totalCents,
        customer: {
          name: order.customer.name,
          phone: order.customer.phone
        },
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents
        }))
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "预约失败"
      },
      { status: 400 }
    );
  }
}
