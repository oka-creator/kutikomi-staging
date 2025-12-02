// app/api/cron-reset-review-limit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from 'src/lib/supabaseAdmin'; // 要・環境に応じて実装
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Vercel Pro プランで最大300秒（5分）まで実行可能
export const maxDuration = 300;

// dayjs拡張プラグインを適用
dayjs.extend(utc);
dayjs.extend(timezone); // timezone プラグインも適用 (calculateNextMonthDate で使う可能性を考慮)

export async function GET(request: NextRequest) {
  // 1) Cronの認証 (vercel-cron 以外のアクセスは拒否)
  const userAgent = request.headers.get('user-agent');
  if (userAgent !== 'vercel-cron/1.0') {
    console.error('不正なアクセス試行');
    return NextResponse.json({ error: '認証されていません' }, { status: 401 });
  }

  console.log(`[${new Date().toISOString()}] リセットCronジョブを開始します...`);

  try {
    // 1.5) まず全ショップ数を確認
    const { count: totalShops, error: countError } = await supabaseAdmin
      .from('shops')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('全ショップ数の取得中にエラーが発生:', countError);
    } else {
      console.log(`データベース内の全ショップ数: ${totalShops}`);
    }

    // 2) shopsテーブルから必要なカラムのみ取得 - 制限を大幅に増加
    const { data: shops, error: selectError } = await supabaseAdmin
      .from('shops')
      .select('id, review_limit_reset_date') // <--- 修正: 必要なカラムのみ選択
      .limit(10000); // <--- 修正: 取得上限を10000件に増加

    if (selectError) {
      console.error('shopsテーブルの取得中にエラーが発生:', selectError);
      return NextResponse.json(
        { error: 'shopsテーブルの取得に失敗しました' },
        { status: 500 }
      );
    }

    if (!shops || shops.length === 0) {
      console.log('リセット対象のショップが見つかりませんでした。');
      return NextResponse.json(
        { message: 'リセット対象のショップなし' },
        { status: 200 }
      );
    }

    console.log(`取得したショップ数: ${shops.length}/${totalShops || '不明'}`);
    if (totalShops && shops.length < totalShops) {
      console.warn(`⚠️ 警告: 全ショップ数 (${totalShops}) より取得数 (${shops.length}) が少ないです。制限値を確認してください。`);
    }

    const now = dayjs.utc();
    const updatePromises: Promise<any>[] = []; // 更新処理のPromiseを格納する配列
    const targetShopIds: string[] = []; // リセット対象のショップIDを記録

    // 3) リセット対象を判定し、更新Promiseを作成
    for (const shop of shops) {
      // review_limit_reset_date が null または "今日以前" ならリセットを実行
      const resetDateUtc = shop.review_limit_reset_date ? dayjs.utc(shop.review_limit_reset_date) : null;
      if (!resetDateUtc || resetDateUtc.isBefore(now, 'day') || resetDateUtc.isSame(now, 'day')) {

        // nullの場合や過去日付の場合は、今日を基準に次回リセット日を計算
        const baseDate = resetDateUtc || now;
        const nextResetDate = calculateNextMonthDate(baseDate); // calculateNextMonthDateは既存の関数を使用

        console.log(`ショップ ${shop.id} をリセットします。次回リセット日: ${nextResetDate.format('YYYY-MM-DD')}`);

        // 更新処理のPromiseを作成し、配列に追加
        const updatePromise = supabaseAdmin
          .from('shops')
          .update({
            current_month_reviews: 0,
            review_limit_reset_date: nextResetDate.format('YYYY-MM-DD'),
          })
          .eq('id', shop.id);

        updatePromises.push(updatePromise as any); // <--- Cast to any to resolve TS error
        targetShopIds.push(shop.id); // リセット対象ショップIDを記録
      }
    }

    if (updatePromises.length === 0) {
        console.log('今回リセットが必要なショップはありませんでした。');
        return NextResponse.json(
            { message: 'リセット対象のショップなし' },
            { status: 200 }
        );
    }

    console.log(`リセット対象のショップ数: ${updatePromises.length}`);

    // 4) 更新処理を並列実行
    const results = await Promise.allSettled(updatePromises);

    let successCount = 0;
    let failureCount = 0;
    const failedShopIds: string[] = []; // 失敗したショップIDを記録

    // 5) 結果を確認 - 失敗したショップの詳細をログ出力
    results.forEach((result, index) => {
      const shopId = targetShopIds[index];
      
      if (result.status === 'fulfilled') {
        // result.value には Supabase からの更新結果が入る
        const supabaseResult = result.value;
        if (supabaseResult.error) {
          // Supabaseレベルでのエラー
          console.error(`❌ ショップ ${shopId} の更新でSupabaseエラー:`, supabaseResult.error);
          failureCount++;
          failedShopIds.push(shopId);
        } else {
          console.log(`✅ ショップ ${shopId} のリセット完了`);
          successCount++;
        }
      } else {
        // Promise自体が失敗
        console.error(`❌ ショップ ${shopId} の更新でPromiseエラー:`, result.reason);
        failureCount++;
        failedShopIds.push(shopId);
      }
    });

    console.log(`リセット処理結果: 成功 ${successCount}件, 失敗 ${failureCount}件`);
    
    if (failureCount > 0) {
        console.error(`❌ 失敗したショップID一覧: [${failedShopIds.join(', ')}]`);
        console.error(`${failureCount}件のショップ更新に失敗しました。詳細は上記のログを確認してください。`);
        
        // 一部成功している場合は警告として207 Multi-Statusを返す
        return NextResponse.json({
          warning: `${failureCount}件の更新に失敗しました。`,
          successCount,
          failureCount,
          failedShopIds,
          totalProcessed: updatePromises.length
        }, { status: 207 }); // Multi-Status
    }

    console.log('✅ リセットCronジョブが正常に完了しました。');
    return NextResponse.json(
      { 
        message: `リセットCronジョブ完了 (${successCount}件更新)`,
        successCount,
        totalProcessed: updatePromises.length,
        totalShopsInDB: totalShops
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ リセットCronジョブ中に予期せぬエラーが発生:', err);
    return NextResponse.json(
      { error: 'リセットCronジョブ中に予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}

// calculateNextMonthDate 関数は変更なし (既存のものをそのまま使用)
/**
 * 「次回リセット日」を計算する関数
 *
 * ここでは:
 *  - 「現在の resetDate と同じ日」を nextMonth に確保できない場合は、月末を採用
 *  - UTCで計算
 *  - 例: 1/31 に +1ヶ月 => 2月末(2/29 or 2/28など)に自動的に丸め
 */
function calculateNextMonthDate(resetDate: dayjs.Dayjs): dayjs.Dayjs {
  const nextMonth = resetDate.add(1, 'month');
  // 例: dayjs('2024-01-31').add(1,'month') => '2024-02-29' (うるう年は29日)
  //     存在しない日付だった場合、Day.jsは自動で月末に丸める(2/28, 2/29など)

  // さらにタイムゾーンを固定する場合:
  //   .tz('Asia/Tokyo') などを適用
  return nextMonth.utc().startOf('day');
}
