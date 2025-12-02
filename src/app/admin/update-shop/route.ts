// src/app/api/admin/update-shop/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 });
    }

    const userRole = session.user.user_metadata?.role;

    if (userRole !== 'admin') {
      console.error('User role:', userRole);
      return NextResponse.json({ error: '管理者権限がありません' }, { status: 403 });
    }

    const requestData = await request.json();
    console.log('受信したリクエストデータ:', requestData);
    const { id, name, address, google_review_url, monthlyReviewLimit, newEmail, newPassword, owner_id, business_type } = requestData;

    if (!id || !name || !monthlyReviewLimit) {
      return NextResponse.json({ error: '必須フィールドが提供されていません' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase環境変数が定義されていません' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update shop data
    const shopDataToUpdate = {
      name,
      address,
      google_review_url,
      monthly_review_limit: monthlyReviewLimit,
      business_type,
    };

    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .update(shopDataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (shopError) throw shopError;

    // Update user email and/or password if provided
    if (newEmail || newPassword) {
      const userUpdateData: any = {};
      if (newEmail) userUpdateData.email = newEmail;
      if (newPassword) userUpdateData.password = newPassword;

      const { error: userUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        owner_id,
        userUpdateData
      );

      if (userUpdateError) throw userUpdateError;
    }

    return NextResponse.json({ message: 'ショップ情報が正常に更新されました', shopData });
  } catch (error: any) {
    console.error('詳細な更新エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}