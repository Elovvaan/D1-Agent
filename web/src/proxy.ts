import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { D1Role } from "@d1/shared";
import { canAccessRoute, getRoleHome } from "@/lib/data/services";
import { getSafePortalRedirect } from "@/lib/domain-config";

const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "media_partner", "admin"]);

function readRole(request: NextRequest): D1Role | null {
  const cookieRole = request.cookies.get("d1_role")?.value;
  if (cookieRole && roles.has(cookieRole as D1Role)) return cookieRole as D1Role;

  const queryRole = request.nextUrl.searchParams.get("role");
  if (queryRole && roles.has(queryRole as D1Role)) return queryRole as D1Role;

  return null;
}

export function proxy(request: NextRequest) {
  const role = readRole(request);
  const { pathname } = request.nextUrl;
  const portalRedirect = getSafePortalRedirect(request.nextUrl.hostname);

  if (portalRedirect && pathname === "/") {
    return NextResponse.redirect(new URL(portalRedirect, request.url));
  }

  if (!role) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  const response = NextResponse.next();
  response.cookies.set("d1_role", role, { path: "/", sameSite: "lax" });
  return response;
}

export const config = {
  matcher: [
    "/",
    "/command-center",
    "/profile/:path*",
    "/film/:path*",
    "/highlights/:path*",
    "/recruiting/:path*",
    "/outreach/:path*",
    "/opportunities/:path*",
    "/calendar/:path*",
    "/trust/:path*",
    "/performance/:path*",
    "/settings/:path*",
    "/coach/:path*",
    "/recruiter/:path*",
    "/media/:path*",
    "/admin/:path*"
  ]
};
