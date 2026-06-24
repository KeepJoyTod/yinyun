import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteServiceGroup, updateServiceGroup } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  storeId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  slotMinutes: z.coerce.number().int().min(5).max(480).optional(),
  capacityPerSlot: z.coerce.number().int().min(1).max(99).optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("service-group:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const group = await updateServiceGroup(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "update_service_group",
      target: `service-group:${group.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, group });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新服务组失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("service-group:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    await deleteServiceGroup(auth.session.brandId, id);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "delete_service_group",
      target: `service-group:${id}`,
      detail: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "删除服务组失败" },
      { status: 400 }
    );
  }
}
