import { NextResponse } from "next/server";
import { z } from "zod";
import { submitPublicPhotoSelection } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

const selectionSchema = z.object({
  selectedAssetIds: z.array(z.string()).min(1),
  note: z.string().nullable().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const data = selectionSchema.parse(await request.json());
    const album = await submitPublicPhotoSelection(token, data);
    return NextResponse.json({ ok: true, album });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "提交选片失败" },
      { status: 400 }
    );
  }
}
