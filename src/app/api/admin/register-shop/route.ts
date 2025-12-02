// src/app/api/admin/register-shop/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // セッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません');
    }

    // ユーザーのロールを取得
    const userRole = session.user.user_metadata?.role;

    if (userRole !== 'admin') {
      console.error('User role:', userRole);
      throw new Error('管理者権限がありません');
    }

    // リクエストボディからフォームデータを取得
    const requestData = await request.json();
    console.log('受信したリクエストデータ:', requestData);
    const { name, address, google_review_url, email, password, businessType } = requestData;

    // 必須フィールドの検証
    if (!name || !email || !password) {
      throw new Error('必須フィールドが提供されていません');
    }

    // 環境変数の確認と型キャスト
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URLが定義されていません。環境変数を確認してください。');
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEYが定義されていません。環境変数を確認してください。');
    }

    // サービスロールキーでSupabaseクライアントを初期化
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 新しいユーザー（ショップオーナー）の作成
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'shop_owner' },
    });

    if (createUserError) throw createUserError;

    if (!newUser || !newUser.user) {
      throw new Error('新規ユーザーの作成に失敗しました');
    }

    // ショップデータの挿入
    const shopDataToInsert = {
      name,
      address,
      google_review_url,
      owner_id: newUser.user.id,
      business_type: businessType,
    };
    console.log('挿入するショップデータ:', shopDataToInsert);

    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .insert(shopDataToInsert)
      .select()
      .single();

    if (shopError) throw shopError;

    return NextResponse.json(
      { message: 'ショップが正常に登録されました', shopData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('詳細な登録エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
