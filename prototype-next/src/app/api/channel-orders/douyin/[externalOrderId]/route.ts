import { NextResponse } from "next/server";
import { getDouyinOrderDetailData } from "@/server/channel";
import { requireApiPermission } from "@/server/api-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ externalOrderId: string }> }) {
  const auth = await requireApiPermission("channel:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { externalOrderId } = await params;
    return NextResponse.json({ ok: true, data: await getDouyinOrderDetailData(auth.session.brandId, externalOrderId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取抖音订单详情失败" },
      { status: 500 }
    );
  }
}
