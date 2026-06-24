import { Prisma } from "@prisma/client";
import { auditLogDateRange, normalizeAuditLogFilters, type AuditLogFilterInput } from "@/domain/audit-log";
import { prisma } from "@/lib/prisma";

export type AuditLogRow = {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  createdAt: string;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function formatDetail(detail: Prisma.JsonValue | null) {
  if (!detail) {
    return "-";
  }

  return JSON.stringify(detail);
}

export async function recordAuditLog(input: {
  brandId: string;
  actor: string;
  action: string;
  target: string;
  detail?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      brandId: input.brandId,
      actor: input.actor,
      action: input.action,
      target: input.target,
      detail: input.detail ?? Prisma.JsonNull
    }
  });
}

export async function getAuditLogData(brandId: string, input: AuditLogFilterInput = {}) {
  const filters = normalizeAuditLogFilters(input);
  const { start, end } = auditLogDateRange(filters.date);
  const where: Prisma.AuditLogWhereInput = {
    brandId,
    createdAt: { gte: start, lt: end }
  };

  if (filters.actor) {
    where.actor = { contains: filters.actor, mode: "insensitive" };
  }

  if (filters.target) {
    where.target = { contains: filters.target, mode: "insensitive" };
  }

  try {
    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return {
      filters,
      logs: rows.map((log) => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        target: log.target,
        detail: formatDetail(log.detail),
        createdAt: formatDateTime(log.createdAt)
      })),
      source: "database" as const
    };
  } catch {
    return {
      filters,
      logs: [
        {
          id: "fallback-audit-log",
          actor: "seed",
          action: "create",
          target: "order:YY20260531001",
          detail: JSON.stringify({ source: "fallback" }),
          createdAt: "演示数据"
        }
      ],
      source: "fallback" as const
    };
  }
}
