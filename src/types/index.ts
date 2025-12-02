// src/types/index.ts

// ... 既存の型定義 ...

export interface ShopData {
  id: string;
  name: string;
  monthly_review_limit: number;
  review_limit_reset_date: string;
  current_month_reviews: number;
}

export interface Survey {
  id: string;
  customerName: string;
  date: string;
  questions: {
    text: string;
    answer: string;
  }[];
}

export interface Review {
  id: string;
  content: string;
  date: string;
  survey_response_id: string;
  created_at: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'radio';
  options?: string[];
  display_on_card: boolean;
}

export interface SurveyAnswers {
  [questionId: string]: string | string[];
}

export interface SurveyResponse {
  id: string;
  created_at: string;
  answers: SurveyAnswers;
  survey_settings_id: string;
  shop_id: string;
  shops: {
    name: string;
  };
}

export interface SurveySettings {
  id: string;
  shop_id: string;
  title: string;
  questions: SurveyQuestion[];
  monthly_review_limit: number;
}

// Review インターフェースは既に定義されているので、重複を削除しました