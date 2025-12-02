import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId');
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // セッションチェックを追加
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '認証されていません', redirectToLogin: true }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('survey_settings')
      .select('*')
      .eq('shop_id', shopId)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching survey settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // セッションチェックを追加
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '認証されていません', redirectToLogin: true }, { status: 401 });
    }

    const settings = await request.json();
    console.log('保存しようとしている設定:', settings); // デバッグログ追加
    
    // 既存の設定を確認
    const { data: existingSettings, error: fetchError } = await supabase
      .from('survey_settings')
      .select('id')
      .eq('shop_id', settings.shop_id)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('既存設定の確認エラー:', fetchError);
      throw fetchError;
    }
    
    // 既存のIDがあれば設定に追加（上書き用）
    if (existingSettings?.id && !settings.id) {
      settings.id = existingSettings.id;
    }
    
    // upsertで保存（idがあれば更新、なければ挿入）
    const { data, error } = await supabase
      .from('survey_settings')
      .upsert({
        ...settings,
        image_url: settings.image_url || null, // 画像URLがない場合はnullを設定
        updated_at: new Date().toISOString() // 更新日時を追加
      })
      .select();

    if (error) {
      console.error('設定保存エラー:', error);
      throw error;
    }

    console.log('保存成功:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving survey settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}