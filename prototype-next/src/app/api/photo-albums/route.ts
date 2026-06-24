import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { createPhotoAlbum, getPhotoAlbumManagementData } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

const albumSchema = z.object({
  customerId: z.string().nullable().optional(),
  orderId: z.string().nullable().optional(),
  title: z.string().min(1, "请填写相册名称"),
  description: z.string().nullable().optional(),
  maxSelectCount: z.coerce.number().int().min(1)
});

export async function GET() {
  const auth = await requireApiPermission("photo-album:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getPhotoAlbumManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取客片相册失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("photo-album:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = albumSchema.parse(await request.json());
    const album = await createPhotoAlbum(auth.session.brandId, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "create_photo_album",
      target: `photo_album:${album.title}`,
      detail: data
    });
    return NextResponse.json({ ok: true, album });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "创建相册失败" },
      { status: 400 }
    );
  }
}
