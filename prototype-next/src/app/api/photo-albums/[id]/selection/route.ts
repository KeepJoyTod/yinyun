import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { submitPhotoSelection } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

const selectionSchema = z.object({
  selectedAssetIds: z.array(z.string()).min(1),
  note: z.string().nullable().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("photo-album:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = selectionSchema.parse(await request.json());
    const album = await submitPhotoSelection(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "submit_photo_selection",
      target: `photo_album:${album.title}`,
      detail: { selectedCount: album.selectedCount }
    });
    return NextResponse.json({ ok: true, album });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "提交选片失败" },
      { status: 400 }
    );
  }
}
