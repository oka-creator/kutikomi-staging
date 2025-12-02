// app/api/admin/update-shop/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { updateShop } from '@/lib/shop'; // この関数をlib/shop.tsから正しくインポートしてください

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // セッションと管理者権限のチェック
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.user_metadata.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const { shopId, shopData, ownerData } = await request.json();

  try {
    const updatedShop = await updateShop(session.user.id, shopId, shopData, ownerData);
    return NextResponse.json({ message: '更新が完了しました', shop: updatedShop });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: '更新中にエラーが発生しました' }, { status: 500 });
  }
}