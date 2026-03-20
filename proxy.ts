import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, getLocaleFromPathname } from "@/lib/site-content";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-site-locale", locale);

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse("Admin credentials not set", { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const b64 = auth.slice("Basic ".length);
  const [u, p] = Buffer.from(b64, "base64").toString().split(":");

  if (u !== user || p !== pass) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
