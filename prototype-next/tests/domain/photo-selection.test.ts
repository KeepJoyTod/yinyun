import { describe, expect, it } from "vitest";
import { buildAlbumSummary, createAlbumDraft, createAssetDraft, createSelectionDraft, toggleSelectedAssetId } from "@/domain/photo-selection";

describe("photo album and selection rules", () => {
  it("normalizes album draft and requires a title", () => {
    expect(createAlbumDraft({ title: "  证件照选片  ", maxSelectCount: 3 })).toEqual({
      title: "证件照选片",
      description: null,
      maxSelectCount: 3
    });

    expect(() => createAlbumDraft({ title: " ", maxSelectCount: 1 })).toThrow("请填写相册名称");
  });

  it("normalizes photo asset draft and requires a usable URL", () => {
    expect(createAssetDraft({ fileName: "  DSC001.jpg ", url: " /uploads/dsc001.jpg ", sortOrder: 2 })).toEqual({
      fileName: "DSC001.jpg",
      url: "/uploads/dsc001.jpg",
      sortOrder: 2
    });

    expect(() => createAssetDraft({ fileName: "DSC002.jpg", url: " ", sortOrder: 0 })).toThrow("请填写照片地址");
  });

  it("deduplicates selected photos and enforces album max count", () => {
    expect(createSelectionDraft({ selectedAssetIds: ["a1", "a1", "a2"], maxSelectCount: 2, note: " 精修这两张 " })).toEqual({
      selectedAssetIds: ["a1", "a2"],
      note: "精修这两张"
    });

    expect(() => createSelectionDraft({ selectedAssetIds: ["a1", "a2", "a3"], maxSelectCount: 2 })).toThrow("最多选择 2 张照片");
  });

  it("toggles public selected photos without exceeding max count", () => {
    expect(toggleSelectedAssetId(["a1"], "a2", 2)).toEqual(["a1", "a2"]);
    expect(toggleSelectedAssetId(["a1", "a2"], "a3", 2)).toEqual(["a1", "a2"]);
    expect(toggleSelectedAssetId(["a1", "a2"], "a2", 2)).toEqual(["a1"]);
  });

  it("summarizes album progress", () => {
    expect(buildAlbumSummary({
      status: "PUBLISHED",
      assets: [{ id: "a1" }, { id: "a2" }],
      selections: [{ assetId: "a2" }]
    })).toEqual({
      assetCount: 2,
      selectedCount: 1,
      statusLabel: "已发布",
      progressLabel: "已选 1/2"
    });
  });
});
