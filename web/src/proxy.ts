import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { D1Role } from "@d1/shared";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canAccessRoute, getRoleHome } from "@/lib/data/services";

const roles = new Set<D1Role>(["athlete", "coach", "recruiter", "media_partner", "admin"]);
const protectedPrefixes = [
  "/command-center",
  "/profile",
  "/performance",
  "/trust",
  "/recruiting",
  "/opportunities",
  "/messages",
  "/calendar",
  "/coach",
  "/recruiter",
  "/media",
  "/admin",
  "/settings",
  "/film",
  "/highlights",
  "/outreach",
  "/onboarding"
];

function readRole(request: NextRequest): D1Role | null {
  const cookieRole = request.cookies.get("d1_role")?.value;
  if (cookieRole && roles.has(cookieRole as D1Role)) return cookieRole as D1Role;

  const queryRole = request.nextUrl.searchParams.get("role");
  if (queryRole && roles.has(queryRole as D1Role)) return queryRole as D1Role;

  return null;
}

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectToSignIn(request: NextRequest) {
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
}

function publicAthleteProfileIsVisible() {
  try {
    const profilePath = resolve(process.cwd(), "..", "data", "user-state", "profile.json");
    if (!existsSync(profilePath)) return false;
    const profile = JSON.parse(readFileSync(profilePath, "utf8")) as { visibility?: string };
    return profile.visibility === "public";
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const role = readRole(request);
  const { pathname } = request.nextUrl;

  if (!role) {
    if (pathname.startsWith("/athletes/")) {
      return publicAthleteProfileIsVisible() ? NextResponse.next() : redirectToSignIn(request);
    }

    if (isProtectedPath(pathname)) {
      return redirectToSignIn(request);
    }

    return NextResponse.next();
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
    "/athletes/:path*",
    "/command-center",
    "/profile/:path*",
    "/film/:path*",
    "/highlights/:path*",
    "/recruiting/:path*",
    "/outreach/:path*",
    "/opportunities/:path*",
    "/messages/:path*",
    "/calendar/:path*",
    "/trust/:path*",
    "/performance/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/coach/:path*",
    "/recruiter/:path*",
    "/media/:path*",
    "/admin/:path*"
  ]
};
