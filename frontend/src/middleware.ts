import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const token = request.cookies.get("sb-access-token")?.value;

  // If not authenticated and trying to access a protected route, redirect to landing
  if (!isPublic && pathname.startsWith("/dashboard") && !token) {
    const landingUrl = new URL("/", request.url);
    landingUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(landingUrl);
  }

  // If authenticated and trying to access login or signup, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  // Redirect /dashboard to /dashboard/overview
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/login", "/signup"],
};
