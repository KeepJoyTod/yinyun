import { NextResponse } from "next/server";
import { getChannelPluginBoardData } from "@/server/channel";
import { requireApiPermission } from "@/server/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiPermission("channel:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getChannelPluginBoardData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取渠道插件失败" },
      { status: 500 }
    );
  }
}
