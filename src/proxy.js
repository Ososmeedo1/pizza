import createMiddleware from "next-intl/middleware";
import {NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";
import {routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/(ar|en)(?:\/|$)/);
  const hasLocale = Boolean(localeMatch);
  const cleanPath = hasLocale ? pathname.slice(localeMatch[1].length + 1) || "/" : pathname;

  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    const isAuthPage =
      cleanPath === "/admin/login" || cleanPath === "/admin/register";

    if (!isAuthPage) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.AUTH_SECRET,
        });

        if (!token) {
          const locale = hasLocale ? localeMatch[1] : routing.defaultLocale;
          const loginUrl = new URL(`/${locale}/admin/login`, request.url);
          return NextResponse.redirect(loginUrl);
        }
      } catch (error) {
        console.warn("admin guard: token check failed, redirecting", error);
        const locale = hasLocale ? localeMatch[1] : routing.defaultLocale;
        const loginUrl = new URL(`/${locale}/admin/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = intlMiddleware(request);
  response.headers.set("x-pathname", cleanPath);
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};