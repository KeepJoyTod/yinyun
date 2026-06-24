import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { addPhotoAsset } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

const assetSchema = z.object({
  fileName: z.string().nullable().optional(),
  url: z.string().min(1, "请填写照片地址"),
  sortOrder: z.coerce.number().int().min(0).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("photo-album:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = assetSchema.parse(await request.json());
    const album = await addPhotoAsset(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "add_photo_asset",
      target: `photo_album:${album.title}`,
      detail: data
    });
    return NextResponse.json({ ok: true, album });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "添加照片失败" },
      { status: 400 }
    );
  }
}
