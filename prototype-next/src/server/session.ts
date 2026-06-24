import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireCurrentSession() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}
