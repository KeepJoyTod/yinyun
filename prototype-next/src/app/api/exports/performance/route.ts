import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { exportPerformanceCsv } from "@/server/performance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireApiPermission("report:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);

  try {
    const csv = await exportPerformanceCsv(auth.session.brandId, {
      month: url.searchParams.get("month"),
      storeId: url.searchParams.get("storeId"),
      staffId: url.searchParams.get("staffId")
    });
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=performance.csv"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导出业绩失败" },
      { status: 500 }
    );
  }
}
