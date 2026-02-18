import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "streakman_auth";
const PUBLIC_ROUTES = new Set(["/signin"]);

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  if (pathname.includes(".")) return NextResponse.next();

  const isPublic = PUBLIC_ROUTES.has(pathname);
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (!hasSession && !isPublic) {
    const redirectURL = new URL("/signin", request.url);
    redirectURL.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectURL);
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
