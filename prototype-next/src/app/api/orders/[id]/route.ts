import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderDetails } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  scheduledAt: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  remark: z.string().nullable().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("order:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const order = await updateOrderDetails(auth.session.brandId, id, data, auth.session.name);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新订单失败" },
      { status: 400 }
    );
  }
}