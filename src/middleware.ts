import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isSpamApp = process.env.NEXT_PUBLIC_IS_SPAM_APP === "true";

  // 1. If this is the SPAM app (port 3001, serving spam.reanswer.ru)
  if (isSpamApp) {
    // If the path starts with /spam, redirect to strip /spam prefix (clean URLs)
    if (pathname === "/spam") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/spam/")) {
      url.pathname = pathname.substring(5); // strip /spam (keeps /dashboard, /settings etc.)
      return NextResponse.redirect(url);
    }

    // Rewrite root level paths to the /spam folder internally
    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname === "/rules" ||
      pathname === "/settings" ||
      pathname === "/tariffs"
    ) {
      url.pathname = `/spam${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  } 
  // 2. If this is the MAIN app (port 3000, serving reanswer.ru)
  else {
    // If a request hits /spam or /spam/*, redirect it to spam.reanswer.ru
    if (pathname === "/spam") {
      const spamUrl = new URL("https://spam.reanswer.ru/", request.url);
      spamUrl.search = url.search;
      return NextResponse.redirect(spamUrl);
    }
    if (pathname.startsWith("/spam/")) {
      const remainingPath = pathname.substring(5); // strip /spam (keeps /dashboard, etc.)
      const spamUrl = new URL(`https://spam.reanswer.ru${remainingPath}`, request.url);
      spamUrl.search = url.search;
      return NextResponse.redirect(spamUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png (favicon files)
     * - images, logo, icons (public folder assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|.*\\..*).*)",
  ],
};
