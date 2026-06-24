import { NextResponse } from "next/server";
import { z } from "zod";
import { generateServiceGroupSlots } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";

export const dynamic = "force-dynamic";

const slotGenerationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择日期"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "请选择开始时间"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "请选择结束时间")
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("service-group:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = slotGenerationSchema.parse(await request.json());
    const result = await generateServiceGroupSlots(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "generate_service_group_slots",
      target: `service-group:${id}`,
      detail: { ...data, ...result }
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "生成档期失败" },
      { status: 400 }
    );
  }
}
