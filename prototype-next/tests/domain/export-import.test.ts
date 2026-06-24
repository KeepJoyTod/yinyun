import { describe, expect, it } from "vitest";
import { buildCsv, splitLines } from "@/domain/export-import";

describe("export and import helpers", () => {
  it("escapes csv cells safely", () => {
    expect(
      buildCsv([
        ["姓名", "备注"],
        ["张三", '包含,逗号 "和引号"']
      ])
    ).toBe('姓名,备注\r\n张三,"包含,逗号 ""和引号"""');
  });

  it("splits lines while ignoring blank rows", () => {
    expect(splitLines("a\n\nb\r\n c \n")).toEqual(["a", "b", "c"]);
  });
});
