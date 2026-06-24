import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { sendNotificationDryRun } from "@/server/notifications";

export const dynamic = "force-dynamic";

const sendSchema = z.object({
  templateId: z.string().nullable().optional(),
  channel: z.enum(["SMS", "WECHAT"]),
  recipient: z.string().min(1),
  content: z.string().nullable().optional(),
  variables: z.record(z.string(), z.string()).optional()
});

export async function POST(request: Request) {
  const auth = await requireApiPermission("notification:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = sendSchema.parse(await request.json());
    const result = await sendNotificationDryRun(auth.session.brandId, data);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "发送通知失败" },
      { status: 400 }
    );
  }
}
