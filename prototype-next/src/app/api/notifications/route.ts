import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { getNotificationManagementData } from "@/server/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiPermission("notification:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getNotificationManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取通知配置失败" },
      { status: 500 }
    );
  }
}
