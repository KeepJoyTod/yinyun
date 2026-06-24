export type ProductType = "SERVICE" | "GROUP_DEAL" | "ADDITIONAL" | "PRINT" | "DOUYIN" | "MEITUAN";

export const productTypeOptions: Array<{ value: ProductType; label: string }> = [
  { value: "SERVICE", label: "服务产品" },
  { value: "GROUP_DEAL", label: "团单产品" },
  { value: "ADDITIONAL", label: "附加产品" },
  { value: "PRINT", label: "冲印产品" },
  { value: "DOUYIN", label: "抖音产品" },
  { value: "MEITUAN", label: "美团产品" }
];

export function productTypeLabel(type: ProductType) {
  return productTypeOptions.find((item) => item.value === type)?.label ?? type;
}

export type ProductDraftInput = {
  name: string;
  nickname?: string | null;
  type: ProductType;
  priceYuan: number;
  durationMin: number;
  serviceGroupId?: string | null;
  externalCode?: string | null;
  selectionUnitPriceYuan?: number | null;
  albumProductName?: string | null;
};

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function priceCentsFromYuan(value?: number | null) {
  if (value === undefined || value === null) {
    return null;
  }
  if (value < 0) {
    throw new Error("选片单价不能小于 0");
  }
  return Math.round(value * 100);
}

export function createProductDraft(input: ProductDraftInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("请填写产品名称");
  }

  if (input.priceYuan < 0) {
    throw new Error("产品价格不能小于 0");
  }

  if (input.durationMin < 1) {
    throw new Error("服务时长不能小于 1 分钟");
  }

  return {
    name,
    nickname: input.nickname?.trim() || null,
    type: input.type,
    priceCents: Math.round(input.priceYuan * 100),
    durationMin: input.durationMin,
    serviceGroupId: input.serviceGroupId?.trim() || null,
    externalCode: input.externalCode?.trim() || null,
    selectionUnitPriceCents: priceCentsFromYuan(input.selectionUnitPriceYuan),
    albumProductName: normalizeOptionalText(input.albumProductName)
  };
}

export function channelPluginStatus(type: ProductType) {
  if (type === "DOUYIN") {
    return {
      type,
      label: "抖音产品",
      enabled: false,
      message: "抖音小程序未开通"
    };
  }

  if (type === "MEITUAN") {
    return {
      type,
      label: "美团产品",
      enabled: false,
      message: "美团核销工具未开通"
    };
  }

  return {
    type,
    label: productTypeLabel(type),
    enabled: true,
    message: "已开通"
  };
}
