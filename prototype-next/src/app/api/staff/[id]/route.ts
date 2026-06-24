import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { deleteStaff, updateStaff } from "@/server/staff";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  storeId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("staff:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const staff = await updateStaff(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "update_staff",
      target: `staff:${staff.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, staff });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新员工失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("staff:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    await deleteStaff(auth.session.brandId, id);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "delete_staff",
      target: `staff:${id}`,
      detail: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "删除员工失败" },
      { status: 400 }
    );
  }
}
