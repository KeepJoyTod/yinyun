import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteProduct, updateProduct } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { productTypeOptions } from "@/domain/product";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  serviceGroupId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  nickname: z.string().nullable().optional(),
  type: z.enum(productTypeOptions.map((item) => item.value)).optional(),
  externalCode: z.string().nullable().optional(),
  selectionUnitPriceYuan: z.coerce.number().min(0).nullable().optional(),
  albumProductName: z.string().nullable().optional(),
  priceYuan: z.coerce.number().min(0).optional(),
  durationMin: z.coerce.number().int().min(1).optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("product:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const product = await updateProduct(auth.session.brandId, id, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "update_product",
      target: `product:${product.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "更新产品失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission("product:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    await deleteProduct(auth.session.brandId, id);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "delete_product",
      target: `product:${id}`,
      detail: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "删除产品失败" },
      { status: 400 }
    );
  }
}
