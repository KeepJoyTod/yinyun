import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { getAuditLogData } from "@/server/audit-logs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireApiPermission("audit-log:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);

  try {
    return NextResponse.json({
      ok: true,
      data: await getAuditLogData(auth.session.brandId, {
        date: url.searchParams.get("date"),
        actor: url.searchParams.get("actor"),
        target: url.searchParams.get("target")
      })
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取操作日志失败" },
      { status: 500 }
    );
  }
}
