import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/session";

export async function GET() {
  const session = await getCurrentSession();

  return NextResponse.json({
    ok: Boolean(session),
    session
  });
}
