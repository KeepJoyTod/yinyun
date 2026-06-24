import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { saveNotificationTemplate } from "@/server/notifications";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  channel: z.enum(["SMS", "WECHAT"]),
  key: z.string().min(1),
  name: z.string().min(1),
  content: z.string().min(1),
  enabled: z.boolean()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("notification:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const template = await saveNotificationTemplate(auth.session.brandId, id, data);
    return NextResponse.json({ ok: true, template });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "保存通知模板失败" },
      { status: 400 }
    );
  }
}
