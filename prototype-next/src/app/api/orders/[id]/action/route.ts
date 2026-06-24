import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderAction } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["CONFIRM", "START_SERVICE", "COMPLETE", "CANCEL"]),
  cancelReason: z.string().nullable().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("order:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = actionSchema.parse(await request.json());
    const order = await updateOrderAction(auth.session.brandId, id, data.action, auth.session.name, { cancelReason: data.cancelReason });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "订单操作失败" },
      { status: 400 }
    );
  }
}
