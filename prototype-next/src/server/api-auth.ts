import { NextResponse } from "next/server";
import { canAccess, type Permission } from "@/domain/auth";
import type { SessionPayload } from "@/lib/session";
import { getCurrentSession } from "@/server/session";

export function assertPermission(session: Pick<SessionPayload, "role">, permission: Permission) {
  if (!canAccess(session.role, [permission])) {
    throw new Error("无权限执行该操作");
  }
}

export async function requireApiPermission(permission: Permission) {
  const session = await getCurrentSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, message: "请先登录" }, { status: 401 })
    };
  }

  try {
    assertPermission(session, permission);
    return { session, response: null };
  } catch (error) {
    return {
      session: null,
      response: NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : "无权限执行该操作" },
        { status: 403 }
      )
    };
  }
}
