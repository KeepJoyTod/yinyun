import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { exportCustomersCsv } from "@/server/export-import";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiPermission("customer:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    const csv = await exportCustomersCsv(auth.session.brandId);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=customers.csv"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导出客户失败" },
      { status: 500 }
    );
  }
}
