"use client";

import React, { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";
import AdminHeader from "@/components/for-admin/shops/AdminHeader";
import ShopList from "@/components/for-admin/shops/ShopList";
import ShopEditForm from "@/components/for-admin/shops/ShopEditForm";
import ShopRegistrationForm, {
  ShopData,
} from "@/components/for-admin/ShopRegistrationForm";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { PlusCircle, X } from "lucide-react";
import Footer from "@/components/Footer";
import { Shop } from "@/lib/shop";

// QueryClientのインスタンスを作成
const queryClient = new QueryClient();

// Supabaseからショップデータを取得する関数
const fetchShops = async (
  page: number,
  limit: number,
  searchQuery: string
) => {
  const supabase = createClientComponentClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("shops")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false }) // ソートを追加
    .range(from, to);

  if (searchQuery.trim() !== "") {
    query = query.ilike("name", `%${searchQuery.trim()}%`); // 検索条件を追加
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { shops: data, totalCount: count };
};

// メインのコンテンツコンポーネント
function ShopsPageContentInner() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [slideContent, setSlideContent] = useState<"edit" | "register" | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>(""); // 検索クエリの状態
  const shopsPerPage = 10;

  // ショップデータを取得するクエリ
  const { data, isLoading, error } = useQuery(
    ["shops", currentPage, searchQuery], // キーに searchQuery を含める
    () => fetchShops(currentPage, shopsPerPage, searchQuery), // 関数に searchQuery を渡す
    { keepPreviousData: true }
  );

  // ショップ選択時の処理
  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setSlideContent("edit");
    setIsSlideOpen(true);
  };

  // ショップ更新時の処理
  const handleShopUpdate = async (
    updatedShopData: Shop,
    newEmail?: string,
    newPassword?: string
  ) => {
    try {
      const supabase = createClientComponentClient();

      // ショップ情報の更新
      const { data, error } = await supabase
        .from("shops")
        .update({
          name: updatedShopData.name,
          address: updatedShopData.address,
          google_review_url: updatedShopData.google_review_url,
          business_type: updatedShopData.business_type,
          monthly_review_limit: updatedShopData.monthly_review_limit,
          // 他の必要なフィールド
        })
        .eq("id", updatedShopData.id)
        .select()
        .single();

      if (error) throw error;

      // ユーザー情報の更新が必要な場合
      if (newEmail || newPassword) {
        const response = await fetch("/api/admin/update-shop-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: updatedShopData.owner_id, // ここでowner_idを使用
            email: newEmail,
            password: newPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "ユーザー情報の更新に失敗しました"
          );
        }
      }

      queryClient.invalidateQueries("shops");
      setIsSlideOpen(false);
      toast.success("ショップ情報が正常に更新されました。");
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error("ショップ情報の更新に失敗しました。");
    }
  };

  // 新規ショップ登録時の処理
  const handleShopRegister = async (shopData: ShopData) => {
    try {
      const response = await fetch("/api/admin/register-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register shop");
      }

      queryClient.invalidateQueries("shops");
      setIsSlideOpen(false);
      toast.success("新しいショップが正常に登録されました。");
    } catch (error) {
      console.error("ショップ登録エラー:", error);
      toast.error("ショップの登録に失敗しました。");
    }
  };

  // ショップ削除時の処理
  const handleShopDelete = async (shop: Shop) => {
    if (window.confirm("本当にこのショップを削除してもよろしいですか？この操作は取り消せません。")) {
      try {
        const response = await fetch('/api/admin/delete-shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId: shop.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'ショップの削除に失敗しました。');
        }

        queryClient.invalidateQueries('shops');
        toast.success('ショップが正常に削除されました。');
      } catch (error) {
        console.error('Error deleting shop:', error);
        toast.error('ショップの削除に失敗しました。');
      }
    }
  };


  // ページ変更時の処理
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // スライドを閉じる処理
  const handleCloseSlide = () => {
    setIsSlideOpen(false);
    setSlideContent(null);
  };

  // 検索フォームの送信ハンドラ
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // 検索時にページをリセット
    // 検索クエリは既に state に保存されているため、useQuery が再フェッチします
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <AdminHeader />
      <main className="flex-1 p-6 mt-16 overflow-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#262626]">ショップ管理</h1>
            <Button
              onClick={() => {
                setSlideContent("register");
                setIsSlideOpen(true);
              }}
              className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              新規ショップ登録
            </Button>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xl font-semibold text-[#262626]">
                総ショップ数: {data?.totalCount || 0}
              </p>
              {/* 追加: 検索フォーム */}
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="ショップ名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border rounded-l-md focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F2B705] text-[#262626] rounded-r-md hover:bg-[#F28705]"
                >
                  検索
                </button>
              </form>
            </div>
            <ShopList
      shops={data?.shops || []}
      isLoading={isLoading}
      onShopSelect={handleShopSelect}
      onShopDelete={handleShopDelete} // onShopDeleteプロップを追加
    />
            {data && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="mr-2"
                >
                  前へ
                </Button>
                <span className="mx-4 flex items-center">
                  ページ {currentPage} /{" "}
                  {Math.ceil((data.totalCount || 0) / shopsPerPage)}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil((data.totalCount || 0) / shopsPerPage)
                  }
                  className="ml-2"
                >
                  次へ
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {isSlideOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black"
                onClick={handleCloseSlide}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-14 right-0 w-full max-w-md h-[calc(100vh-3rem)] bg-white shadow-lg flex flex-col"
              >
                <div className="bg-[#F2B705] text-[#262626] px-4 py-2 flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {slideContent === "edit"
                      ? "ショップ編集"
                      : "新規ショップ登録"}
                  </h2>
                  <Button
                    onClick={handleCloseSlide}
                    variant="ghost"
                    size="icon"
                    className="text-[#262626] hover:bg-[#F28705]"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {slideContent === "edit" && selectedShop && (
                    <ShopEditForm
                      shop={selectedShop}
                      onSubmit={handleShopUpdate}
                    />
                  )}
                  {slideContent === "register" && (
                    <ShopRegistrationForm onSubmit={handleShopRegister} />
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// QueryClientProviderでラップしたコンポーネント
export default function ShopsPageContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShopsPageContentInner />
    </QueryClientProvider>
  );
}
