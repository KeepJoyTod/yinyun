import { describe, expect, it } from "vitest";
import { canAccess, hasPermission, rolePermissions } from "@/domain/auth";

describe("role based access control", () => {
  it("allows owner to manage all core modules", () => {
    expect(rolePermissions.OWNER).toContain("store:write");
    expect(rolePermissions.OWNER).toContain("order:write");
    expect(rolePermissions.OWNER).toContain("report:read");
  });

  it("allows staff to process orders but not change stores", () => {
    expect(hasPermission("STAFF", "order:write")).toBe(true);
    expect(hasPermission("STAFF", "store:write")).toBe(false);
  });

  it("keeps viewer read-only", () => {
    expect(canAccess("VIEWER", ["dashboard:read", "order:read"])).toBe(true);
    expect(canAccess("VIEWER", ["order:write"])).toBe(false);
  });
});
