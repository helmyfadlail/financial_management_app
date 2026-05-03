import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const BYPASS_ROUTES = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password", "/reset-password/success"]);

const LOCALE_REDIRECT_ROUTES = new Set(["/admin/dashboard"]);

const hasLocalePrefix = (pathname: string): boolean => routing.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

const getDefaultLocale = (): string => routing.defaultLocale ?? routing.locales[0];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BYPASS_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (LOCALE_REDIRECT_ROUTES.has(pathname)) {
    const locale = req.cookies.get("NEXT_LOCALE")?.value ?? getDefaultLocale();
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (!hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
