import { channelAccountStatusMeta, channelApiCapabilities, channelOrderSyncStatusMeta, channelOptions, channelSyncStatusMeta, channelTypeLabel, type ChannelType } from "@/domain/channel";
import { prisma } from "@/lib/prisma";
import { getChannelAdapter } from "@/server/channel-adapters";

export type ChannelPluginRow = {
  id: string;
  channelType: ChannelType;
  channelLabel: string;
  name: string;
  enabled: boolean;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  description: string;
  accountName: string;
  accountStatusLabel: string;
  accountStatusTone: "success" | "warning" | "danger" | "neutral";
  accountStatusMessage: string;
  storeName: string;
  apiSearchList: string;
  apiOrderDetail: string;
  accountCount: number;
  mappingCount: number;
  syncLogCount: number;
  lastSyncAt: string;
};

export type ChannelAccountRow = {
  id: string;
  channelType: ChannelType;
  channelLabel: string;
  accountName: string;
  storeName: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  appKey: string;
  tokenExpiresAt: string;
  lastAuthorizedAt: string;
  lastSyncAt: string;
};

export type ChannelSyncLogRow = {
  id: string;
  channelType: ChannelType;
  channelLabel: string;
  apiName: string;
  requestId: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  errorMessage: string;
  durationMs: string;
  createdAt: string;
  success: boolean;
};

export type ChannelOrderRow = {
  id: string;
  channelType: ChannelType;
  channelLabel: string;
  externalOrderId: string;
  externalStatus: string;
  localOrderNo: string;
  syncStatusLabel: string;
  syncStatusTone: "success" | "warning" | "danger" | "neutral";
  customerName: string;
  customerPhone: string;
  productName: string;
  amount: string;
  scheduledAt: string;
  lastSyncedAt: string;
  detailApiName: string;
  rawPayload: string;
};

function formatMoney(cents: number | null | undefined) {
  if (cents === null || cents === undefined) {
    return "-";
  }

  return `¥${(cents / 100).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function stringifyJson(value: unknown) {
  if (value === null || value === undefined) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

function fallbackPluginRows(): ChannelPluginRow[] {
  return channelOptions.map((option) => {
    const pluginStatus = channelAccountStatusMeta("NOT_AUTHORIZED");
    const api = channelApiCapabilities[option.value];

    return {
      id: `fallback-${option.value.toLowerCase()}-plugin`,
      channelType: option.value,
      channelLabel: option.label,
      name: `${option.label}渠道插件`,
      enabled: false,
      statusLabel: pluginStatus.label,
      statusTone: pluginStatus.tone,
      description: api.note,
      accountName: "未配置",
      accountStatusLabel: pluginStatus.label,
      accountStatusTone: pluginStatus.tone,
      accountStatusMessage: pluginStatus.message,
      storeName: "-",
      apiSearchList: api.searchList,
      apiOrderDetail: api.orderDetail,
      accountCount: 0,
      mappingCount: 0,
      syncLogCount: 0,
      lastSyncAt: "-"
    };
  });
}

function fallbackAccountRows(): ChannelAccountRow[] {
  return channelOptions.map((option) => {
    const status = channelAccountStatusMeta("NOT_AUTHORIZED");

    return {
      id: `fallback-${option.value.toLowerCase()}-account`,
      channelType: option.value,
      channelLabel: option.label,
      accountName: "未配置",
      storeName: "-",
      statusLabel: status.label,
      statusTone: status.tone,
      appKey: "-",
      tokenExpiresAt: "-",
      lastAuthorizedAt: "-",
      lastSyncAt: "-"
    };
  });
}

function fallbackSyncLogs(): ChannelSyncLogRow[] {
  return [
    {
      id: "fallback-channel-sync-log",
      channelType: "DOUYIN" as const,
      channelLabel: "抖音",
      apiName: "order.searchList",
      requestId: "mock-request-id",
      statusLabel: channelSyncStatusMeta("SKIPPED").label,
      statusTone: channelSyncStatusMeta("SKIPPED").tone,
      errorMessage: "当前为未开通占位，等待店铺授权",
      durationMs: "-",
      createdAt: "演示数据",
      success: false
    }
  ];
}

function mapPluginRow(plugin: {
  id: string;
  channelType: ChannelType;
  name: string;
  enabled: boolean;
  description: string | null;
  accounts: Array<{
    accountName: string;
    status: string;
    store: { name: string } | null;
    lastSyncAt: Date | null;
  }>;
  _count: {
    accounts: number;
    productMappings: number;
    orderMappings: number;
    syncLogs: number;
  };
}): ChannelPluginRow {
  const account = plugin.accounts[0];
  const accountStatus = account ? (account.status as Parameters<typeof channelAccountStatusMeta>[0]) : "NOT_AUTHORIZED";
  const accountMeta = channelAccountStatusMeta(accountStatus);
  const enabled = plugin.enabled && accountStatus === "AUTHORIZED";
  const status = enabled
    ? {
        label: "已开通",
        tone: "success" as const,
        message: "已完成授权，可以同步订单列表和订单详情。"
      }
    : accountMeta;
  const api = channelApiCapabilities[plugin.channelType];

  return {
    id: plugin.id,
    channelType: plugin.channelType,
    channelLabel: channelTypeLabel(plugin.channelType),
    name: plugin.name,
    enabled,
    statusLabel: status.label,
    statusTone: status.tone,
    description: plugin.description ?? api.note,
    accountName: account?.accountName ?? "未配置",
    accountStatusLabel: accountMeta.label,
    accountStatusTone: accountMeta.tone,
    accountStatusMessage: accountMeta.message,
    storeName: account?.store?.name ?? "-",
    apiSearchList: api.searchList,
    apiOrderDetail: api.orderDetail,
    accountCount: plugin._count.accounts,
    mappingCount: plugin._count.productMappings + plugin._count.orderMappings,
    syncLogCount: plugin._count.syncLogs,
    lastSyncAt: account?.lastSyncAt ? formatDateTime(account.lastSyncAt) : "-"
  };
}

function mapAccountRow(account: {
  id: string;
  channelType: ChannelType;
  accountName: string;
  appKey: string | null;
  expiresAt: Date | null;
  lastAuthorizedAt: Date | null;
  lastSyncAt: Date | null;
  status: string;
  store: { name: string } | null;
}): ChannelAccountRow {
  const status = channelAccountStatusMeta(account.status as Parameters<typeof channelAccountStatusMeta>[0]);

  return {
    id: account.id,
    channelType: account.channelType,
    channelLabel: channelTypeLabel(account.channelType),
    accountName: account.accountName,
    storeName: account.store?.name ?? "-",
    statusLabel: status.label,
    statusTone: status.tone,
    appKey: account.appKey ?? "-",
    tokenExpiresAt: account.expiresAt ? formatDateTime(account.expiresAt) : "-",
    lastAuthorizedAt: account.lastAuthorizedAt ? formatDateTime(account.lastAuthorizedAt) : "-",
    lastSyncAt: account.lastSyncAt ? formatDateTime(account.lastSyncAt) : "-"
  };
}

function mapSyncLogRow(log: {
  id: string;
  channelType: ChannelType;
  apiName: string;
  requestId: string | null;
  success: boolean;
  syncStatus: string;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: Date;
}): ChannelSyncLogRow {
  const status = channelSyncStatusMeta(log.syncStatus as Parameters<typeof channelSyncStatusMeta>[0]);

  return {
    id: log.id,
    channelType: log.channelType,
    channelLabel: channelTypeLabel(log.channelType),
    apiName: log.apiName,
    requestId: log.requestId ?? "-",
    statusLabel: status.label,
    statusTone: status.tone,
    errorMessage: log.errorMessage ?? "-",
    durationMs: log.durationMs === null ? "-" : `${log.durationMs} ms`,
    createdAt: formatDateTime(log.createdAt),
    success: log.success
  };
}

function mapOrderRow(row: {
  id: string;
  channelType: ChannelType;
  externalOrderId: string;
  externalStatus: string;
  syncStatus: string;
  customerName: string | null;
  customerPhone: string | null;
  productName: string | null;
  amountCents: number | null;
  scheduledAt: Date | null;
  lastSyncedAt: Date | null;
  order: { orderNo: string } | null;
  rawPayload: unknown;
}): ChannelOrderRow {
  const status = channelOrderSyncStatusMeta(row.syncStatus as Parameters<typeof channelOrderSyncStatusMeta>[0]);

  return {
    id: row.id,
    channelType: row.channelType,
    channelLabel: channelTypeLabel(row.channelType),
    externalOrderId: row.externalOrderId,
    externalStatus: row.externalStatus,
    localOrderNo: row.order?.orderNo ?? "-",
    syncStatusLabel: status.label,
    syncStatusTone: status.tone,
    customerName: row.customerName ?? "-",
    customerPhone: row.customerPhone ?? "-",
    productName: row.productName ?? "-",
    amount: formatMoney(row.amountCents),
    scheduledAt: row.scheduledAt ? formatDateTime(row.scheduledAt) : "-",
    lastSyncedAt: row.lastSyncedAt ? formatDateTime(row.lastSyncedAt) : "-",
    detailApiName: channelApiCapabilities[row.channelType].orderDetail,
    rawPayload: stringifyJson(row.rawPayload)
  };
}

export type ChannelPluginBoardData = {
  plugins: ChannelPluginRow[];
  accounts: ChannelAccountRow[];
  logs: ChannelSyncLogRow[];
  source: "database" | "fallback";
};

export type ChannelOrderBoardData = {
  plugin: ChannelPluginRow;
  orders: ChannelOrderRow[];
  source: "database" | "fallback";
  detailApiName: string;
  searchApiName: string;
  note: string;
};

export type ChannelOrderDetailData = ChannelOrderRow & {
  source: "database" | "fallback";
  rawPayloadObject: string;
};

export async function getChannelPluginBoardData(brandId: string): Promise<ChannelPluginBoardData> {
  try {
    const [plugins, accounts, logs] = await Promise.all([
      prisma.channelPlugin.findMany({
        where: { brandId },
        include: {
          accounts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { store: { select: { name: true } } }
          },
          _count: {
            select: {
              accounts: true,
              productMappings: true,
              orderMappings: true,
              syncLogs: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.channelAccount.findMany({
        where: { brandId },
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.channelSyncLog.findMany({
        where: { brandId },
        orderBy: { createdAt: "desc" },
        take: 12
      })
    ]);

    const pluginMap = new Map(plugins.map((plugin) => [plugin.channelType, plugin]));
    const pluginRows = channelOptions.map((option) => {
      const plugin = pluginMap.get(option.value);

      if (!plugin) {
        return fallbackPluginRows().find((item) => item.channelType === option.value)!;
      }

      return mapPluginRow(plugin);
    });

    return {
      plugins: pluginRows,
      accounts: accounts.length ? accounts.map(mapAccountRow) : fallbackAccountRows(),
      logs: logs.length
        ? logs.map((log) => ({
            ...mapSyncLogRow(log),
            success: log.success
          }))
        : fallbackSyncLogs(),
      source: plugins.length || accounts.length || logs.length ? "database" : "fallback"
    };
  } catch {
    return {
      plugins: fallbackPluginRows(),
      accounts: fallbackAccountRows(),
      logs: fallbackSyncLogs(),
      source: "fallback"
    };
  }
}

export async function getDouyinOrderBoardData(brandId: string): Promise<ChannelOrderBoardData> {
  try {
    const [plugin, rows] = await Promise.all([
      prisma.channelPlugin.findFirst({
        where: { brandId, channelType: "DOUYIN" },
        include: {
          accounts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { store: { select: { name: true } } }
          },
          _count: {
            select: {
              accounts: true,
              productMappings: true,
              orderMappings: true,
              syncLogs: true
            }
          }
        }
      }),
      prisma.channelOrderMapping.findMany({
        where: { brandId, channelType: "DOUYIN" },
        include: {
          order: { select: { orderNo: true } }
        },
        orderBy: { updatedAt: "desc" },
        take: 50
      })
    ]);

    const channelPlugin = plugin
      ? mapPluginRow(plugin)
      : fallbackPluginRows().find((item) => item.channelType === "DOUYIN")!;

    if (rows.length) {
      return {
        plugin: channelPlugin,
        orders: rows.map(mapOrderRow),
        source: "database",
        detailApiName: channelApiCapabilities.DOUYIN.orderDetail,
        searchApiName: channelApiCapabilities.DOUYIN.searchList,
        note: channelApiCapabilities.DOUYIN.note
      };
    }

    const adapter = getChannelAdapter("DOUYIN");
    const fallback = adapter ? await adapter.searchList({ brandId, page: 1, pageSize: 10 }) : null;

    return {
      plugin: channelPlugin,
      orders: fallback
        ? fallback.items.map((item) =>
            mapOrderRow({
              id: `${brandId}-${item.externalOrderId}`,
              channelType: "DOUYIN",
              externalOrderId: item.externalOrderId,
              externalStatus: item.externalStatus,
              syncStatus: "UNLINKED",
              customerName: item.customerName,
              customerPhone: item.customerPhone,
              productName: item.productName,
              amountCents: item.amountCents,
              scheduledAt: item.scheduledAt,
              lastSyncedAt: null,
              order: null,
              rawPayload: fallback.rawPayload
            }))
        : [],
      source: "fallback",
      detailApiName: channelApiCapabilities.DOUYIN.orderDetail,
      searchApiName: channelApiCapabilities.DOUYIN.searchList,
      note: channelApiCapabilities.DOUYIN.note
    };
  } catch {
    const adapter = getChannelAdapter("DOUYIN");
    const fallback = adapter ? await adapter.searchList({ brandId, page: 1, pageSize: 10 }) : null;

    return {
      plugin: fallbackPluginRows().find((item) => item.channelType === "DOUYIN")!,
      orders: fallback
        ? fallback.items.map((item) =>
            mapOrderRow({
              id: `${brandId}-${item.externalOrderId}`,
              channelType: "DOUYIN",
              externalOrderId: item.externalOrderId,
              externalStatus: item.externalStatus,
              syncStatus: "UNLINKED",
              customerName: item.customerName,
              customerPhone: item.customerPhone,
              productName: item.productName,
              amountCents: item.amountCents,
              scheduledAt: item.scheduledAt,
              lastSyncedAt: null,
              order: null,
              rawPayload: fallback.rawPayload
            }))
        : [],
      source: "fallback",
      detailApiName: channelApiCapabilities.DOUYIN.orderDetail,
      searchApiName: channelApiCapabilities.DOUYIN.searchList,
      note: channelApiCapabilities.DOUYIN.note
    };
  }
}

export async function getDouyinOrderDetailData(brandId: string, externalOrderId: string): Promise<ChannelOrderDetailData> {
  try {
    const mapping = await prisma.channelOrderMapping.findFirst({
      where: { brandId, channelType: "DOUYIN", externalOrderId },
      include: {
        order: { select: { orderNo: true } }
      }
    });

    if (mapping) {
      return {
        ...mapOrderRow(mapping),
        source: "database",
        rawPayloadObject: stringifyJson(mapping.rawPayload)
      };
    }

    const adapter = getChannelAdapter("DOUYIN");
    const detail = adapter ? await adapter.orderDetail({ brandId, externalOrderId }) : null;

    if (!detail) {
      throw new Error("暂无抖音订单详情数据");
    }

    return {
      ...mapOrderRow({
        id: `${brandId}-${detail.externalOrderId}`,
        channelType: "DOUYIN",
        externalOrderId: detail.externalOrderId,
        externalStatus: detail.externalStatus,
        syncStatus: "UNLINKED",
        customerName: detail.customerName,
        customerPhone: detail.customerPhone,
        productName: detail.productName,
        amountCents: detail.amountCents,
        scheduledAt: detail.scheduledAt,
        lastSyncedAt: null,
        order: null,
        rawPayload: detail.rawPayload
      }),
      source: "fallback",
      rawPayloadObject: stringifyJson(detail.rawPayload)
    };
  } catch {
    const adapter = getChannelAdapter("DOUYIN");
    const detail = adapter ? await adapter.orderDetail({ brandId, externalOrderId }) : null;

    if (!detail) {
      throw new Error("暂无抖音订单详情数据");
    }

    return {
      ...mapOrderRow({
        id: `${brandId}-${detail.externalOrderId}`,
        channelType: "DOUYIN",
        externalOrderId: detail.externalOrderId,
        externalStatus: detail.externalStatus,
        syncStatus: "UNLINKED",
        customerName: detail.customerName,
        customerPhone: detail.customerPhone,
        productName: detail.productName,
        amountCents: detail.amountCents,
        scheduledAt: detail.scheduledAt,
        lastSyncedAt: null,
        order: null,
        rawPayload: detail.rawPayload
      }),
      source: "fallback",
      rawPayloadObject: stringifyJson(detail.rawPayload)
    };
  }
}
