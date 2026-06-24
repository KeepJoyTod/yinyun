import type { NotificationChannel } from "@prisma/client";

export type NotificationDraftInput = {
  channel: NotificationChannel;
  recipient?: string | null;
  content?: string | null;
};

export type NotificationDraft = {
  channel: NotificationChannel;
  recipient: string;
  content: string;
};

export function renderNotificationContent(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => variables[key] ?? "");
}

function normalizeText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function validateNotificationDraft(input: NotificationDraftInput): NotificationDraft {
  const recipient = normalizeText(input.recipient);
  const content = normalizeText(input.content);

  if (!recipient) {
    throw new Error("请填写接收人");
  }

  if (!content) {
    throw new Error("请填写通知内容");
  }

  return {
    channel: input.channel,
    recipient,
    content
  };
}
