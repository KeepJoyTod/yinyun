import { describe, expect, it } from "vitest";
import { createSessionCookieValue, verifySessionCookie } from "@/lib/session";

const user = {
  userId: "user-1",
  brandId: "brand-1",
  name: "文瑞",
  phone: "17863026867",
  role: "OWNER" as const
};

describe("session cookie", () => {
  it("signs and verifies a valid session", async () => {
    const cookie = await createSessionCookieValue(user);
    const session = await verifySessionCookie(cookie);

    expect(session?.userId).toBe(user.userId);
    expect(session?.role).toBe("OWNER");
  });

  it("rejects tampered cookies", async () => {
    const cookie = await createSessionCookieValue(user);
    const tampered = `${cookie.slice(0, -1)}${cookie.endsWith("a") ? "b" : "a"}`;

    expect(await verifySessionCookie(tampered)).toBeNull();
  });

  it("rejects expired cookies", async () => {
    const cookie = await createSessionCookieValue(user, -1);

    expect(await verifySessionCookie(cookie)).toBeNull();
  });
});
