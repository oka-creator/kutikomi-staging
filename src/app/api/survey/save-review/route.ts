// src/app/api/survey/save-review/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();

  try {
    const { surveyResponseId, content, shopId } = body;

    // Check if a review already exists
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('survey_response_id', surveyResponseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingReview) {
      // If a review already exists, return it instead of creating a new one
      return NextResponse.json({ success: true, review: existingReview });
    }

    // If no existing review, create a new one
    const { data, error } = await supabase
      .from('reviews')
      .insert({ 
        survey_response_id: surveyResponseId, 
        content,
        shop_id: shopId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error('Error saving review:', error);
    return NextResponse.json({ error: 'レビューの保存中にエラーが発生しました。' }, { status: 500 });
  }
}