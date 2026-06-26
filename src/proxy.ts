import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session on every admin request and blocks
 * unauthenticated access to /admin (except the login page). Fine-grained admin
 * authorization (fg_admins membership) is enforced again in the admin layout
 * and in every server action — this is defense in depth.
 *
 * Uses the Next.js 16 `proxy` convention (the successor to `middleware`).
 */
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        toSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  if (path.startsWith("/admin") && !isLogin && !user) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
