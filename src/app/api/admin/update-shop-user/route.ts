// src/app/api/admin/update-shop-user/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("認証されていません");
    }

    // ユーザーのロールを取得
    const userRole = session.user.user_metadata?.role;

    if (userRole !== "admin") {
      throw new Error("管理者権限がありません");
    }

    // リクエストボディからデータを取得
    const requestData = await request.json();
    const { userId, email, password } = requestData;

    // 必須フィールドの検証
    if (!userId || (!email && !password)) {
      throw new Error("必要な情報が提供されていません");
    }

    // 環境変数の確認と型キャスト
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env
      .SUPABASE_SERVICE_ROLE_KEY as string;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabaseの環境変数が正しく設定されていません");
    }

    // サービスロールキーでSupabaseクライアントを初期化
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ユーザー情報の更新
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: email || undefined,
        password: password || undefined,
      });

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: "ユーザー情報が更新されました", updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("ユーザー情報更新エラー:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
