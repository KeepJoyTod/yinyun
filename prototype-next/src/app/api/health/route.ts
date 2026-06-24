import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "camera-studio-app",
      database: "ok",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "camera-studio-app",
        database: "error",
        message: error instanceof Error ? error.message : "health check failed",
        checkedAt: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
