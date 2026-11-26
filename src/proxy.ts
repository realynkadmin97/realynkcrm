import { hostIsAllowed } from "@/lib/env";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!hostIsAllowed(request.headers.get("host"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/session/end")
  ) {
    return NextResponse.next();
  }
  if (!request.cookies.get("crm_session")?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
