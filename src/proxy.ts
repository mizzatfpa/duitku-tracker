import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";

/**
 * Route guard global (Next.js 16 Proxy, pengganti Middleware).
 * Cek optimis berbasis cookie; cek keamanan tetap dilakukan di Data Access
 * Layer dekat sumber data (lihat src/lib/auth/dal.ts).
 */
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get("session")?.value);
  const isAuthenticated = Boolean(session?.userId);

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Rute yang dilindungi: tanpa session valid, arahkan ke halaman masuk.
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Pengguna yang sudah masuk tidak perlu membuka halaman daftar/masuk.
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};