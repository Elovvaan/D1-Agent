import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { D1Role } from "@d1/shared";
import { canAccessRoute, getRoleHome } from "@/lib/data/services";

const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "admin"]);

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

  if (!role) {
    return NextResponse.next();
  }

  if (pathname === "/command-center") {
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
  matcher: ["/", "/command-center", "/coach/:path*", "/recruiter/:path*", "/admin/:path*"]
};
