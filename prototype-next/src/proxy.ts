import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/session";

const pagePrefixes = ["/dashboard", "/stores", "/staff", "/service-groups", "/products", "/orders", "/customers", "/audit-logs", "/reports", "/analytics", "/performance", "/marketing", "/photo-albums", "/notifications"];
const apiPrefixes = ["/api/stores", "/api/staff", "/api/service-groups", "/api/products", "/api/orders", "/api/customers", "/api/audit-logs", "/api/exports", "/api/imports", "/api/photo-albums", "/api/notifications"];
const publicPagePrefixes = ["/photo-albums/share"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPage = publicPagePrefixes.some((prefix) => pathname.startsWith(prefix));
  const needsPageSession = !isPublicPage && pagePrefixes.some((prefix) => pathname.startsWith(prefix));
  const needsApiSession = apiPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!needsPageSession && !needsApiSession) {
    return NextResponse.next();
  }

  const session = await verifySessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (session) {
    return NextResponse.next();
  }

  if (needsApiSession) {
    return NextResponse.json({ ok: false, message: "请先登录" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stores/:path*",
    "/staff/:path*",
    "/service-groups/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/audit-logs/:path*",
    "/reports/:path*",
    "/analytics/:path*",
    "/performance/:path*",
    "/marketing/:path*",
    "/photo-albums/:path*",
    "/notifications/:path*",
    "/api/stores/:path*",
    "/api/staff/:path*",
    "/api/service-groups/:path*",
    "/api/products/:path*",
    "/api/orders/:path*",
    "/api/customers/:path*",
    "/api/audit-logs/:path*",
    "/api/exports/:path*",
    "/api/imports/:path*",
    "/api/photo-albums/:path*",
    "/api/notifications/:path*"
  ]
};
