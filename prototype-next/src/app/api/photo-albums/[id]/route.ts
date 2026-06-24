import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { updatePhotoAlbumStatus } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("photo-album:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const album = await updatePhotoAlbumStatus(auth.session.brandId, id, data.status);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "update_photo_album_status",
      target: `photo_album:${album.title}`,
      detail: data
    });
    return NextResponse.json({ ok: true, album });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新相册失败" },
      { status: 400 }
    );
  }
}
