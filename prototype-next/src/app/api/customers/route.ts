import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { getCustomerManagementData } from "@/server/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiPermission("customer:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getCustomerManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取客户失败" },
      { status: 500 }
    );
  }
}
