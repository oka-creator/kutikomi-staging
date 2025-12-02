// src/components/SurveyForm.tsx
'use client'

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import useSurvey, { SurveyQuestion, SurveyAnswers, SurveyResponse } from '@/hooks/useSurvey';
import { Button } from "@/components/ui/button";
import Question from '@/components/Question';
import Navigation from '@/components/Navigation';
import ProgressBar from '@/components/ProgressBar';

const SurveyForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
      questions,
      currentIndex,
      setAnswer,
      nextQuestion,
      prevQuestion,
      isLastQuestion,
      submitSurvey
    } = useSurvey();
    const [answers, setAnswers] = useState<SurveyAnswers>({});
    const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const shopId = searchParams?.get('shopId') ?? '';
      const surveyResult: SurveyResponse = await submitSurvey();

      const surveyResponse = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          shopId: shopId || surveyResult.shopId
        }),
      });

      if (!surveyResponse.ok) {
        throw new Error('アンケートの送信に失敗しました');
      }

      const { surveyId } = await surveyResponse.json();
      router.push(`/review-confirmation?surveyId=${surveyId}`);
    } catch (error) {
      console.error('Error submitting survey:', error);
      // エラー処理（UIにエラーメッセージを表示するなど）
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (value: string | string[]) => {
    if (currentQuestion) {
        setAnswer(currentIndex, value as string | string[]);
    }
  };

  if (!currentQuestion) {
    return <div>質問が見つかりません</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <Question
        question={currentQuestion}
        answer={answers[currentQuestion.id] || ''}
        setAnswer={handleAnswer}
      />
      <Navigation
        onPrev={prevQuestion}
        onNext={isLastQuestion ? handleSubmit : nextQuestion}
        showPrev={currentIndex > 0}
        showNext={true}
      />
      {isLastQuestion && (
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '送信'}
        </Button>
      )}
    </div>
  );
};

export default SurveyForm;