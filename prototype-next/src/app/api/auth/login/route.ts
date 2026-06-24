import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { authenticateCredentials } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const user = await authenticateCredentials(payload);

    if (!user) {
      return NextResponse.json({ ok: false, message: "手机号或密码错误" }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: await createSessionCookieValue(user),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "登录参数错误" }, { status: 400 });
    }

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "登录失败"
      },
      { status: 500 }
    );
  }
}
