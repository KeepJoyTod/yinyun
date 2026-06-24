import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { createStore, getStoreManagementData } from "@/server/stores";

export const dynamic = "force-dynamic";

const storeSchema = z.object({
  name: z.string().min(1, "请填写门店名称"),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  enabled: z.boolean().optional()
});

export async function GET() {
  const auth = await requireApiPermission("store:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getStoreManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取门店失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("store:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = storeSchema.parse(await request.json());
    const store = await createStore(auth.session.brandId, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "create_store",
      target: `store:${store.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, store });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "保存门店失败" },
      { status: 400 }
    );
  }
}
