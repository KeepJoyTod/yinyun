import { NextResponse } from "next/server";
import { requireApiPermission } from "@/server/api-auth";
import { recordAuditLog } from "@/server/audit-logs";
import { importProducts, parseImportedText } from "@/server/import-products";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireApiPermission("product:write");
  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const payload = typeof body === "string" ? parseImportedText(body) : body;
    const result = await importProducts(auth.session.brandId, payload);
    await recordAuditLog({
      brandId: auth.session.brandId,
      actor: auth.session.name,
      action: "import_products",
      target: "product:batch",
      detail: result.summary
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "导入产品失败" },
      { status: 400 }
    );
  }
}
