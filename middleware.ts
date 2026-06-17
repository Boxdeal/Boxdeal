import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/checkout", "/orders", "/account", "/wishlist"];
const ADMIN_ROUTES     = ["/admin"];

interface CookieOptions {
  name: string;
  value: string;
  options?: {
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
  };
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieOptions[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Build a redirect that CARRIES the auth cookies refreshed above. Without
  // this, a refresh-token rotation that coincides with a redirect loses the
  // new cookie, invalidating the session and bouncing the user to /login
  // repeatedly.
  const redirectTo = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  // Protect user routes
  const needsAuth = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (needsAuth && !user) {
    return redirectTo(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  // Protect admin routes
  const needsAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (needsAdmin) {
    if (!user) {
      return redirectTo(new URL("/login", request.url));
    }
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return redirectTo(new URL("/", request.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === "/login" && user) {
    const redirect = request.nextUrl.searchParams.get("redirect") ?? "/account";
    return redirectTo(new URL(redirect, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)).*)",
  ],
};
