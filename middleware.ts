import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = [""];
const publicRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Treat as protected if it's the root path exactly, or starts with a protected route (excluding exact match to public routes)
  // Easiest fix: if it's a public route, it cannot be a protected route.
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => path === route || (route !== "/" && path.startsWith(route))) && !isPublicRoute;

  // Extract session cookie
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect to login if accessing protected route without a valid session
  // if (isProtectedRoute && !session?.userId) {
  //   return NextResponse.redirect(new URL("/login", req.nextUrl));
  // }

  // Redirect to dashboard if logged in user tries to visit public routes like login/register
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg$).*)"],
};
