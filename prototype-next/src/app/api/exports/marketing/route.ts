import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { exportMarketingCsv } from "@/server/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireApiPermission("report:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);

  try {
    const csv = await exportMarketingCsv(auth.session.brandId, {
      month: url.searchParams.get("month"),
      channel: url.searchParams.get("channel")
    });
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=marketing.csv"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导出营销统计失败" },
      { status: 500 }
    );
  }
}
