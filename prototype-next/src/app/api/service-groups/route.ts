import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceGroup, listServiceGroups } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";

export const dynamic = "force-dynamic";

const serviceGroupSchema = z.object({
  storeId: z.string().nullable().optional(),
  name: z.string().min(1, "请填写服务组名称"),
  description: z.string().optional(),
  slotMinutes: z.coerce.number().int().min(5).max(480),
  capacityPerSlot: z.coerce.number().int().min(1).max(99)
});

export async function GET() {
  const auth = await requireApiPermission("service-group:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, groups: await listServiceGroups(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取服务组失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("service-group:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = serviceGroupSchema.parse(await request.json());
    const group = await createServiceGroup(auth.session.brandId, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "create_service_group",
      target: `service-group:${group.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, group });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "保存服务组失败" },
      { status: 400 }
    );
  }
}
