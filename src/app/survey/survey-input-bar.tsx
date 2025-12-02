import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowRight } from "lucide-react";

interface SurveyInputBarProps {
  currentQuestionIndex: number;
  isSurveyCompleted: boolean;
  showSubmitButton: boolean;
  isSubmitting: boolean;
  currentAnswer: string;
  handleAnswer: (answer: string) => void;
  startSurvey: () => void;
  submitSurvey: () => void;
}

export const SurveyInputBar: React.FC<SurveyInputBarProps> = ({
  currentQuestionIndex,
  isSurveyCompleted,
  showSubmitButton,
  isSubmitting,
  currentAnswer,
  handleAnswer,
  startSurvey,
  submitSurvey,
}) => {
  return (
    <div className="p-4 bg-white shadow-lg">
      {currentQuestionIndex === -1 ? (
        <Button
          onClick={startSurvey}
          className="w-full bg-[#F2B705] hover:bg-[#F28705] text-[#262626] py-2 text-lg font-semibold"
        >
          アンケートを開始 <ArrowRight className="ml-2" size={20} />
        </Button>
      ) : !isSurveyCompleted ? (
        <div className="flex">
          <Input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            className="flex-grow mr-2 p-2 border rounded bg-white text-[#262626] border-[#F2B705] focus:border-[#F28705] focus:ring-[#F28705]"
            placeholder="回答を入力してください"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAnswer(currentAnswer);
              }
            }}
          />
          <Button
            onClick={() => handleAnswer(currentAnswer)}
            className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
          >
            <Send size={20} />
          </Button>
        </div>
      ) : showSubmitButton ? (
        <Button
          onClick={submitSurvey}
          disabled={isSubmitting}
          className="w-full bg-[#F2B705] hover:bg-[#F28705] text-[#262626] py-2 text-lg font-semibold"
        >
          {isSubmitting ? "送信中..." : "アンケートを送信"}
        </Button>
      ) : null}
    </div>
  );
};