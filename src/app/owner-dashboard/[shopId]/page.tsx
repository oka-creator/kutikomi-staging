"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/OwnerDashboard/Header";
import SurveyResponseList from "@/components/OwnerDashboard/SurveyResponseList";
import CustomPagination from "@/components/CustomPagination";
import { ShopData, SurveyResponse, Review, SurveySettings } from "@/types";
import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Head from "next/head";

function ReviewCounter({
  remainingCount,
  totalCount,
  nextUpdateDate,
}: {
  remainingCount: number;
  totalCount: number;
  nextUpdateDate: Date;
}) {
  const percentage = (remainingCount / totalCount) * 100;
  const color =
    percentage > 66 ? "#22c55e" : percentage > 33 ? "#eab308" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold text-gray-800">
            今月の残りレビュー生成回数
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <motion.div
            className="w-24 h-24 md:w-32 md:h-32"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <CircularProgressbar
                    value={percentage}
                    text={``}
                    styles={buildStyles({
                      pathColor: color,
                      trailColor: "#d1d5db",
                    })}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>月間上限: {totalCount}回</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          <motion.p
            className="mt-4 text-xl font-bold text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            あと{remainingCount}回
          </motion.p>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            次回更新日:{" "}
            {format(nextUpdateDate, "yyyy年MM月dd日", { locale: ja })}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OwnerDashboard() {
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [surveySettings, setSurveySettings] = useState<SurveySettings[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>("");
  const [remainingReviewCount, setRemainingReviewCount] = useState<
    number | null
  >(null);
  const [monthlyReviewLimit, setMonthlyReviewLimit] = useState<number | null>(
    null
  );
  const [nextUpdateDate, setNextUpdateDate] = useState<Date | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const shopId = params.shopId as string;
  const ITEMS_PER_PAGE = 12;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select(
          "id, name, monthly_review_limit, review_limit_reset_date, current_month_reviews"
        )
        .eq("id", shopId)
        .single();

      if (shopError) throw shopError;

      if (!shopData) {
        throw new Error("ショップデータが見つかりません。");
      }

      let updatedShopData: ShopData = shopData;

      if (
        updatedShopData.review_limit_reset_date &&
        new Date(updatedShopData.review_limit_reset_date) <= new Date()
      ) {
        const { data: updatedShop, error: updateError } = await supabase
          .from("shops")
          .update({
            review_limit_reset_date: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ),
            current_month_reviews: 0,
          })
          .eq("id", shopId)
          .select()
          .single();

        if (updateError) throw updateError;

        if (!updatedShop) {
          throw new Error("ショップデータの更新に失敗しました。");
        }

        updatedShopData = updatedShop;
      }

      setShopName(updatedShopData.name);
      setNextUpdateDate(new Date(updatedShopData.review_limit_reset_date));
      setMonthlyReviewLimit(updatedShopData.monthly_review_limit);
      setRemainingReviewCount(
        updatedShopData.monthly_review_limit -
          updatedShopData.current_month_reviews
      );

      let query = supabase
        .from("survey_responses")
        .select(
          `
          *,
          shops (id, name)
        `,
          { count: "exact" }
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: sortOrder === "asc" });

      if (dateRange.start && dateRange.end) {
        query = query
          .gte("created_at", dateRange.start.toISOString())
          .lte("created_at", dateRange.end.toISOString());
      }

      const {
        data: surveyResponsesData,
        error: surveyResponsesError,
        count,
      } = await query.range(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE - 1
      );

      if (surveyResponsesError) throw surveyResponsesError;

      const surveyResponseIds = surveyResponsesData?.map((sr) => sr.id) || [];

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .in("survey_response_id", surveyResponseIds);

      if (reviewsError) throw reviewsError;

      const { data: settingsData, error: settingsError } = await supabase
        .from("survey_settings")
        .select("*")
        .eq("shop_id", shopId)
        .maybeSingle();

      if (settingsError) throw settingsError;

      setSurveyResponses(surveyResponsesData || []);
      setReviews(reviewsData || []);
      setSurveySettings(settingsData ? [settingsData] : []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      setError("データの取得中にエラーが発生しました。");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentPage, sortOrder, shopId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSortOrderChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
    setCurrentPage(1);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
        <Header onSignOut={handleSignOut} shopName={shopName} />
        <main className="flex-1 p-4 md:p-6 overflow-auto mt-16 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#262626] mb-4">
            {shopName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {remainingReviewCount !== null &&
              monthlyReviewLimit !== null &&
              nextUpdateDate && (
                <div className="md:col-span-1">
                  <ReviewCounter
                    remainingCount={remainingReviewCount}
                    totalCount={monthlyReviewLimit}
                    nextUpdateDate={nextUpdateDate}
                  />
                </div>
              )}

            <div className="md:col-span-2">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-col sm:flex-row w-full space-y-2 sm:space-y-0 sm:space-x-4">
                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      handleSortOrderChange(value as "asc" | "desc")
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[120px] bg-white">
                      <SelectValue placeholder="並び順" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">新しい順</SelectItem>
                      <SelectItem value="asc">古い順</SelectItem>
                    </SelectContent>
                  </Select>
                  <DateRangePicker
                    key={Date.now()}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onRangeChange={handleDateRangeChange}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">エラー: </strong>
                    <span className="block sm:inline">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <SurveyResponseList
                surveyResponses={surveyResponses}
                reviews={reviews}
                surveySettings={surveySettings}
                isLoading={isLoading}
              />

              <CustomPagination
                className="mt-8"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
