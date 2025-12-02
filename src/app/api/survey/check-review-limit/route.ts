import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId');

  if (!shopId) {
    return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
  }

  try {
    // Get shop details
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('monthly_review_limit, review_limit_reset_date')
      .eq('id', shopId)
      .single();

    if (shopError) throw shopError;

    const currentDate = new Date();
    const resetDate = new Date(shopData.review_limit_reset_date);

    // Check if it's time to reset the counter
    if (currentDate > resetDate) {
      // Reset the counter and update the reset date
      const nextResetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      await supabase
        .from('shops')
        .update({ review_limit_reset_date: nextResetDate.toISOString() })
        .eq('id', shopId);

      // Reset the review count (you might need to add a new field for this)
      // For now, we'll just consider the count as 0
      return NextResponse.json({ 
        isLimitReached: false, 
        currentCount: 0, 
        limit: shopData.monthly_review_limit,
        remainingReviews: shopData.monthly_review_limit
      });
    }

    // If it's not time to reset, proceed with the normal check
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

    const { count, error: reviewError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (reviewError) throw reviewError;

    const isLimitReached = count !== null && count >= shopData.monthly_review_limit;
    const remainingReviews = Math.max(0, shopData.monthly_review_limit - (count || 0));

    return NextResponse.json({ 
      isLimitReached, 
      currentCount: count, 
      limit: shopData.monthly_review_limit,
      remainingReviews
    });
  } catch (error) {
    console.error('Error checking review limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}