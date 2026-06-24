import { describe, expect, it } from "vitest";
import { channelAccountStatusMeta, channelApiCapabilities, channelOrderSyncStatusMeta, channelSyncStatusMeta, douyinApiMethods, isChannelAuthorized } from "@/domain/channel";
import { createMockDouyinAdapter } from "@/server/channel-adapters";

describe("channel plugin domain", () => {
  it("marks unauthorized channels as not open", () => {
    expect(channelAccountStatusMeta("NOT_AUTHORIZED")).toMatchObject({
      label: "未开通",
      message: "尚未完成店铺授权，真实渠道订单不会同步。"
    });
    expect(isChannelAuthorized("AUTHORIZED")).toBe(true);
  });

  it("keeps douyin api method names stable for adapters", () => {
    expect(channelApiCapabilities.DOUYIN.searchList).toBe(douyinApiMethods.searchList);
    expect(channelApiCapabilities.DOUYIN.orderDetail).toBe(douyinApiMethods.orderDetail);
    expect(channelOrderSyncStatusMeta("LINKED")).toMatchObject({ label: "已关联本地单" });
    expect(channelSyncStatusMeta("SKIPPED")).toMatchObject({ label: "跳过" });
  });

  it("returns mock douyin orders and details", async () => {
    const adapter = createMockDouyinAdapter();
    const list = await adapter.searchList({ brandId: "brand-1", pageSize: 1 });
    expect(list.apiName).toBe("order.searchList");
    expect(list.items[0]).toMatchObject({
      externalOrderId: "DY202606010001",
      customerName: "抖音客户"
    });

    const detail = await adapter.orderDetail({ brandId: "brand-1", externalOrderId: "DY202606019999" });
    expect(detail.apiName).toBe("order.orderDetail");
    expect(detail.externalOrderId).toBe("DY202606019999");
  });
});
