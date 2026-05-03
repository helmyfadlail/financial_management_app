import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const BYPASS_ROUTES = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password", "/reset-password/success"]);

const hasLocalePrefix = (pathname: string): boolean => routing.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (!hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
