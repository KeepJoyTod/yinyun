import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { renderNotificationContent, validateNotificationDraft } from "@/domain/notification";
import { prisma } from "@/lib/prisma";

export type NotificationTemplateRow = {
  id: string;
  channel: NotificationChannel;
  key: string;
  name: string;
  content: string;
  enabled: boolean;
};

export type NotificationLogRow = {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  content: string;
  provider: string;
  result: string;
  createdAt: string;
};

export type NotificationManagementData = {
  templates: NotificationTemplateRow[];
  logs: NotificationLogRow[];
  source: "database" | "fallback";
};

const fallbackTemplates: NotificationTemplateRow[] = [
  {
    id: "fallback-template-1",
    channel: "SMS",
    key: "appointment_confirm",
    name: "预约确认",
    content: "您好，您的预约 {{orderNo}} 已确认，时间 {{time}}。",
    enabled: true
  },
  {
    id: "fallback-template-2",
    channel: "SMS",
    key: "appointment_reminder",
    name: "预约提醒",
    content: "您好，您有一个预约将在 {{time}} 到达，请准时到店。",
    enabled: true
  }
];

async function ensureDefaultTemplates(brandId: string) {
  const existingCount = await prisma.notificationTemplate.count({ where: { brandId } });
  if (existingCount > 0) {
    return;
  }

  await prisma.notificationTemplate.createMany({
    data: fallbackTemplates.map((template) => ({
      brandId,
      channel: template.channel,
      key: template.key,
      name: template.name,
      content: template.content,
      enabled: template.enabled
    })),
    skipDuplicates: true
  });
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

export async function getNotificationManagementData(brandId: string): Promise<NotificationManagementData> {
  try {
    await ensureDefaultTemplates(brandId);
    const [templates, logs] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where: { brandId },
        orderBy: [{ enabled: "desc" }, { createdAt: "asc" }]
      }),
      prisma.notificationLog.findMany({
        where: { brandId },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ]);

    return {
      templates: templates.map((template) => ({
        id: template.id,
        channel: template.channel,
        key: template.key,
        name: template.name,
        content: template.content,
        enabled: template.enabled
      })),
      logs: logs.map((log) => ({
        id: log.id,
        channel: log.channel,
        recipient: log.recipient,
        status: log.status,
        content: log.content,
        provider: log.provider,
        result: log.result ?? "-",
        createdAt: formatDateTime(log.createdAt)
      })),
      source: "database"
    };
  } catch {
    return {
      templates: fallbackTemplates,
      logs: [
        {
          id: "fallback-notification-log",
          channel: "SMS",
          recipient: "13900001111",
          status: "DRY_RUN",
          content: "您好，您的预约 YY001 已确认。",
          provider: "dry-run",
          result: "演示日志",
          createdAt: "演示数据"
        }
      ],
      source: "fallback"
    };
  }
}

export async function saveNotificationTemplate(
  brandId: string,
  id: string,
  input: {
    channel: NotificationChannel;
    key: string;
    name: string;
    content: string;
    enabled: boolean;
  }
) {
  const existing = await prisma.notificationTemplate.findFirst({
    where: { id, brandId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("通知模板不存在");
  }

  const template = await prisma.notificationTemplate.update({
    where: { id },
    data: input
  });

  return {
    id: template.id,
    channel: template.channel,
    key: template.key,
    name: template.name,
    content: template.content,
    enabled: template.enabled
  };
}

export async function sendNotificationDryRun(
  brandId: string,
  input: {
    templateId?: string | null;
    channel: NotificationChannel;
    recipient: string;
    content?: string | null;
    variables?: Record<string, string>;
  }
) {
  const template = input.templateId
    ? await prisma.notificationTemplate.findFirst({
        where: { id: input.templateId, brandId }
      })
    : null;

  const content = template ? renderNotificationContent(template.content, input.variables ?? {}) : input.content ?? "";
  const draft = validateNotificationDraft({
    channel: input.channel,
    recipient: input.recipient,
    content
  });

  const log = await prisma.notificationLog.create({
    data: {
      brandId,
      templateId: template?.id ?? null,
      channel: draft.channel,
      recipient: draft.recipient,
      status: "DRY_RUN",
      content: draft.content,
      provider: "dry-run",
      result: "已进入 dry-run，不会发送真实通知"
    }
  });

  return {
    log: {
      id: log.id,
      channel: log.channel,
      recipient: log.recipient,
      status: log.status,
      content: log.content,
      provider: log.provider,
      result: log.result ?? "",
      createdAt: formatDateTime(log.createdAt)
    },
    renderedContent: draft.content
  };
}
