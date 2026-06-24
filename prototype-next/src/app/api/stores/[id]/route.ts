import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { deleteStore, updateStore } from "@/server/stores";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("store:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const store = await updateStore(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "update_store",
      target: `store:${store.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, store });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新门店失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("store:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    await deleteStore(auth.session.brandId, id);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "delete_store",
      target: `store:${id}`,
      detail: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "删除门店失败" },
      { status: 400 }
    );
  }
}
