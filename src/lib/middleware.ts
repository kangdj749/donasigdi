import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ref = url.searchParams.get("ref");

  const res = NextResponse.next();

  if (ref) {
    res.cookies.set("campaign_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return res;
}

/* optional: hanya jalan di campaign */
export const config = {
  matcher: ["/campaign/:path*"],
};