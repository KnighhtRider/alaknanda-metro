import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("cms_session")?.value;

  const isCMS = req.nextUrl.pathname.startsWith("/cms");
  const isLoginPage = req.nextUrl.pathname === "/cms/login";

  // If user is accessing CMS and has NO session → redirect to login
  if (isCMS && !isLoginPage && !session) {
    const loginUrl = new URL("/cms/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in user tries to open /cms/login → redirect to dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/cms", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*"],
};
