"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Bot, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Head from "next/head";
import styles from "./survey.module.css";

interface SurveyQuestion {
  id: string;
  type: "text" | "radio" | "checkbox";
  text: string;
  options?: string[];
  isRandom: boolean;
  group?: string;
}

interface SurveySettings {
  id: string;
  title: string;
  description: string;
  intro_message: string;
  outro_message: string;
  questions: SurveyQuestion[];
  shop_id: string;
  num_random_questions: {
    min: number;
    max: number;
  };
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
}

interface Message {
  id: string;
  type: "bot" | "user";
  content: string | JSX.Element;
}

export default function SurveyPage() {
  const params = useParams();
  const shopId = params.shopId as string;

  const [settings, setSettings] = useState<SurveySettings | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SurveyQuestion[]>([]);

  const router = useRouter();
  const supabase = createClientComponentClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkReviewLimit();
        await fetchSettings();
      } catch (error) {
        console.error("Error during initial data fetch:", error);
        setErrorMessage(
          "データの取得中にエラーが発生しました。ページを再読み込みしてください。"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // メッセージ更新時に常に最下部へスクロール
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkReviewLimit = async () => {
    try {
      const response = await fetch(
        `/api/survey/check-review-limit?shopId=${shopId}`
      );
      if (!response.ok) {
        throw new Error("Failed to check review limit");
      }
      const data = await response.json();
      if (data.isLimitReached) {
        router.push("/survey/limit-reached");
      } else {
        console.log(`残りのレビュー数: ${data.remainingReviews}`);
      }
    } catch (error) {
      console.error("Error checking review limit:", error);
      throw error;
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_settings")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error("No survey settings found for this shop");

      setSettings(data);
      const numRandomQuestions = data.num_random_questions || {
        min: 0,
        max: 0,
      };
      const randomQuestions = selectRandomQuestions(
        data.questions,
        numRandomQuestions
      );
      setSelectedQuestions(randomQuestions);
      setMessages([
        { id: `bot-${Date.now()}`, type: "bot", content: data.intro_message },
      ]);
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  };

  const selectRandomQuestions = (
    questions: SurveyQuestion[],
    numRandom: { min: number; max: number }
  ) => {
    const groupMap: { [key: string]: SurveyQuestion[] } = {};
    const ungroupedRandomQuestions: SurveyQuestion[] = [];
    const ungroupedNonRandomQuestions: SurveyQuestion[] = [];

    questions.forEach((question) => {
      if (question.group) {
        if (!groupMap[question.group]) {
          groupMap[question.group] = [];
        }
        groupMap[question.group].push(question);
      } else if (question.isRandom) {
        ungroupedRandomQuestions.push(question);
      } else {
        ungroupedNonRandomQuestions.push(question);
      }
    });

    // グループごとに1つの質問をランダムに選択
    const selectedGroupQuestions: SurveyQuestion[] = [];
    for (const group in groupMap) {
      const groupQuestions = groupMap[group];
      const randomIndex = Math.floor(Math.random() * groupQuestions.length);
      selectedGroupQuestions.push(groupQuestions[randomIndex]);
    }

    // ランダム質問を指定された範囲で選択
    const totalRandomQuestions = ungroupedRandomQuestions.length;
    const min = Math.min(numRandom.min, totalRandomQuestions);
    const max = Math.min(numRandom.max, totalRandomQuestions);
    const numToSelect = Math.floor(Math.random() * (max - min + 1)) + min;

    let selectedRandomQuestions: SurveyQuestion[] = [];
    if (numToSelect > 0) {
      const shuffled = ungroupedRandomQuestions.sort(() => 0.5 - Math.random());
      selectedRandomQuestions = shuffled.slice(0, numToSelect);
    }

    // 全ての質問を結合
    const allQuestions = [
      ...selectedGroupQuestions,
      ...ungroupedNonRandomQuestions,
      ...selectedRandomQuestions,
    ];

    // 質問の順序を元の順序に従ってソート
    allQuestions.sort((a, b) => questions.indexOf(a) - questions.indexOf(b));

    return allQuestions;
  };

  const addMessage = (type: "bot" | "user", content: string | JSX.Element) => {
    setMessages((prev) => [
      ...prev,
      { id: `${type}-${Date.now()}-${Math.random()}`, type, content },
    ]);
  };

  const handleAnswer = (answer: string | string[]) => {
    setCurrentAnswer(answer);
    submitAnswer(answer);
  };

  const submitAnswer = (answer: string | string[]) => {
    if (settings && selectedQuestions.length > 0) {
      const currentQuestion = selectedQuestions[currentQuestionIndex];
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
      addMessage("user", Array.isArray(answer) ? answer.join(", ") : answer);

      if (currentQuestionIndex < selectedQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentAnswer("");
        setTimeout(() => {
          addMessage("bot", selectedQuestions[currentQuestionIndex + 1].text);
        }, 500);
      } else {
        setIsSurveyCompleted(true);
        addMessage("bot", settings.outro_message);
        setShowSubmitButton(true);
      }
    }
  };

  const startSurvey = () => {
    if (selectedQuestions.length > 0) {
      setCurrentQuestionIndex(0);
      addMessage("bot", selectedQuestions[0].text);
    } else {
      setErrorMessage("アンケートの質問が設定されていません。");
    }
  };

  const submitSurvey = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (!settings) {
        throw new Error("Survey settings are missing");
      }

      const { data, error } = await supabase
        .from("survey_responses")
        .insert({
          shop_id: settings.shop_id,
          answers: answers,
          submitted_at: new Date().toISOString(),
          survey_settings_id: settings.id,
        })
        .select();

      if (error) {
        console.error("Error submitting survey:", error);
        throw error;
      }

      console.log("Survey submitted successfully", data);
      router.push(`/review-confirmation?surveyId=${data[0].id}`);
    } catch (error) {
      console.error("Error submitting survey:", error);
      setErrorMessage(
        "アンケートの送信中にエラーが発生しました。後でもう一度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const primaryColor = settings?.primary_color || "#F2B705";
    const secondaryColor = settings?.secondary_color || "#FFF9E5";
    const textColor = settings?.text_color || "#262626";

    switch (question.type) {
      case "radio":
      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full text-left justify-start bg-white hover:bg-[#FFF9E5] border-[#F2B705]"
                style={{ 
                  height: "40px",
                  borderColor: primaryColor,
                  color: textColor,
                  backgroundColor: "white"
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        );
      case "text":
        return null;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>アンケート設定が見つかりません。</p>
      </div>
    );
  }

  // 選択肢数に応じたパディング計算
  // 基本パディングを14rem(約224px)とした場合、オプション1つにつき40px追加
  const currentOptionsCount = selectedQuestions[currentQuestionIndex]?.options?.length ?? 0;
  const basePaddingBottom = 60; // 14rem相当(1rem=16px換算)
  const dynamicPaddingBottom = basePaddingBottom + (currentOptionsCount * 40);

  // カラー設定の取得とデフォルト値の設定
  const primaryColor = settings.primary_color || "#F2B705";
  const secondaryColor = settings.secondary_color || "#FFF9E5";
  const accentColor = settings.accent_color || "#F28705";
  const textColor = settings.text_color || "#262626";

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no"
        />
      </Head>
      <div className={`${styles.container} flex flex-col h-screen`} style={{ backgroundColor: secondaryColor }}>
        {/* 固定ヘッダーエリア */}
        <div className="fixed top-0 left-0 right-0 z-10 shadow-md" style={{ backgroundColor: primaryColor }}>
          <header className="p-4">
            <h1 className="text-2xl font-bold" style={{ color: textColor }}>{settings?.title}</h1>
            <p className="text-sm" style={{ color: textColor }}>{settings?.description}</p>
          </header>
          <Progress
            value={((currentQuestionIndex + 1) / (selectedQuestions.length || 1)) * 100}
            className="w-full h-2"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>

        {/* チャット表示領域 */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 pt-[11rem]`}
          style={{ paddingBottom: `${dynamicPaddingBottom}px`, backgroundColor: secondaryColor }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.type === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`flex items-end ${
                    message.type === "bot" ? "flex-row" : "flex-row-reverse"
                  } space-x-3`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center`}
                    style={{ 
                      backgroundColor: message.type === "bot" ? primaryColor : accentColor,
                    }}
                  >
                    {message.type === "bot" ? (
                      <Bot size={24} style={{ color: textColor }} />
                    ) : (
                      <User size={24} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                      message.type === "bot"
                        ? "bg-white rounded-tl-none"
                        : "rounded-tr-none"
                    }`}
                    style={{ 
                      backgroundColor: message.type === "bot" ? "white" : primaryColor,
                      color: textColor 
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* 入力欄やボタン表示領域 */}
        {currentQuestionIndex >= 0 && !isSurveyCompleted && (
          <div className="fixed bottom-2 left-0 right-0 bg-white p-4 shadow-md pb-4 mx-2 rounded-lg">
            <div className="flex">
              {selectedQuestions[currentQuestionIndex]?.type === "text" && (
                <>
                  <Input
                    type="text"
                    value={currentAnswer as string}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className={`${styles.input} flex-grow mr-2 h-12 text-base md:h-10 md:text-base border rounded bg-white border-[#F2B705] focus:border-[#F28705] focus:ring-[#F28705]`}
                    style={{ borderColor: primaryColor, color: textColor }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAnswer(currentAnswer as string);
                      }
                    }}
                    ref={inputRef}
                  />
                  <Button
                    onClick={() => handleAnswer(currentAnswer as string)}
                    className="h-12 md:h-10"
                    style={{ backgroundColor: primaryColor, color: textColor }}
                  >
                    <Send size={20} />
                  </Button>
                </>
              )}
              {selectedQuestions[currentQuestionIndex]?.type !== "text" && (
                <div className="w-full">
                  {renderQuestion(selectedQuestions[currentQuestionIndex])}
                </div>
              )}
            </div>
          </div>
        )}

        {currentQuestionIndex === -1 && (
          <div className="flex-shrink-0 bg-white p-4 shadow-md">
            <Button
              onClick={startSurvey}
              className="w-full py-2 text-lg font-semibold"
              style={{ backgroundColor: primaryColor, color: textColor }}
            >
              アンケートを開始
            </Button>
          </div>
        )}

        {isSurveyCompleted && showSubmitButton && (
          <div className="fixed bottom-2 left-0 right-0 bg-white p-4 shadow-md pb-[env(safe-area-inset-bottom)] mx-2 rounded-lg">
            <Button
              onClick={submitSurvey}
              disabled={isSubmitting}
              className="w-full h-12 md:h-10 text-lg font-semibold"
              style={{ backgroundColor: primaryColor, color: textColor }}
            >
              {isSubmitting ? "送信中..." : "アンケートを送信"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
