import { createProductDraft, type ProductType } from "@/domain/product";
import { prisma } from "@/lib/prisma";

type ProductImportRow = {
  name: string;
  nickname?: string | null;
  externalCode?: string | null;
  type: ProductType;
  priceYuan: number;
  durationMin: number;
  serviceGroupId?: string | null;
  selectionUnitPriceYuan?: number | null;
  albumProductName?: string | null;
};

function normalizeExternalCode(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function parseProductImportRows(value: unknown): ProductImportRow[] {
  const rows = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { rows?: unknown[] }).rows) ? (value as { rows: ProductImportRow[] }).rows : null;

  if (!rows) {
    throw new Error("请提交产品数组");
  }

  return rows.map((row) => ({
    name: row.name,
    nickname: row.nickname,
    externalCode: normalizeExternalCode(row.externalCode),
    type: row.type,
    priceYuan: row.priceYuan,
    durationMin: row.durationMin,
    serviceGroupId: row.serviceGroupId ?? null,
    selectionUnitPriceYuan: row.selectionUnitPriceYuan ?? null,
    albumProductName: row.albumProductName ?? null
  }));
}

export async function importProducts(brandId: string, input: unknown) {
  const rows = parseProductImportRows(input);
  const created: Array<{ name: string; id: string }> = [];
  const failed: Array<{ index: number; name: string; message: string }> = [];

  for (const [index, row] of rows.entries()) {
    try {
      const draft = createProductDraft(row);
      const product = await prisma.product.create({
        data: {
          brandId,
          serviceGroupId: draft.serviceGroupId,
          name: draft.name,
          nickname: draft.nickname,
          externalCode: draft.externalCode,
          selectionUnitPriceCents: draft.selectionUnitPriceCents,
          albumProductName: draft.albumProductName,
          type: draft.type,
          priceCents: draft.priceCents,
          durationMin: draft.durationMin,
          enabled: true
        }
      });
      created.push({ name: product.name, id: product.id });
    } catch (error) {
      failed.push({
        index: index + 1,
        name: row.name ?? `第 ${index + 1} 行`,
        message: error instanceof Error ? error.message : "导入失败"
      });
    }
  }

  return {
    created,
    failed,
    summary: {
      total: rows.length,
      created: created.length,
      failed: failed.length
    }
  };
}

export function parseImportedText(value: string) {
  return JSON.parse(value) as unknown;
}
