import React, {
  useReducer,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MessageCircle, Calendar } from "lucide-react";
import ErrorHandler from "@/components/ErrorHandler";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "react-hot-toast";
import Image from "next/image";
import styles from "./ReviewConfirmation.module.css";

interface SurveySettings {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  image_url: string | null;
  intro_message: string;
  outro_message: string;
  review_confirmation_message: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  logo_url: string | null;
}

interface SurveyResponse {
  id: string;
  shop_id: string;
  answers: Record<string, string>;
  created_at: string;
}

interface SurveyData {
  response: SurveyResponse;
  settings: SurveySettings;
}

interface ShopInfo {
  name: string;
  address: string;
  google_review_url: string;
}

interface State {
  surveyData: SurveyData | null;
  shopInfo: ShopInfo | null;
  generatedReview: string;
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
}

type Action =
  | { type: "SET_SURVEY_DATA"; payload: SurveyData }
  | { type: "SET_SHOP_INFO"; payload: ShopInfo }
  | { type: "SET_GENERATED_REVIEW"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_IMAGE_URL"; payload: string | null };

const initialState: State = {
  surveyData: null,
  shopInfo: null,
  generatedReview: "",
  isLoading: true,
  error: null,
  imageUrl: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SURVEY_DATA":
      return { ...state, surveyData: action.payload };
    case "SET_SHOP_INFO":
      return { ...state, shopInfo: action.payload };
    case "SET_GENERATED_REVIEW":
      return { ...state, generatedReview: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_IMAGE_URL":
      return { ...state, imageUrl: action.payload };
    default:
      return state;
  }
}

export default function ReviewConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = useMemo(() => searchParams?.get("surveyId"), [searchParams]);
  const supabase = useRef(createClientComponentClient()).current;

  const [state, dispatch] = useReducer(reducer, initialState);
  const [editableReview, setEditableReview] = useState("");

  const fetchData = useCallback(async () => {
    if (!surveyId) {
      dispatch({
        type: "SET_ERROR",
        payload: "アンケートIDが見つかりません。",
      });
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // surveyResponseの取得
      const { data: surveyResponse, error: surveyError } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (surveyError) throw surveyError;

      if (!surveyResponse) {
        throw new Error("アンケートデータが見つかりません。");
      }

      // surveySettingsの取得
      const { data: surveySettings, error: settingsError } = await supabase
        .from("survey_settings")
        .select("*")
        .eq("shop_id", surveyResponse.shop_id)
        .single();

      if (settingsError) throw settingsError;

      if (!surveySettings) {
        throw new Error("アンケート設定が見つかりません。");
      }

      const surveyData: SurveyData = {
        response: surveyResponse,
        settings: surveySettings,
      };

      dispatch({ type: "SET_SURVEY_DATA", payload: surveyData });

      if (surveySettings.image_url) {
        dispatch({ type: "SET_IMAGE_URL", payload: surveySettings.image_url });
      }

      // 口コミの生成と保存
      const generateAndSaveReview = async (
        surveyResponseId: string,
        shopId: string
      ) => {
        try {
          const response = await fetch("/api/survey/generate-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ surveyId: surveyResponseId }),
          });

          if (!response.ok) {
            let errorMessage = "口コミの生成に失敗しました。";
            
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              // JSONパースエラーの場合（504エラーなどでHTMLが返された場合）
              if (response.status === 504) {
                errorMessage = "サーバーの応答に時間がかかりすぎています。しばらく待ってから再度お試しください。";
              } else {
                errorMessage = `サーバーエラーが発生しました (${response.status})`;
              }
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          dispatch({ type: "SET_GENERATED_REVIEW", payload: data.review });
        } catch (error) {
          console.error("Error generating and saving review:", error);
          dispatch({
            type: "SET_ERROR",
            payload:
              error instanceof Error
                ? error.message
                : "口コミの生成と保存に失敗しました。",
          });
        }
      };

      await generateAndSaveReview(surveyResponse.id, surveyResponse.shop_id);

      // ショップ情報の取得
      const fetchShopInfo = async (shopId: string) => {
        try {
          const { data, error } = await supabase
            .from("shops")
            .select("name, address, google_review_url")
            .eq("id", shopId)
            .single();

          if (error) throw error;

          const shopInfo: ShopInfo = {
            name: data.name,
            address: data.address,
            google_review_url: data.google_review_url,
          };

          dispatch({ type: "SET_SHOP_INFO", payload: shopInfo });
        } catch (error) {
          console.error("Error fetching shop info:", error);
          dispatch({
            type: "SET_ERROR",
            payload: "ショップ情報の取得に失敗しました。",
          });
        }
      };

      await fetchShopInfo(surveyResponse.shop_id);
    } catch (error) {
      console.error("Error fetching data:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "データの取得中にエラーが発生しました。",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [surveyId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (state.generatedReview) {
      setEditableReview(state.generatedReview);
    }
  }, [state.generatedReview]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '/').replace(',', '');
  };


  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error("Failed to copy: ", err);
        return false;
      }
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
        document.body.removeChild(textArea);
        return false;
      }
    }
  };

  const handleGoogleMapRedirect = async () => {
    if (state.shopInfo && state.shopInfo.google_review_url) {
      const copySuccess = await copyToClipboard(editableReview);
      if (copySuccess) {
        toast.success("レビューをクリップボードにコピーしました。");
        window.location.href = state.shopInfo.google_review_url;
      } else {
        toast.error(
          "レビューのコピーに失敗しました。Google Mapページを開きます。"
        );
        window.location.href = state.shopInfo.google_review_url;
      }
    } else {
      const defaultGoogleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        state.shopInfo?.name || ""
      )}`;
      toast.error(
        "Google Mapの口コミページが設定されていません。代わりにGoogle検索を開きます。"
      );
      window.location.href = defaultGoogleSearchUrl;
    }
  };

  const handleRetry = () => {
    dispatch({ type: "SET_ERROR", payload: null });
    fetchData();
  };

  const handleReturnToSurvey = () => {
    if (state.surveyData && state.surveyData.response) {
      const { shop_id } = state.surveyData.response;
      if (shop_id) {
        router.push(`/survey/${shop_id}`);
      } else {
        console.error("Shop ID is not available in survey data");
        router.push("/");
      }
    } else {
      console.error("Survey data is not available");
      router.push("/");
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <ErrorHandler error={state.error} onRetry={handleRetry} />;
  }

  // カラー設定の取得とデフォルト値の設定
  const primaryColor = state.surveyData?.settings.primary_color || "#F2CB05";
  const secondaryColor = state.surveyData?.settings.secondary_color || "#FFF9E5";
  const accentColor = state.surveyData?.settings.accent_color || "#F28705";
  const textColor = state.surveyData?.settings.text_color || "#262626";
  const logoUrl = state.surveyData?.settings.logo_url || "/images/アセット 3@3x.png"; // デフォルトロゴのパス
  
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${styles.reviewConfirmationPage} min-h-screen p-4 flex flex-col items-center justify-center`}
        style={{ 
          backgroundImage: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})` 
        }}
      >
        <Card className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="relative w-64 h-40 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt="ロゴ"
                  fill
                  style={{ 
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold mb-4 text-center whitespace-nowrap"
              style={{ color: textColor }}
            >
              クチコミ文章が完成しました！
            </motion.h1>

            {state.imageUrl && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative w-full h-48 mb-6 rounded-xl overflow-hidden"
              >
                <Image
                  src={state.imageUrl}
                  alt="店舗イメージ"
                  layout="fill"
                  objectFit="cover"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="flex items-center mb-2">
                <MessageCircle style={{ color: primaryColor }} className="mr-2" />
                <h2 className="text-lg font-semibold" style={{ color: textColor }}>
                  ショップからのメッセージ
                </h2>
              </div>
              <p className="italic mb-2" style={{ color: textColor }}>
                {state.surveyData?.settings.review_confirmation_message ||
                  "アンケートにご協力いただき、誠にありがとうございます。"}
              </p>
              <div className="flex justify-end items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  {formatDate(state.surveyData?.response.created_at || '')}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-4 mb-6 relative"
              style={{ borderColor: primaryColor, borderWidth: '2px' }}
            >
              <h2 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                クチコミ
              </h2>
              <textarea
                value={editableReview}
                onChange={(e) => setEditableReview(e.target.value)}
                className={styles.reviewTextarea}
                style={{ 
                  backgroundColor: secondaryColor,
                  borderColor: primaryColor,
                  color: textColor
                }}
              />
              <div className="absolute bottom-1 right-4 text-sm text-gray-500 mt-1">
                {editableReview.length}文字
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gray-500 mb-6 text-center"
            >
              このクチコミはアンケート回答を元に自動で作成された文章です。内容を確認し必要に応じて文章を編集してください。
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={handleGoogleMapRedirect}
                className="w-full font-bold py-3 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  color: textColor
                }}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Google Mapで口コミを投稿
              </Button>
              <Button
                onClick={handleReturnToSurvey}
                variant="outline"
                className="w-full border-2 font-bold py-3 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: primaryColor,
                  color: textColor,
                  backgroundColor: "transparent"
                }}
              >
                アンケートへ戻る
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </ErrorBoundary>
  );
}
