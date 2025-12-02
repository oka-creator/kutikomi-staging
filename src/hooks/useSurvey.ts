// src/hooks/useSurvey.ts

import { useState } from 'react';
import { API_URL } from '@/config';

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  }
  
  export interface SurveyAnswers {
    [questionId: string]: string | string[];
  }
  
  export interface SurveyResponse {
    id: string;
    shopId: string;
  }
  
  export interface SurveyHookResult {
    questions: SurveyQuestion[];
    currentIndex: number;
    answers: SurveyAnswers;
    setAnswer: (questionId: string, answer: string | string[]) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    isLastQuestion: boolean;
    submitSurvey: () => Promise<SurveyResponse>;
  }
  
// Question インターフェースを定義（既に定義されている場合は省略可）
interface Question {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  }

const questions: Question[] = [
    { id: 'q1', text: '年齢を教えてください', type: 'radio', options: ['10代', '20代', '30代', '40代', '50代以上'] },
    { id: 'q2', text: '興味のある分野を選んでください（複数選択可）', type: 'checkbox', options: ['技術', 'デザイン', 'マーケティング', '経営', 'その他'] },
    { id: 'q3', text: 'このサービスをどのように知りましたか？', type: 'text' },
  ];

const useSurvey = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>(questions.map(() => ''));

  const setAnswer = (index: number, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  const submitSurvey = async (): Promise<SurveyResponse> => {
    try {
      const response = await fetch(`${API_URL}/submit-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      const data: SurveyResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting survey:', error);
      throw error;
    }
  };
  return {
    questions,
    currentIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    isLastQuestion,
    submitSurvey,
  };
};

export default useSurvey;