import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (
      req.nextUrl.pathname.startsWith("/survey/") ||
      req.nextUrl.pathname.startsWith("/review-confirmation") ||
      req.nextUrl.pathname.startsWith("/admin/")
    ) {
      return res;
    }
    return res; // セッションがなく、既に /auth/login にいる場合は処理を続行
  }

  const user = session.user;
  const role = user.user_metadata?.role || user.app_metadata?.role;

  if (req.nextUrl.pathname === "/auth/login") {
    switch (role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      case "shop_owner":
        try {
          const { data: shopData } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", user.id)
            .single();

          if (shopData) {
            return NextResponse.redirect(
              new URL(`/owner-dashboard/${shopData.id}`, req.url)
            );
          }
        } catch (error) {
          console.error("Shop data fetch error:", error);
        }
        // ショップが見つからない場合やエラーの場合はログインページにとどまる
        return res;
      default:
        console.error("Unknown user role:", role);
        return res;
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};
