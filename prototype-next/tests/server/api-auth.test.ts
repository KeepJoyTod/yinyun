import { describe, expect, it } from "vitest";
import { assertPermission } from "@/server/api-auth";
import type { SessionPayload } from "@/lib/session";

function session(role: SessionPayload["role"]): SessionPayload {
  return {
    userId: "user-1",
    brandId: "brand-1",
    name: "测试用户",
    phone: "17863026867",
    role,
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

describe("api permission guard", () => {
  it("allows users with the required permission", () => {
    expect(() => assertPermission(session("OWNER"), "store:write")).not.toThrow();
    expect(() => assertPermission(session("OWNER"), "channel:write")).not.toThrow();
  });

  it("rejects users without the required permission", () => {
    expect(() => assertPermission(session("VIEWER"), "store:write")).toThrow("无权限执行该操作");
  });
});
