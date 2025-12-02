"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Info,
  Save,
  Eye,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import AdminHeader from "@/components/for-admin/shops/AdminHeader";
import Footer from "@/components/Footer";
import { HexColorPicker } from "react-colorful";

type Question = {
  id: string;
  type: "text" | "radio";
  text: string;
  options?: string[];
  isRandom: boolean;
  group?: string; // グループ名を保持
};

interface SurveySettings {
  id?: string;
  title: string;
  description: string;
  keywords: string[];
  intro_message: string;
  outro_message: string;
  layout: string;
  questions: Question[];
  shop_id: string;
  image_url: string | null;
  review_confirmation_message: string;
  num_random_questions: {
    min: number;
    max: number;
  };
  prompt_template: string;
  tones: string[];
  default_tone: string;
  use_random_tone: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  logo_url: string | null;
}

type FlatListItem =
  | { type: "group"; name: string; items: Question[] }
  | Question;

// 追加: 新しいグループ内の質問の型定義
type NewGroupQuestion = {
  text: string;
  type: "text" | "radio";
  options?: string[];
};

// テーマパターンを追加
const colorThemes = [
  {
    id: "default",
    name: "デフォルト",
    primary: "#F2B705",
    secondary: "#FFF9E5",
    accent: "#F28705",
    text: "#262626",
  },
  {
    id: "simple-white",
    name: "シンプルホワイト",
    primary: "#f0f6f7",
    secondary: "#FFFFFF",
    accent: "#bae3ff",
    text: "#333333",
    border: "#c0c0c0", // 枠線用の色を追加
  },
  {
    id: "simple-gray",
    name: "シンプルグレー",
    primary: "#555555",
    secondary: "#F8F8F8",
    accent: "#1f1f1f",
    text: "#333333",
  },
  {
    id: "simple-black",
    name: "シンプルブラック",
    primary: "#202020",
    secondary: "#F5F5F5",
    accent: "#9d9d9d",
    text: "#868686",
  },
  {
    id: "simple-mint",
    name: "シンプルミント",
    primary: "#2ECC71",
    secondary: "#F0FFF4",
    accent: "#1ABC9C",
    text: "#333333",
  },
  {
    id: "blue",
    name: "ブルー系",
    primary: "#3498db",
    secondary: "#ecf0f1",
    accent: "#2980b9",
    text: "#2c3e50",
  },
  {
    id: "red",
    name: "レッド系",
    primary: "#e74c3c",
    secondary: "#fff5f5",
    accent: "#c0392b",
    text: "#2c3e50",
  },
  {
    id: "purple",
    name: "パープル系",
    primary: "#9b59b6",
    secondary: "#f5f0ff",
    accent: "#8e44ad",
    text: "#333333",
  },
  {
    id: "orange",
    name: "オレンジ系",
    primary: "#e67e22",
    secondary: "#FFF5EB",
    accent: "#d35400",
    text: "#2c3e50",
  },
  {
    id: "teal",
    name: "ティール系",
    primary: "#1abc9c",
    secondary: "#e8f8f5",
    accent: "#16a085",
    text: "#2c3e50",
  },
];

export default function SurveySettingsPage({
  params,
}: {
  params: { shopId: string };
}) {
  const [settings, setSettings] = useState<SurveySettings>({
    title: "",
    description: "",
    keywords: [],
    intro_message: "",
    outro_message: "",
    layout: "{}",
    questions: [],
    shop_id: params.shopId,
    image_url: null,
    review_confirmation_message: "",
    num_random_questions: { min: 0, max: 0 },
    prompt_template: "", // 新しく追加
    tones: [], // 新しく追加
    default_tone: "", // 新しく追加
    use_random_tone: false, // 新しく追加
    primary_color: "",
    secondary_color: "",
    accent_color: "",
    text_color: "",
    logo_url: null,
  });
  const [newQuestionType, setNewQuestionType] = useState<"text" | "radio">(
    "text"
  );
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([""]);
  const [newQuestionIsRandom, setNewQuestionIsRandom] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newTone, setNewTone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [newQuestionGroupEnabled, setNewQuestionGroupEnabled] = useState(false);
  const [newQuestionGroupName, setNewQuestionGroupName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{
    [key: string]: boolean;
  }>({});

  // 追加: 新しいグループ内の質問を管理する状態
  const [newGroupQuestions, setNewGroupQuestions] = useState<NewGroupQuestion[]>([
    { text: "", type: "text", options: undefined },
  ]);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const toastOptions = {
    style: {
      background: "#fff",
      color: "#333",
    },
  };

  useEffect(() => {
    fetchSettings();
  }, [params.shopId]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_settings")
        .select("*")
        .eq("shop_id", params.shopId)
        .single();

      const defaultPromptTemplate = `以下のアンケート回答を参考に、{tone}で魅力的な口コミを書いてください。

ガイドライン：
1. 自然な口語体で書いてください。
2. 口コミの冒頭は他の口コミと同じにならないように工夫した表現で始めてください。
3. アンケート回答に基づいた具体的な体験や感想を自由な順序で書いてください。架空の内容は含めないでください。
4. 長所と短所のバランスを取り、信頼性を高めてください。
5. 以下のキーワードを自然に組み込んでください（順不同、必要に応じて一部または全て使用）：{keywords}
6. キーワードやアンケート回答の順序は自由です。
7. 店舗の特徴や雰囲気を簡潔に描写してください。
8. 個人的な推奨や改善点があれば簡単に言及してください。
9. 文章構成や表現を毎回変えて、オリジナリティを持たせてください。
10. 口コミの長さは100〜200文字程度に収めてください。`;

      const defaultTones = [
        "敬体（です・ます調）",
        "カジュアルな口語体",
        "親しみやすいフレンドリーな口調",
        "情緒的で感情豊かな表現",
      ];

      if (error) {
        if (error.code === "PGRST116") {
          setSettings({
            title: "",
            description: "",
            keywords: [],
            intro_message: "",
            outro_message: "",
            layout: "{}",
            questions: [],
            shop_id: params.shopId,
            image_url: null,
            review_confirmation_message: "",
            num_random_questions: { min: 0, max: 0 },
            prompt_template: defaultPromptTemplate,
            tones: defaultTones,
            default_tone: defaultTones[0],
            use_random_tone: false,
            primary_color: "",
            secondary_color: "",
            accent_color: "",
            text_color: "",
            logo_url: null,
          });
        } else {
          throw error;
        }
      } else if (data) {
        const parsedQuestions: Question[] = data.questions.map((q: any) => ({
          ...q,
          isRandom: q.isRandom || false,
          group: q.group || undefined,
        }));

        setSettings({
          ...data,
          questions: parsedQuestions,
          layout: data.layout || "{}",
          image_url: data.image_url,
          num_random_questions: data.num_random_questions || { min: 0, max: 0 },
          prompt_template: data.prompt_template || defaultPromptTemplate,
          tones: data.tones || defaultTones,
          default_tone: data.default_tone || defaultTones[0],
          use_random_tone: data.use_random_tone || false,
          primary_color: data.primary_color || "",
          secondary_color: data.secondary_color || "",
          accent_color: data.accent_color || "",
          text_color: data.text_color || "",
          logo_url: data.logo_url,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setErrorMessage("設定の取得中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'logo' = 'image'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 画像サイズのチェック
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
      });

      // 容量制限のチェック (例: 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        throw new Error("画像サイズは2MB以下である必要があります。");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${params.shopId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("survey-images")
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("survey-images").getPublicUrl(filePath);

      // 画像URLを設定に追加
      if (type === 'logo') {
        setSettings({ ...settings, logo_url: publicUrl });
      } else {
        setSettings({ ...settings, image_url: publicUrl });
      }
      
      toast.success("画像が正常にアップロードされました", toastOptions);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました。"
      );
      toast.error(
        error instanceof Error ? error.message : "画像のアップロードに失敗しました",
        toastOptions
      );
    }
  };

  const handleImageDelete = async (type: 'image' | 'logo' = 'image') => {
    try {
      const urlToDelete = type === 'logo' ? settings.logo_url : settings.image_url;
      if (!urlToDelete) return;

      // 画像のパスを抽出
      const filePath = urlToDelete.split("/").slice(-2).join("/");

      // Supabaseから画像を削除
      const { error } = await supabase.storage.from("survey-images").remove([filePath]);

      if (error) throw error;

      // 削除後、設定を更新して画像URLをnullにする
      if (type === 'logo') {
        setSettings({ ...settings, logo_url: null });
      } else {
        setSettings({ ...settings, image_url: null });
      }

      toast.success("画像が削除されました");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("画像の削除に失敗しました");
    }
  };

  const saveSettings = async () => {
    try {
      const totalRandomQuestions = settings.questions.filter(
        (q) => q.isRandom
      ).length;

      const { min, max } = settings.num_random_questions;

      // ランダム質問数の検証
      if (min < 0 || max < 0 || min > max) {
        toast.error(
          `ランダム質問の表示数の最小値と最大値を正しく設定してください。`,
          { duration: 5000 }
        );
        return;
      }

      if (max > totalRandomQuestions) {
        toast.error(
          `最大値はランダム質問の総数（${totalRandomQuestions}）を超えることはできません。`,
          { duration: 5000 }
        );
        return;
      }

      // 全ての質問がランダム表示になっていないかチェック
      const allRandom = settings.questions.every((q) => q.isRandom || q.group);
      if (allRandom && max === 0) {
        toast.error(
          "少なくとも1つの質問は必ず表示されるように設定してください。",
          { duration: 5000 }
        );
        return;
      }

      const { data, error } = await supabase
        .from("survey_settings")
        .upsert({
          ...settings,
          updated_at: new Date(),
        })
        .select();

      if (error) throw error;

      if (data) {
        setSettings(data[0]);
        toast.success("設定が正常に保存されました", toastOptions);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("設定の保存中にエラーが発生しました。");
      toast.error("設定の保存に失敗しました", toastOptions);
    }
  };

  const addQuestion = () => {
    if (newQuestionGroupEnabled) {
      // グループ名が未入力の場合はエラーを表示
      if (!newQuestionGroupName.trim()) {
        toast.error("グループ名を入力してください。", { duration: 5000 });
        return;
      }

      // 質問文が空でないかチェック
      const validQuestions = newGroupQuestions.filter(
        (q) => q.text.trim() !== ""
      );

      if (validQuestions.length === 0) {
        toast.error("少なくとも1つの質問文を入力してください。", {
          duration: 5000,
        });
        return;
      }

      const groupName = newQuestionGroupName.trim();
      const newQuestions: Question[] = validQuestions.map((q) => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        type: q.type,
        text: q.text.trim(),
        options:
          q.type === "radio"
            ? q.options?.filter((option) => option.trim() !== "")
            : undefined,
        isRandom: false, // グループ内の質問はランダム設定しない
        group: groupName, // グループ名を設定
      }));

      setSettings((prevSettings) => ({
        ...prevSettings,
        questions: [...prevSettings.questions, ...newQuestions],
      }));

      // 状態のリセット
      setNewQuestionGroupEnabled(false);
      setNewQuestionGroupName("");
      setNewGroupQuestions([{ text: "", type: "text", options: undefined }]);
    } else {
      // 個別の質問文が空でないかチェック
      if (!newQuestionText.trim()) {
        toast.error("質問文を入力してください。", { duration: 5000 });
        return;
      }

      const newQuestion: Question = {
        id: Date.now().toString(),
        type: newQuestionType,
        text: newQuestionText.trim(),
        options:
          newQuestionType === "radio"
            ? newQuestionOptions.filter((option) => option.trim() !== "")
            : undefined,
        isRandom: newQuestionIsRandom,
      };

      setSettings((prevSettings) => ({
        ...prevSettings,
        questions: [...prevSettings.questions, newQuestion],
      }));

      // 状態のリセット
      setNewQuestionText("");
      setNewQuestionOptions([""]);
      setNewQuestionIsRandom(false);
      setNewQuestionType("text");
    }
  };

  const removeQuestion = (id: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: prevSettings.questions.filter((q) => q.id !== id),
    }));
  };

  const removeGroup = (groupName: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: prevSettings.questions.filter((q) => q.group !== groupName),
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: prevSettings.questions.map((q) => {
        if (q.id === questionId) {
          let updatedQuestion = { ...q, ...updates } as Question;
          if (updates.type && updates.type !== q.type) {
            if (updates.type === "radio") {
              if (!updatedQuestion.options) {
                updatedQuestion.options = [""];
              }
            } else if (updates.type === "text") {
              delete updatedQuestion.options;
            }
          }
          return updatedQuestion;
        }
        return q;
      }),
    }));
  };

  const updateGroupName = (oldGroupName: string, newGroupName: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: prevSettings.questions.map((q) => {
        if (q.group === oldGroupName) {
          return { ...q, group: newGroupName } as Question;
        }
        return q;
      }),
    }));
  };

  // フラットなリストを作成するヘルパー関数
  const getFlatList = (): FlatListItem[] => {
    const flatList: FlatListItem[] = [];
    const groupMap: { [key: string]: { index: number; items: Question[] } } = {};
    const orderedItems: { index: number; item: FlatListItem }[] = [];

    settings.questions.forEach((question, index) => {
      if (question.group) {
        if (!groupMap[question.group]) {
          groupMap[question.group] = { index, items: [] };
        }
        groupMap[question.group].items.push(question);
      } else {
        orderedItems.push({ index, item: question });
      }
    });

    Object.keys(groupMap).forEach((groupName) => {
      const group = groupMap[groupName];
      orderedItems.push({
        index: group.index,
        item: {
          type: "group",
          name: groupName,
          items: group.items,
        },
      });
    });

    // インデックス順に並び替え
    orderedItems.sort((a, b) => a.index - b.index);

    // フラットなリストを作成
    orderedItems.forEach(({ item }) => {
      flatList.push(item);
    });

    return flatList;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const flatList = getFlatList();

    const [movedItem] = flatList.splice(result.source.index, 1);
    flatList.splice(result.destination.index, 0, movedItem);

    const newQuestions: Question[] = [];

    flatList.forEach((item) => {
      if ("type" in item && item.type === "group") {
        newQuestions.push(...item.items);
      } else {
        newQuestions.push(item as Question);
      }
    });

    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: newQuestions,
    }));
  };

  const onGroupDragEnd = (result: DropResult, groupName: string) => {
    if (!result.destination) {
      return;
    }

    const groupQuestions = settings.questions.filter(
      (q) => q.group === groupName
    );

    const [movedItem] = groupQuestions.splice(result.source.index, 1);
    groupQuestions.splice(result.destination.index, 0, movedItem);

    const newQuestions: Question[] = [];

    settings.questions.forEach((q) => {
      if (q.group !== groupName) {
        newQuestions.push(q);
      }
    });

    newQuestions.push(...groupQuestions);

    setSettings((prevSettings) => ({
      ...prevSettings,
      questions: newQuestions,
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("URLをコピーしました");
      },
      (err) => {
        console.error("URLのコピーに失敗しました:", err);
        toast.error("URLのコピーに失敗しました");
      }
    );
  };

  const generateSurveyUrl = () => {
    return `${window.location.origin}/survey/${params.shopId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // フラットなリストを取得
  const flatList = getFlatList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const totalRandomQuestions = settings.questions.filter((q) => q.isRandom)
    .length;

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <AdminHeader />
      <main className="flex-1 p-6 mt-16 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-none"
        >
          <h1 className="text-3xl font-bold mb-6 text-[#262626]">アンケート設定</h1>

          {errorMessage && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {errorMessage}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* アンケート基本設定 */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-[#F2B705] text-[#262626]">
                <h2 className="text-xl font-semibold">アンケート基本設定</h2>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                {/* アンケートタイトル */}
                <div>
                  <Label
                    htmlFor="surveyTitle"
                    className="text-sm font-medium text-gray-700"
                  >
                    アンケートタイトル
                  </Label>
                  <Input
                    id="surveyTitle"
                    value={settings.title}
                    onChange={(e) =>
                      setSettings({ ...settings, title: e.target.value })
                    }
                    placeholder="アンケートタイトルを入力"
                    className="mt-1"
                  />
                </div>
                {/* アンケート説明 */}
                <div>
                  <Label
                    htmlFor="surveyDescription"
                    className="text-sm font-medium text-gray-700"
                  >
                    アンケート説明
                  </Label>
                  <Textarea
                    id="surveyDescription"
                    value={settings.description}
                    onChange={(e) =>
                      setSettings({ ...settings, description: e.target.value })
                    }
                    placeholder="アンケートの説明を入力"
                    className="mt-1"
                  />
                </div>
                {/* 冒頭の挨拶文 */}
                <div>
                  <Label
                    htmlFor="introMessage"
                    className="text-sm font-medium text-gray-700"
                  >
                    冒頭の挨拶文
                  </Label>
                  <Textarea
                    id="introMessage"
                    value={settings.intro_message}
                    onChange={(e) =>
                      setSettings({ ...settings, intro_message: e.target.value })
                    }
                    placeholder="アンケート開始時の挨拶文を入力"
                    className="mt-1"
                  />
                </div>
                {/* 終了の挨拶文 */}
                <div>
                  <Label
                    htmlFor="outroMessage"
                    className="text-sm font-medium text-gray-700"
                  >
                    終了の挨拶文
                  </Label>
                  <Textarea
                    id="outroMessage"
                    value={settings.outro_message}
                    onChange={(e) =>
                      setSettings({ ...settings, outro_message: e.target.value })
                    }
                    placeholder="アンケート終了時の挨拶文を入力"
                    className="mt-1"
                  />
                </div>
                {/* ランダム質問表示数設定を追加 */}
                <div>
                  <Label
                    htmlFor="numRandomQuestions"
                    className="text-sm font-medium text-gray-700"
                  >
                    ランダム質問表示数設定
                  </Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="text-sm text-gray-600">
                      ランダム表示の質問数: {totalRandomQuestions}
                    </p>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <Label
                      htmlFor="numRandomQuestionsMin"
                      className="text-sm font-medium text-gray-700"
                    >
                      最小値
                    </Label>
                    <Input
                      id="numRandomQuestionsMin"
                      type="number"
                      min="0"
                      max={totalRandomQuestions}
                      value={settings.num_random_questions.min}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          num_random_questions: {
                            ...settings.num_random_questions,
                            min: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-24"
                    />
                    <Label
                      htmlFor="numRandomQuestionsMax"
                      className="text-sm font-medium text-gray-700"
                    >
                      最大値
                    </Label>
                    <Input
                      id="numRandomQuestionsMax"
                      type="number"
                      min="0"
                      max={totalRandomQuestions}
                      value={settings.num_random_questions.max}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          num_random_questions: {
                            ...settings.num_random_questions,
                            max: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ランダムに表示する質問数の範囲を設定してください。
                  </p>
                </div>
                {/* キーワード */}
                <div>
                  <Label
                    htmlFor="keywords"
                    className="text-sm font-medium text-gray-700"
                  >
                    キーワード
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {settings.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          onClick={() =>
                            setSettings({
                              ...settings,
                              keywords: settings.keywords.filter(
                                (_, i) => i !== index
                              ),
                            })
                          }
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="newKeyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="新しいキーワードを入力"
                    />
                    <Button
                      onClick={() => {
                        if (newKeyword) {
                          setSettings({
                            ...settings,
                            keywords: [...settings.keywords, newKeyword],
                          });
                          setNewKeyword("");
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      追加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 画像アップロード */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-[#F2B705] text-[#262626]">
                <h2 className="text-xl font-semibold">画像アップロード</h2>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* 画像アップロードフィールド */}
                <div>
                  <Label
                    htmlFor="imageUpload"
                    className="text-sm font-medium text-gray-700"
                  >
                    アンケート完了画面の画像（推奨:384x192ピクセル、必須:2MB以下）
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    注意: 画像は384x192ピクセルが推奨で、ファイルサイズは2MB以下である必要があります。
                  </p>
                </div>
                {settings.image_url && (
                  <div className="mt-4 flex justify-center items-center h-[400px] bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={settings.image_url}
                      alt="Uploaded image"
                      width={384}
                      height={192}
                      className="rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleImageDelete('image')}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI設定 */}
          <Card className="mt-6 bg-white shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">AIプロンプト設定</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* プロンプトテンプレート */}
              <div>
                <Label htmlFor="promptTemplate" className="text-sm font-medium text-gray-700">
                  プロンプトテンプレート（{'{tone}'} と {'{keywords}'} が使用できます）
                </Label>
                <p className="text-sm text-gray-500">
                  {'{tone}'} は選択された口調に、{'{keywords}'} はキーワードに置き換えられます。
                </p>
                <Textarea
                  id="promptTemplate"
                  value={settings.prompt_template}
                  onChange={(e) =>
                    setSettings({ ...settings, prompt_template: e.target.value })
                  }
                  placeholder="プロンプトテンプレートを入力"
                  className="mt-1"
                />
              </div>
              {/* 固定部分の表示 */}
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">
                  固定部分（編集不可）
                </Label>
                <pre className="bg-gray-100 p-4 rounded mt-1">
                  アンケート回答：
                  {"{formattedResponses}"}

                  この情報を基に、魅力的な口コミを生成してください。
                </pre>
              </div>
              {/* 口調の設定 */}
              <div>
                <Label htmlFor="tones" className="text-sm font-medium text-gray-700">
                  利用可能な口調
                </Label>
                <p className="text-sm text-gray-500">
                  口コミ生成に使用する口調を追加・編集できます。
                </p>
                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                  {settings.tones.map((tone, index) => (
                    <div
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tone}
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            tones: settings.tones.filter((_, i) => i !== index),
                          })
                        }
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="newTone"
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value)}
                    placeholder="新しい口調を入力"
                  />
                  <Button
                    onClick={() => {
                      if (newTone) {
                        setSettings({
                          ...settings,
                          tones: [...settings.tones, newTone],
                        });
                        setNewTone("");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    追加
                  </Button>
                </div>
              </div>
              {/* 使用する口調 */}
              <div className="mt-4">
                <Label htmlFor="defaultTone" className="text-sm font-medium text-gray-700">
                  使用する口調
                </Label>
                <p className="text-sm text-gray-500">
                  固定の口調を使用するか、ランダムに選択するかを設定します。
                </p>
                <Select
                  onValueChange={(value) =>
                    setSettings({ ...settings, default_tone: value })
                  }
                  value={settings.default_tone}
                  disabled={settings.use_random_tone}
                >
                  <SelectTrigger id="defaultTone">
                    <SelectValue placeholder="使用する口調を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.tones.map((tone, index) => (
                      <SelectItem key={index} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center mt-2">
                  <Checkbox
                    id="useRandomTone"
                    checked={settings.use_random_tone}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, use_random_tone: checked as boolean })
                    }
                  />
                  <Label
                    htmlFor="useRandomTone"
                    className="text-sm font-medium text-gray-700"
                  >
                    口調をランダムに選択する
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* レビュー確認メッセージ */}
          <Card className="mt-6 bg-white shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">レビュー確認メッセージ</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label
                  htmlFor="reviewConfirmationMessage"
                  className="text-sm font-medium text-gray-700"
                >
                  アンケート完了後に表示するメッセージ
                </Label>
                <Textarea
                  id="reviewConfirmationMessage"
                  value={settings.review_confirmation_message}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      review_confirmation_message: e.target.value,
                    })
                  }
                  placeholder="アンケート完了後に表示するメッセージを入力してください"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* 新しい質問を追加 */}
          <Card className="mt-6 bg-white shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">新しい質問を追加</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* グループ設定を追加 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newQuestionGroupEnabled"
                  checked={newQuestionGroupEnabled}
                  onCheckedChange={(checked) =>
                    setNewQuestionGroupEnabled(checked as boolean)
                  }
                />
                <Label
                  htmlFor="newQuestionGroupEnabled"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  グルーピングランダム質問設定を行う
                </Label>
              </div>
              {newQuestionGroupEnabled && (
                <div>
                  <Label
                    htmlFor="newQuestionGroupName"
                    className="text-sm font-medium text-gray-700"
                  >
                    グループ名
                  </Label>
                  <Input
                    id="newQuestionGroupName"
                    value={newQuestionGroupName}
                    onChange={(e) => setNewQuestionGroupName(e.target.value)}
                    placeholder="グループ名を入力してください"
                    className="mt-1"
                  />
                </div>
              )}
              {/* 質問文の入力 */}
              {!newQuestionGroupEnabled && (
                <>
                  <div className="flex items-center space-x-4">
                    <Label
                      htmlFor="questionType"
                      className="text-sm font-medium text-gray-700"
                    >
                      質問の種類
                    </Label>
                    <Select
                      onValueChange={(value: "text" | "radio") =>
                        setNewQuestionType(value)
                      }
                      value={newQuestionType}
                    >
                      <SelectTrigger id="questionType" className="w-[180px]">
                        <SelectValue placeholder="質問の種類を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">記述式</SelectItem>
                        <SelectItem value="radio">選択式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="questionText"
                      className="text-sm font-medium text-gray-700"
                    >
                      質問文
                    </Label>
                    <Input
                      id="questionText"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="質問文を入力してください"
                      className="mt-1"
                    />
                  </div>
                  {newQuestionType === "radio" && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        選択肢
                      </Label>
                      {newQuestionOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 mt-2"
                        >
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestionOptions];
                              newOptions[index] = e.target.value;
                              setNewQuestionOptions(newOptions);
                            }}
                            placeholder={`選択肢 ${index + 1}`}
                          />
                          {index === newQuestionOptions.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setNewQuestionOptions([...newQuestionOptions, ""])
                              }
                              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newQuestionIsRandom"
                      checked={newQuestionIsRandom}
                      onCheckedChange={(checked) =>
                        setNewQuestionIsRandom(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="newQuestionIsRandom"
                      className="text-sm font-medium text-gray-700"
                    >
                      ランダム表示
                    </Label>
                  </div>
                </>
              )}
              {newQuestionGroupEnabled && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    質問（複数入力できます）
                  </Label>
                  {newGroupQuestions.map((question, index) => (
                    <div key={index} className="border p-4 mt-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          質問文
                        </Label>
                        <Input
                          value={question.text}
                          onChange={(e) => {
                            const updatedQuestions = [...newGroupQuestions];
                            updatedQuestions[index].text = e.target.value;
                            setNewGroupQuestions(updatedQuestions);
                          }}
                          placeholder={`質問文 ${index + 1}`}
                        />
                        {index === newGroupQuestions.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setNewGroupQuestions([
                                ...newGroupQuestions,
                                { text: "", type: "text", options: undefined },
                              ])
                            }
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {newGroupQuestions.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updatedQuestions = [...newGroupQuestions];
                              updatedQuestions.splice(index, 1);
                              setNewGroupQuestions(updatedQuestions);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* 質問タイプの選択 */}
                      <div className="flex items-center space-x-4 mt-2">
                        <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          質問の種類
                        </Label>
                        <Select
                          onValueChange={(value: "text" | "radio") => {
                            const updatedQuestions = [...newGroupQuestions];
                            updatedQuestions[index].type = value;
                            if (value === "radio") {
                              updatedQuestions[index].options =
                                updatedQuestions[index].options || [""];
                            } else {
                              updatedQuestions[index].options = undefined;
                            }
                            setNewGroupQuestions(updatedQuestions);
                          }}
                          value={question.type}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="質問の種類を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">記述式</SelectItem>
                            <SelectItem value="radio">選択式</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* 選択式の場合、選択肢の入力フィールドを表示 */}
                      {question.type === "radio" && (
                        <div className="mt-2">
                          <Label className="text-sm font-medium text-gray-700">
                            選択肢
                          </Label>
                          {question.options?.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-2 mt-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const updatedQuestions = [...newGroupQuestions];
                                  updatedQuestions[index].options![optIndex] =
                                    e.target.value;
                                  setNewGroupQuestions(updatedQuestions);
                                }}
                                placeholder={`選択肢 ${optIndex + 1}`}
                              />
                              {optIndex === question.options!.length - 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const updatedQuestions = [...newGroupQuestions];
                                    updatedQuestions[index].options!.push("");
                                    setNewGroupQuestions(updatedQuestions);
                                  }}
                                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {question.options!.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const updatedQuestions = [...newGroupQuestions];
                                    updatedQuestions[index].options!.splice(
                                      optIndex,
                                      1
                                    );
                                    setNewGroupQuestions(updatedQuestions);
                                  }}
                                  className="bg-red-100 hover:bg-red-200 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={addQuestion}
                className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
              >
                質問を追加
              </Button>
            </CardFooter>
          </Card>

          {/* 現在の質問一覧 */}
          <Card className="mt-6 mb-6 border shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">現在の質問一覧</h2>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-600 select-none">
                質問の順序を変更するには、質問カードをドラッグ＆ドロップしてください。
                <span
                  className="inline-block ml-2 cursor-help text-[#F2B705]"
                  title="ドラッグ＆ドロップで質問の順序を自由に変更できます。"
                >
                  <Info
                    className="h-4 w-4"
                    aria-label="質問の並び替えに関する追加情報"
                  />
                </span>
              </p>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {flatList.map((item, index) => {
                        if ("type" in item && item.type === "group") {
                          const groupName = item.name;
                          const isExpanded = expandedGroups[groupName];
                          return (
                            <Draggable
                              key={`group-${groupName}`}
                              draggableId={`group-${groupName}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`mb-4 ${
                                    snapshot.isDragging
                                      ? "border-2 border-[#F2B705] shadow-lg"
                                      : ""
                                  }`}
                                >
                                  <Card>
                                    <CardHeader
                                      className="bg-[#F2B705] text-[#262626] py-2 px-4"
                                      style={{ cursor: "pointer" }}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-move select-none"
                                            onMouseDown={(e) => e.preventDefault()}
                                          >
                                            <GripVertical className="h-5 w-5 text-[#262626]" />
                                          </div>
                                          <h3 className="text-sm font-medium ml-2">
                                            グルーピングランダム質問: {groupName}
                                          </h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newGroupName = prompt(
                                                "グループ名を編集してください:",
                                                groupName
                                              );
                                              if (
                                                newGroupName &&
                                                newGroupName.trim() !== ""
                                              ) {
                                                updateGroupName(
                                                  groupName,
                                                  newGroupName
                                                );
                                              }
                                            }}
                                            className="p-1"
                                          >
                                            グループ名を編集
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              toggleGroupExpansion(groupName)
                                            }
                                            className="p-1"
                                          >
                                            {isExpanded
                                              ? "グループ質問を折りたたむ ▲"
                                              : "グループ質問を展開 ▼"}
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeGroup(groupName)}
                                            aria-label="グループを削除"
                                            className="p-1 ml-2"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    {isExpanded && (
                                      <CardContent className="bg-white p-4">
                                        <DragDropContext
                                          onDragEnd={(result) =>
                                            onGroupDragEnd(result, groupName)
                                          }
                                        >
                                          <Droppable
                                            droppableId={`group-${groupName}`}
                                          >
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="space-y-2"
                                              >
                                                {item.items.map(
                                                  (question, idx) => (
                                                    <Draggable
                                                      key={question.id}
                                                      draggableId={question.id}
                                                      index={idx}
                                                    >
                                                      {(provided, snapshot) => (
                                                        <Card
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          className={`mb-4 select-none ${
                                                            snapshot.isDragging
                                                              ? "border-2 border-[#F2B705] shadow-lg"
                                                              : ""
                                                          }`}
                                                        >
                                                          <CardHeader className="bg-[#F2B705] text-[#262626] py-2 px-4">
                                                            <div className="flex justify-between items-center">
                                                              <div className="flex items-center">
                                                                <div
                                                                  {...provided.dragHandleProps}
                                                                  className="cursor-move select-none"
                                                                  onMouseDown={(e) => e.preventDefault()}
                                                                >
                                                                  <GripVertical className="h-5 w-5 text-[#262626]" />
                                                                </div>
                                                                <h4 className="text-sm font-medium ml-2">
                                                                  {question.text}
                                                                </h4>
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                  [{question.type ===
                                                                  "text"
                                                                    ? "記述式"
                                                                    : "選択式"}]
                                                                </span>
                                                              </div>
                                                              <div className="flex items-center space-x-2">
                                                                <Button
                                                                  variant="ghost"
                                                                  size="sm"
                                                                  onClick={() => {
                                                                    const newText = prompt(
                                                                      "質問文を編集してください:",
                                                                      question.text
                                                                    );
                                                                    if (
                                                                      newText !== null
                                                                    ) {
                                                                      updateQuestion(
                                                                        question.id,
                                                                        {
                                                                          text: newText,
                                                                        }
                                                                      );
                                                                    }
                                                                  }}
                                                                  className="p-1"
                                                                >
                                                                  質問文を編集
                                                                </Button>
                                                                <Select
                                                                  onValueChange={(
                                                                    value: "text" | "radio"
                                                                  ) =>
                                                                    updateQuestion(
                                                                      question.id,
                                                                      {
                                                                        type: value,
                                                                      }
                                                                    )
                                                                  }
                                                                  value={question.type}
                                                                >
                                                                  <SelectTrigger className="w-[100px]">
                                                                    <SelectValue />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                    <SelectItem value="text">
                                                                      記述式
                                                                    </SelectItem>
                                                                    <SelectItem value="radio">
                                                                      選択式
                                                                    </SelectItem>
                                                                  </SelectContent>
                                                                </Select>
                                                                {question.type ===
                                                                  "radio" && (
                                                                  <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                      toggleQuestionExpansion(
                                                                        question.id
                                                                      )
                                                                    }
                                                                    className="p-1"
                                                                  >
                                                                    {expandedQuestions[
                                                                      question.id
                                                                    ]
                                                                      ? "選択肢を隠す ▲"
                                                                      : "選択肢を編集 ▼"}
                                                                  </Button>
                                                                )}
                                                                <Button
                                                                  variant="destructive"
                                                                  size="sm"
                                                                  onClick={() =>
                                                                    removeQuestion(
                                                                      question.id
                                                                    )
                                                                  }
                                                                  aria-label="質問を削除"
                                                                  className="p-1"
                                                                >
                                                                  <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          </CardHeader>
                                                          {question.type ===
                                                            "radio" &&
                                                            expandedQuestions[
                                                              question.id
                                                            ] && (
                                                              <CardContent className="bg-white p-4">
                                                                <div className="mt-2">
                                                                  <p className="text-gray-600 text-sm mb-2">
                                                                    選択肢:
                                                                  </p>
                                                                  <ul className="space-y-2">
                                                                    {question.options?.map(
                                                                      (
                                                                        option,
                                                                        optionIndex
                                                                      ) => (
                                                                        <li
                                                                          key={
                                                                            optionIndex
                                                                          }
                                                                          className="flex items-center justify-between text-sm"
                                                                        >
                                                                          <span>
                                                                            {option}
                                                                          </span>
                                                                          <div>
                                                                            <Button
                                                                              size="sm"
                                                                              variant="outline"
                                                                              onClick={() => {
                                                                                const newOptions =
                                                                                  [
                                                                                    ...question.options!,
                                                                                  ];
                                                                                newOptions.splice(
                                                                                  optionIndex,
                                                                                  1
                                                                                );
                                                                                updateQuestion(
                                                                                  question.id,
                                                                                  {
                                                                                    options:
                                                                                      newOptions,
                                                                                  }
                                                                                );
                                                                              }}
                                                                              className="mr-2 p-1 h-6"
                                                                            >
                                                                              削除
                                                                            </Button>
                                                                            <Button
                                                                              size="sm"
                                                                              variant="outline"
                                                                              onClick={() => {
                                                                                const newOption =
                                                                                  prompt(
                                                                                    "選択肢を編集してください:",
                                                                                    option
                                                                                  );
                                                                                if (
                                                                                  newOption
                                                                                ) {
                                                                                  const newOptions =
                                                                                    [
                                                                                      ...question.options!,
                                                                                    ];
                                                                                  newOptions[
                                                                                    optionIndex
                                                                                  ] =
                                                                                    newOption;
                                                                                  updateQuestion(
                                                                                    question.id,
                                                                                    {
                                                                                      options:
                                                                                        newOptions,
                                                                                    }
                                                                                  );
                                                                                }
                                                                              }}
                                                                              className="p-1 h-6"
                                                                            >
                                                                              編集
                                                                            </Button>
                                                                          </div>
                                                                        </li>
                                                                      )
                                                                    )}
                                                                  </ul>
                                                                  <Button
                                                                    onClick={() => {
                                                                      const newOption = prompt(
                                                                        "新しい選択肢を入力してください:"
                                                                      );
                                                                      if (newOption) {
                                                                        updateQuestion(
                                                                          question.id,
                                                                          {
                                                                            options:
                                                                              [
                                                                                ...question.options!,
                                                                                newOption,
                                                                              ],
                                                                          }
                                                                        );
                                                                      }
                                                                    }}
                                                                    className="mt-2 text-sm p-2 h-8"
                                                                  >
                                                                    選択肢を追加
                                                                  </Button>
                                                                </div>
                                                              </CardContent>
                                                            )}
                                                        </Card>
                                                      )}
                                                    </Draggable>
                                                  )
                                                )}
                                                {provided.placeholder}
                                              </div>
                                            )}
                                          </Droppable>
                                        </DragDropContext>
                                        {/* グループに質問を追加 */}
                                        <Button
                                          onClick={() => {
                                            const newText = prompt(
                                              "新しい質問文を入力してください:"
                                            );
                                            if (newText && newText.trim() !== "") {
                                              const newQuestion: Question = {
                                                id:
                                                  Date.now().toString() +
                                                  Math.random()
                                                    .toString(36)
                                                    .substring(2, 9),
                                                type: "text",
                                                text: newText,
                                                isRandom: false,
                                                group: groupName,
                                              };
                                              setSettings((prevSettings) => ({
                                                ...prevSettings,
                                                questions: [
                                                  ...prevSettings.questions,
                                                  newQuestion,
                                                ],
                                              }));
                                            }
                                          }}
                                          className="mt-4"
                                        >
                                          質問を追加
                                        </Button>
                                      </CardContent>
                                    )}
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          );
                        } else {
                          const question = item as Question;
                          return (
                            <Draggable
                              key={question.id}
                              draggableId={question.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`mb-4 select-none ${
                                    snapshot.isDragging
                                      ? "border-2 border-[#F2B705] shadow-lg"
                                      : ""
                                  }`}
                                >
                                  <CardHeader className="bg-[#F2B705] text-[#262626] py-2 px-4">
                                    <div className="flex justify-between items-center">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-move select-none"
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        <GripVertical className="h-5 w-5 text-[#262626]" />
                                      </div>
                                      <div className="flex-grow mx-2 flex items-center">
                                        <h3 className="text-sm font-medium truncate">
                                          {question.text}
                                        </h3>
                                        <span className="ml-2 text-xs text-gray-500">
                                          [{question.type === "text"
                                            ? "記述式"
                                            : "選択式"}]
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newText = prompt(
                                              "質問文を編集してください:",
                                              question.text
                                            );
                                            if (newText !== null) {
                                              updateQuestion(question.id, {
                                                text: newText,
                                              });
                                            }
                                          }}
                                          className="p-1"
                                        >
                                          質問文を編集
                                        </Button>
                                        {question.type === "radio" && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              toggleQuestionExpansion(question.id)
                                            }
                                            className="p-1"
                                          >
                                            {expandedQuestions[question.id]
                                              ? "選択肢を隠す ▲"
                                              : "選択肢を編集 ▼"}
                                          </Button>
                                        )}
                                        <Select
                                          onValueChange={(value: "text" | "radio") =>
                                            updateQuestion(question.id, {
                                              type: value,
                                            })
                                          }
                                          value={question.type}
                                        >
                                          <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="text">記述式</SelectItem>
                                            <SelectItem value="radio">
                                              選択式
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>

                                        <div className="flex items-center space-x-1">
                                          <Checkbox
                                            id={`isRandom-${question.id}`}
                                            checked={question.isRandom}
                                            onCheckedChange={(checked) =>
                                              updateQuestion(question.id, {
                                                isRandom: checked as boolean,
                                              })
                                            }
                                          />
                                          <Label
                                            htmlFor={`isRandom-${question.id}`}
                                            className="text-sm"
                                          >
                                            ランダム表示
                                          </Label>
                                        </div>

                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeQuestion(question.id)}
                                          aria-label="質問を削除"
                                          className="p-1 ml-2"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  {question.type === "radio" &&
                                    expandedQuestions[question.id] && (
                                      <CardContent className="bg-white p-4">
                                        <div className="mt-2">
                                          <p className="text-gray-600 text-sm mb-2">
                                            選択肢:
                                          </p>
                                          <ul className="space-y-2">
                                            {question.options?.map(
                                              (option, optionIndex) => (
                                                <li
                                                  key={optionIndex}
                                                  className="flex items-center justify-between text-sm"
                                                >
                                                  <span>{option}</span>
                                                  <div>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        const newOptions = [
                                                          ...question.options!,
                                                        ];
                                                        newOptions.splice(
                                                          optionIndex,
                                                          1
                                                        );
                                                        updateQuestion(question.id, {
                                                          options: newOptions,
                                                        });
                                                      }}
                                                      className="mr-2 p-1 h-6"
                                                    >
                                                      削除
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        const newOption = prompt(
                                                          "選択肢を編集してください:",
                                                          option
                                                        );
                                                        if (newOption) {
                                                          const newOptions = [
                                                            ...question.options!,
                                                          ];
                                                          newOptions[optionIndex] =
                                                            newOption;
                                                          updateQuestion(question.id, {
                                                            options: newOptions,
                                                          });
                                                        }
                                                      }}
                                                      className="p-1 h-6"
                                                    >
                                                      編集
                                                    </Button>
                                                  </div>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                          <Button
                                            onClick={() => {
                                              const newOption = prompt(
                                                "新しい選択肢を入力してください:"
                                              );
                                              if (newOption) {
                                                updateQuestion(question.id, {
                                                  options: [
                                                    ...question.options!,
                                                    newOption,
                                                  ],
                                                });
                                              }
                                            }}
                                            className="mt-2 text-sm p-2 h-8"
                                          >
                                            選択肢を追加
                                          </Button>
                                        </div>
                                      </CardContent>
                                    )}
                                </Card>
                              )}
                            </Draggable>
                          );
                        }
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>

          {/* キーカラー設定 */}
          <Card className="mt-6 mb-6 border shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">キーカラー設定</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* テーマテンプレート選択 */}
              <div className="mb-6">
                <Label htmlFor="colorTheme" className="text-lg font-medium text-gray-700">
                  カラーテーマを選択
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  テンプレートを選択すると、関連するカラーが自動的に設定されます
                </p>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSettings({
                          ...settings,
                          primary_color: theme.primary,
                          secondary_color: "#ffffff",
                          accent_color: theme.accent,
                          text_color: theme.text,
                        });
                      }}
                      className="p-3 border rounded-lg hover:shadow-md transition-shadow relative overflow-hidden"
                      style={{ 
                        borderColor: theme.id === "simple-white" ? (theme.border || "#c0c0c0") : theme.primary,
                        borderWidth: "1px"
                      }}
                    >
                      <div className="flex flex-col items-center">
                        {/* テーマのプレビュー表示 */}
                        <div 
                          className="w-full h-24 rounded-md mb-2 overflow-hidden" 
                          style={{ backgroundColor: "#ffffff" }}
                        >
                          <div 
                            className="h-8 w-full"
                            style={{ backgroundColor: theme.primary }}
                          ></div>
                          <div className="p-2">
                            <div 
                              className="rounded-sm px-2 py-1 inline-block text-xs"
                              style={{ backgroundColor: theme.accent, color: "#fff" }}
                            >
                              サンプル
                            </div>
                            <div 
                              className="mt-2 text-xs font-medium overflow-visible"
                              style={{ color: theme.text }}
                            >
                              テキスト
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{theme.name}</span>
                      </div>
                      {settings.primary_color === theme.primary && 
                       settings.secondary_color === "#ffffff" &&
                       settings.accent_color === theme.accent &&
                       settings.text_color === theme.text && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 border border-white"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor" className="text-sm font-medium text-gray-700">
                    メインカラー
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.primary_color || "#F2B705" }}
                    />
                    <Input
                      id="primaryColor"
                      value={settings.primary_color || "#F2B705"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primary_color: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="mt-2">
                    <HexColorPicker
                      color={settings.primary_color || "#F2B705"}
                      onChange={(color) =>
                        setSettings({
                          ...settings,
                          primary_color: color,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ヘッダー、ボタン等</p>
                </div>
                
                <div>
                  <Label htmlFor="accentColor" className="text-sm font-medium text-gray-700">
                    ユーザーカラー
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.accent_color || "#F28705" }}
                    />
                    <Input
                      id="accentColor"
                      value={settings.accent_color || "#F28705"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          accent_color: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="mt-2">
                    <HexColorPicker
                      color={settings.accent_color || "#F28705"}
                      onChange={(color) =>
                        setSettings({
                          ...settings,
                          accent_color: color,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ユーザーメッセージのアイコン背景と強調テキスト</p>
                </div>
                
                <div>
                  <Label htmlFor="textColor" className="text-sm font-medium text-gray-700">
                    テキストカラー
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.text_color || "#262626" }}
                    />
                    <Input
                      id="textColor"
                      value={settings.text_color || "#262626"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          text_color: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="mt-2">
                    <HexColorPicker
                      color={settings.text_color || "#262626"}
                      onChange={(color) =>
                        setSettings({
                          ...settings,
                          text_color: color,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">テキスト</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-gray-700">カラープレビュー</h3>
                <div 
                  className="rounded-lg overflow-hidden border shadow-sm" 
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div 
                    className="p-3 font-semibold"
                    style={{ 
                      backgroundColor: settings.primary_color || "#F2B705",
                      color: settings.text_color || "#262626"
                    }}
                  >
                    アンケートヘッダー（メインカラー）
                  </div>
                  <div className="p-4 bg-white" style={{ color: settings.text_color || "#262626" }}>
                    <div className="mb-4">
                      <div className="flex items-start mb-4">
                        <div 
                          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-2"
                          style={{ backgroundColor: settings.primary_color || "#F2B705" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <div 
                          className="max-w-[80%] rounded-2xl p-3 shadow-sm rounded-tl-none"
                          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
                        >
                          AIメッセージです。次の質問に回答してください。
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-end mb-4">
                        <div 
                          className="max-w-[80%] rounded-2xl p-3 shadow-sm rounded-tr-none"
                          style={{ backgroundColor: settings.primary_color || "#F2B705" }}
                        >
                          ユーザー回答
                        </div>
                        <div 
                          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-2"
                          style={{ backgroundColor: settings.accent_color || "#F28705" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 border rounded-lg bg-white shadow-sm">
                      <p className="text-sm text-gray-500 mb-3">アンケート送信エリア</p>
                      <div className="flex justify-center">
                        <button
                          className="w-full py-3 text-center rounded-full font-bold transition-all"
                          style={{ 
                            backgroundColor: settings.primary_color || "#F2B705",
                            color: settings.text_color || "#262626"
                          }}
                        >
                          アンケートを送信
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ロゴアップロード */}
          <Card className="mb-6 border shadow-lg">
            <CardHeader className="bg-[#F2B705] text-[#262626]">
              <h2 className="text-xl font-semibold">ロゴ設定</h2>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label
                  htmlFor="logoUpload"
                  className="text-sm font-medium text-gray-700"
                >
                  レビュー確認画面のロゴ画像（推奨:200x50ピクセル、必須:2MB以下）
                </Label>
                <Input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      handleImageUpload(e, 'logo');
                    }
                  }}
                  className="mt-1"
                />
                <p className="mt-2 text-sm text-gray-500">
                  注意: 画像は200x50ピクセルが推奨で、ファイルサイズは2MB以下である必要があります。
                </p>
              </div>
              {settings.logo_url && (
                <div className="mt-4 flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden relative p-4">
                  <Image
                    src={settings.logo_url}
                    alt="Logo image"
                    width={200}
                    height={50}
                    className="rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleImageDelete('logo')}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 保存ボタンとプレビューボタン */}
          <div className="mt-6 flex justify-between">
            <Button
              onClick={saveSettings}
              className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
            >
              <Save className="h-4 w-4 mr-2" />
              全ての変更を保存
            </Button>
            <Button
              onClick={() => window.open(generateSurveyUrl(), "_blank")}
              className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
            >
              <Eye className="h-4 w-4 mr-2" />
              アンケートをプレビュー
            </Button>
          </div>

          {/* アンケートURLの表示 */}
          <Card className="mt-4 bg-white shadow-lg">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold text-[#262626] mb-2">
                アンケートURL
              </h2>
              <div className="flex items-center">
                <p className="text-[#262626] break-all flex-grow">
                  {generateSurveyUrl()}
                </p>
                <Button
                  onClick={() => copyToClipboard(generateSurveyUrl())}
                  className="ml-2 bg-[#FFF9E5] hover:bg-[#F2B705] text-[#262626]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  コピー
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}