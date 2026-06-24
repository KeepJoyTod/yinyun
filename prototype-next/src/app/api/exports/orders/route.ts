import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { exportOrdersCsv } from "@/server/export-import";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiPermission("order:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    const csv = await exportOrdersCsv(auth.session.brandId);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=orders.csv"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导出订单失败" },
      { status: 500 }
    );
  }
}
