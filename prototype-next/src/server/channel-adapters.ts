import { channelTypeLabel, douyinApiMethods, type ChannelType } from "@/domain/channel";

export type ChannelSearchListInput = {
  brandId: string;
  page?: number;
  pageSize?: number;
  startTime?: string | null;
  endTime?: string | null;
};

export type ChannelOrderDetailInput = {
  brandId: string;
  externalOrderId: string;
};

export type ChannelOrderListItem = {
  externalOrderId: string;
  externalStatus: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  amountCents: number;
  scheduledAt: Date;
};

export type ChannelSearchListResult = {
  apiName: string;
  items: ChannelOrderListItem[];
  nextCursor: string | null;
  rawPayload: Record<string, unknown>;
};

export type ChannelOrderDetailResult = ChannelOrderListItem & {
  apiName: string;
  rawPayload: Record<string, unknown>;
};

export type ChannelAdapter = {
  channelType: ChannelType;
  searchList(input: ChannelSearchListInput): Promise<ChannelSearchListResult>;
  orderDetail(input: ChannelOrderDetailInput): Promise<ChannelOrderDetailResult>;
};

const mockDouyinOrders: ChannelOrderListItem[] = [
  {
    externalOrderId: "DY202606010001",
    externalStatus: "待确认",
    customerName: "抖音客户",
    customerPhone: "138****0001",
    productName: "抖音团购证件照套餐",
    amountCents: 9900,
    scheduledAt: new Date("2026-06-01T10:30:00")
  }
];

export function createMockDouyinAdapter(): ChannelAdapter {
  return {
    channelType: "DOUYIN",
    async searchList(input) {
      const pageSize = input.pageSize ?? 50;

      return {
        apiName: douyinApiMethods.searchList,
        items: mockDouyinOrders.slice(0, pageSize),
        nextCursor: null,
        rawPayload: {
          method: douyinApiMethods.searchList,
          page: input.page ?? 1,
          pageSize
        }
      };
    },
    async orderDetail(input) {
      const found = mockDouyinOrders.find((order) => order.externalOrderId === input.externalOrderId) ?? {
        ...mockDouyinOrders[0],
        externalOrderId: input.externalOrderId
      };

      return {
        ...found,
        apiName: douyinApiMethods.orderDetail,
        rawPayload: {
          method: douyinApiMethods.orderDetail,
          app_key: "mock-app-key",
          access_token: "***",
          order_id: input.externalOrderId
        }
      };
    }
  };
}

export function getChannelAdapter(channelType: ChannelType): ChannelAdapter | null {
  if (channelType === "DOUYIN") {
    return createMockDouyinAdapter();
  }

  return null;
}

export function unsupportedChannelAdapterMessage(channelType: ChannelType) {
  return `${channelTypeLabel(channelType)} adapter 尚未接入真实接口文档`;
}
