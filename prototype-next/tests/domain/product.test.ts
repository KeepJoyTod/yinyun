import { describe, expect, it } from "vitest";
import { channelPluginStatus, createProductDraft, productTypeLabel, productTypeOptions } from "@/domain/product";

describe("product draft", () => {
  it("normalizes product fields for persistence", () => {
    const draft = createProductDraft({
      name: " 团购预约-定金20到店退 ",
      nickname: " 证件照团购 ",
      type: "GROUP_DEAL",
      priceYuan: 20,
      durationMin: 30,
      serviceGroupId: "",
      externalCode: " DY-001 ",
      selectionUnitPriceYuan: 5,
      albumProductName: " 精修入册 "
    });

    expect(draft).toEqual({
      name: "团购预约-定金20到店退",
      nickname: "证件照团购",
      type: "GROUP_DEAL",
      priceCents: 2000,
      durationMin: 30,
      serviceGroupId: null,
      externalCode: "DY-001",
      selectionUnitPriceCents: 500,
      albumProductName: "精修入册"
    });
  });

  it("rejects invalid product prices", () => {
    expect(() =>
      createProductDraft({
        name: "证件照",
        type: "SERVICE",
        priceYuan: -1,
        durationMin: 30
      })
    ).toThrow("产品价格不能小于 0");
  });

  it("supports PRD product categories for channel products", () => {
    expect(productTypeOptions.map((item) => item.value)).toEqual(["SERVICE", "GROUP_DEAL", "ADDITIONAL", "PRINT", "DOUYIN", "MEITUAN"]);
    expect(productTypeLabel("DOUYIN")).toBe("抖音产品");
    expect(productTypeLabel("MEITUAN")).toBe("美团产品");
  });

  it("marks Douyin and Meituan product capabilities as channel plugins before authorization", () => {
    expect(channelPluginStatus("DOUYIN")).toMatchObject({
      label: "抖音产品",
      enabled: false,
      message: "抖音小程序未开通"
    });
    expect(channelPluginStatus("MEITUAN")).toMatchObject({
      label: "美团产品",
      enabled: false,
      message: "美团核销工具未开通"
    });
  });
});
