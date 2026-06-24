import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { exportReportCsv } from "@/server/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireApiPermission("report:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);

  try {
    const csv = await exportReportCsv(auth.session.brandId, {
      date: url.searchParams.get("date"),
      storeId: url.searchParams.get("storeId"),
      serviceGroupId: url.searchParams.get("serviceGroupId")
    });
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=reports.csv"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导出报表失败" },
      { status: 500 }
    );
  }
}
