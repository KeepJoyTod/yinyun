import { describe, expect, it } from "vitest";
import { renderNotificationContent, validateNotificationDraft } from "@/domain/notification";

describe("notification dry-run rules", () => {
  it("renders template variables", () => {
    expect(renderNotificationContent("您好 {{name}}，订单 {{orderNo}} 已确认", { name: "张三", orderNo: "YY001" })).toBe("您好 张三，订单 YY001 已确认");
  });

  it("validates notification recipient and content", () => {
    expect(
      validateNotificationDraft({
        channel: "SMS",
        recipient: " 13900001111 ",
        content: " 预约已确认 "
      })
    ).toEqual({
      channel: "SMS",
      recipient: "13900001111",
      content: "预约已确认"
    });
  });

  it("rejects empty notification content", () => {
    expect(() => validateNotificationDraft({ channel: "SMS", recipient: "13900001111", content: " " })).toThrow("请填写通知内容");
  });
});
