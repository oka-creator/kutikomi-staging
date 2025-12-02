// openai.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 280000, // 280秒のタイムアウト設定（Proプラン300秒制限内で余裕を持った設定）
  maxRetries: 3, // 失敗時のリトライ回数
});

export async function generateReview(
  surveyResponses: { question: string; answer: string }[],
  shopName: string,
  keywords: string[],
  businessType: string,
  prompt_template: string,
  tones: string[],
  default_tone: string,
  use_random_tone: boolean
): Promise<string> {
  try {
    // アンケート回答をログ出力
    console.log("受け取ったアンケート回答:", surveyResponses);

    // アンケート回答の順序をランダムに並び替える
    const shuffledResponses = [...surveyResponses].sort(
      () => Math.random() - 0.5
    );

    // シャッフル後のアンケート回答をログ出力
    console.log("シャッフル後のアンケート回答:", shuffledResponses);

    // アンケート回答をフォーマット
    const formattedResponses = shuffledResponses
      .map((response) => `・${response.question}\n  - ${response.answer}`)
      .join("\n\n");

    // フォーマットしたアンケート回答をログ出力
    console.log("フォーマットしたアンケート回答:\n", formattedResponses);

    // キーワードをログ出力
    console.log("受け取ったキーワード:", keywords);

    // キーワードの順序をランダムに並び替える
    const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);

    // シャッフル後のキーワードをログ出力
    console.log("シャッフル後のキーワード:", shuffledKeywords);

    // 利用可能な口調を設定
    const availableTones =
      tones.length > 0
        ? tones
        : [
            "敬体（です・ます調）",
            "カジュアルな口語体",
            "親しみやすいフレンドリーな口調",
            "情緒的で感情豊かな表現",
          ];

    // 選択された口調を設定
    let selectedTone: string;
    if (use_random_tone) {
      selectedTone =
        availableTones[Math.floor(Math.random() * availableTones.length)];
    } else {
      selectedTone = default_tone || availableTones[0];
    }

    // 選択された口調をログ出力
    console.log("選択された口調:", selectedTone);

    // プロンプトテンプレートにプレースホルダを埋め込む
    const editablePrompt = prompt_template
      .replace("{tone}", selectedTone)
      .replace("{keywords}", shuffledKeywords.join("、"));

    // 固定部分を定義
    const fixedPrompt = `アンケート回答：
{formattedResponses}

この情報を基に、魅力的な口コミを生成してください。キーワードはランダムで3つは必ず含めてください。`;

    // 全体のプロンプトを組み立て
    const prompt = `${editablePrompt}\n\n${fixedPrompt}`.replace(
      "{formattedResponses}",
      formattedResponses
    );

    // プロンプトをログ出力
    console.log("生成されたプロンプト:\n", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 最新のGPT-4モデルを使用
      messages: [
        {
          role: "system",
          content:
            "あなたは経験豊富な口コミライターです。簡潔で信頼性の高い口コミを書くのが得意です。キーワードを3つ程度使用し、指定された文字数制限を厳守してください。過去の口コミは参照せず、提供された情報のみを使用してください。口コミの冒頭に店舗名を含めないでください。",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 600, // トークン数を削減して応答時間を短縮
      temperature: 0.7, // 応答時間を短縮するため温度を下げる
       // より効率的な生成のためtop_pを追加
    });

    const generatedReview =
      response.choices[0].message.content || "口コミを生成できませんでした。";

    // 生成された口コミをログ出力
    console.log("生成された口コミ:\n", generatedReview);

    // キーワードの使用確認
    const usedKeywords = keywords.filter((keyword) =>
      generatedReview.includes(keyword)
    );

    // 使用されたキーワードをログ出力
    console.log("生成された口コミに含まれているキーワード:", usedKeywords);

    if (usedKeywords.length < 3) {
      console.warn(
        `生成された口コミに含まれているキーワードの数が不足しています: ${usedKeywords.length}個`
      );
    }

    return generatedReview;
  } catch (error) {
    console.error("Error generating review:", error);
    throw error;
  }
}
