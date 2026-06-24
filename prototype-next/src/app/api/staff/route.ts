import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { createStaff, getStaffManagementData } from "@/server/staff";

export const dynamic = "force-dynamic";

const staffSchema = z.object({
  storeId: z.string().nullable().optional(),
  name: z.string().min(1, "请填写员工姓名"),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  enabled: z.boolean().optional()
});

export async function GET() {
  const auth = await requireApiPermission("staff:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getStaffManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取员工失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("staff:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = staffSchema.parse(await request.json());
    const staff = await createStaff(auth.session.brandId, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "create_staff",
      target: `staff:${staff.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, staff });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "保存员工失败" },
      { status: 400 }
    );
  }
}
