import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generateReview } from "@/utils/openai";

// Vercel Pro プランで最大300秒（5分）まで実行可能
export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { surveyId } = await request.json();

    // 既存のレビューがあるかチェック
    const { data: existingReview, error: existingReviewError } = await supabase
      .from("reviews")
      .select("content")
      .eq("survey_response_id", surveyId)
      .single();

    if (existingReviewError && existingReviewError.code !== 'PGRST116') {
      throw existingReviewError;
    }

    if (existingReview) {
      return NextResponse.json({ review: existingReview.content, isExisting: true });
    }

    // survey_responses データを取得
    const { data: surveyResponse, error: surveyError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("id", surveyId)
      .single();

    if (surveyError || !surveyResponse) {
      console.error("Error fetching survey response:", surveyError);
      return NextResponse.json(
        { error: "Survey response not found" },
        { status: 404 }
      );
    }

    // 関連する survey_settings を取得
    const { data: surveySettings, error: settingsError } = await supabase
      .from("survey_settings")
      .select("*, shop:shops(*)")
      .eq("id", surveyResponse.survey_settings_id)
      .single();

    if (settingsError || !surveySettings) {
      console.error("Error fetching survey settings:", settingsError);
      return NextResponse.json(
        { error: "Survey settings not found" },
        { status: 404 }
      );
    }

    // 月間レビュー制限をチェック
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("monthly_review_limit, current_month_reviews")
      .eq("id", surveyResponse.shop_id)
      .single();

    if (shopError) {
      console.error("Error fetching shop data:", shopError);
      if (shopError.code === '42703') {
        console.warn("current_month_reviews column not found. Proceeding with default values.");
      } else {
        return NextResponse.json(
          { error: "Failed to check review limit" },
          { status: 500 }
        );
      }
    }

    const monthlyReviewLimit = shopData?.monthly_review_limit || 30;
    const currentMonthReviews = shopData?.current_month_reviews || 0;

    if (currentMonthReviews >= monthlyReviewLimit) {
      return NextResponse.json(
        { error: "Monthly review limit reached" },
        { status: 403 }
      );
    }

    const shopName = surveySettings.shop.name;
    const businessType = surveySettings.shop.business_type || "飲食店";
    const surveyAnswers = surveyResponse.answers;
    const keywords = surveySettings.keywords || [];

    // 質問IDと質問文のマッピングを作成
    const questionMap = surveySettings.questions.reduce((map: Record<string, string>, question: any) => {
      map[question.id] = question.text;
      return map;
    }, {});

    // 質問と回答のペアを作成
    const formattedResponses = Object.keys(surveyAnswers).map(questionId => ({
      question: questionMap[questionId] || "不明な質問",
      answer: surveyAnswers[questionId],
    }));

    // プロンプトテンプレートや口調の設定を取得
    const prompt_template = surveySettings.prompt_template;
    const tones = surveySettings.tones || [];
    const default_tone = surveySettings.default_tone;
    const use_random_tone = surveySettings.use_random_tone;

    // 口コミを生成
    const generatedReview = await generateReview(
      formattedResponses,
      shopName,
      keywords,
      businessType,
      prompt_template,
      tones,
      default_tone,
      use_random_tone
    );

    // 生成された口コミを保存
    const { error: saveError } = await supabase
      .from("reviews")
      .insert({ 
        survey_response_id: surveyId, 
        content: generatedReview,
        shop_id: surveyResponse.shop_id
      });

    if (saveError) {
      console.error("Error saving review:", saveError);
      throw saveError;
    }

    // current_month_reviews カウントをインクリメント
    const { error: updateError } = await supabase
      .from("shops")
      .update({ current_month_reviews: currentMonthReviews + 1 })
      .eq("id", surveyResponse.shop_id);

    if (updateError) {
      console.error("Error updating review count:", updateError);
      if (updateError.code !== '42703') {
        throw updateError;
      } else {
        console.warn("Failed to update current_month_reviews. Column might be missing.");
      }
    }

    return NextResponse.json({
      review: generatedReview,
      shopInfo: {
        name: surveySettings.shop.name,
        address: surveySettings.shop.address,
        google_review_url: surveySettings.shop.google_review_url,
      }
    });
  } catch (error) {
    console.error("Error generating review:", error);
    
    // エラーの詳細情報を取得
    let errorMessage = "レビューの生成中にエラーが発生しました。";
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // OpenAIのタイムアウトエラーを判定
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        errorMessage = "AIの応答に時間がかかりすぎています。しばらく待ってから再度お試しください。";
        statusCode = 504;
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = "AI生成の利用制限に達しています。しばらく待ってから再度お試しください。";
        statusCode = 429;
      } else if (error.message.includes('API key')) {
        errorMessage = "AI生成サービスの設定に問題があります。管理者にお問い合わせください。";
        statusCode = 502;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined 
      },
      { status: statusCode }
    );
  }
}
