import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { name, address, google_review_url, business_type } = await req.json();

    // 認証されたユーザーの取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ショップの登録
    const { data, error } = await supabase
      .from('shops')
      .insert({
        name,
        address,
        google_review_url,
        business_type,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Shop registration error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}