import { NextResponse } from "next/server";
import { z } from "zod";
import { createProduct, getProductManagementData } from "@/server/backoffice";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { productTypeOptions } from "@/domain/product";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  serviceGroupId: z.string().nullable().optional(),
  name: z.string().min(1, "请填写产品名称"),
  nickname: z.string().nullable().optional(),
  type: z.enum(productTypeOptions.map((item) => item.value)),
  externalCode: z.string().nullable().optional(),
  selectionUnitPriceYuan: z.coerce.number().min(0).nullable().optional(),
  albumProductName: z.string().nullable().optional(),
  priceYuan: z.coerce.number().min(0),
  durationMin: z.coerce.number().int().min(1)
});

export async function GET() {
  const auth = await requireApiPermission("product:read");
  if (auth.response) {
    return auth.response;
  }

  try {
    return NextResponse.json({ ok: true, data: await getProductManagementData(auth.session.brandId) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "读取产品失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("product:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const data = productSchema.parse(await request.json());
    const product = await createProduct(auth.session.brandId, data);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "create_product",
      target: `product:${product.name}`,
      detail: data
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "保存产品失败" },
      { status: 400 }
    );
  }
}
