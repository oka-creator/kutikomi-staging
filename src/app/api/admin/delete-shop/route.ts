// /app/api/admin/delete-shop/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { shopId } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: 'shopIdは必須です。' }, { status: 400 });
    }

    // ショップの削除
    const { error: shopError } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (shopError) {
      console.error('Error deleting shop:', shopError);
      return NextResponse.json({ error: 'ショップの削除に失敗しました。' }, { status: 500 });
    }

    return NextResponse.json({ message: 'ショップが正常に削除されました。' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: 'ショップの削除に失敗しました。' }, { status: 500 });
  }
}
