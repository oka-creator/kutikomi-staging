// src/utils/surveyDb.ts

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  }
  
  export interface SurveyData {
    id?: string; // saveの時点ではidがない場合がある
    shopId: string;
    answers: { [questionId: string]: string | string[] };
    generatedReview: string;
    keywords: string[];
    questions: SurveyQuestion[];
  }
  
  // 仮想的なデータベース
  const surveyResults: { [key: string]: SurveyData } = {};
  
  export async function saveSurveyResult(result: SurveyData): Promise<string> {
    const id = generateUniqueId();
    surveyResults[id] = { ...result, id };
    return id;
  }
  
  export async function getResultById(id: string): Promise<SurveyData | null> {
    return surveyResults[id] || null;
  }
  
  // ユニークIDを生成する関数
  function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }