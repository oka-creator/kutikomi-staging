import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 認証されたユーザーの取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ショップとレビューのデータを取得
    const { data: shopsData, error: shopsError } = await supabase
      .from('shops')
      .select('id, business_type, reviews(content, created_at)')
      .order('id');

    if (shopsError) throw shopsError;

    const totalShops = shopsData.length;
    const totalReviews = shopsData.reduce((acc, shop) => acc + shop.reviews.length, 0);

    // 業種別ショップ数のデータを作成
    const businessTypes = shopsData.reduce((acc, shop) => {
      const type = ['restaurant', 'retail', 'service'].includes(shop.business_type) 
        ? shop.business_type 
        : 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const businessTypeData = {
      labels: Object.keys(businessTypes),
      datasets: [{
        label: '業種別ショップ数',
        data: Object.values(businessTypes),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      }],
    };

    // 月別口コミ数のデータを作成
    const monthlyReviews = processMonthlyData(shopsData.flatMap(shop => shop.reviews));
    const monthlyReviewData = {
      labels: monthlyReviews.labels,
      datasets: [{
        label: '月別口コミ数',
        data: monthlyReviews.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    };



    return NextResponse.json({
      totalShops,
      totalReviews,
      businessTypeData,
      monthlyReviewData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function processMonthlyData(reviews: { created_at: string }[]) {
  // 過去6ヶ月分のデータを準備
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i)); // 古い月から新しい月の順に
    return date;
  });

  // 月ごとのカウントを初期化
  const monthlyCount: Record<string, number> = {};
  
  // 各月のラベルを日本語で作成し、カウントを0で初期化
  last6Months.forEach(date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}年${month}月`;
    monthlyCount[key] = 0;
  });
  
  // レビューをカウント
  reviews.forEach(review => {
    const date = new Date(review.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}年${month}月`;
    
    // 過去6ヶ月のデータのみカウント
    if (key in monthlyCount) {
      monthlyCount[key]++;
    }
  });

  // 日本語の月名を保持したまま、古い月から新しい月の順に並べる
  const sortedLabels = Object.keys(monthlyCount);
  const sortedData = sortedLabels.map(label => monthlyCount[label]);

  return {
    labels: sortedLabels,
    data: sortedData,
  };
}