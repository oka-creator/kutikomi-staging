import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { SurveyResponse, Review, SurveySettings } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import SurveyResponseDialog from "./SurveyResponseDialog";
import { motion } from "framer-motion";

interface SurveyResponseCardProps {
  response: SurveyResponse;
  reviews: Review[];
  surveySettings: SurveySettings | undefined;
  index: number;
}

const SurveyResponseCard: React.FC<SurveyResponseCardProps> = ({ response, reviews, surveySettings, index }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    console.log("SurveyResponseCard - props:", { response, reviews, surveySettings, index });
  }, [response, reviews, surveySettings, index]);

  if (!surveySettings) {
    console.warn("SurveyResponseCard - surveySettings is undefined");
    return null;
  }

  return (
    <>
      <motion.div
        className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => {
          console.log("SurveyResponseCard - Opening dialog");
          setIsDialogOpen(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <h3 className="font-semibold text-lg mb-2 text-[#262626]">{response.shops.name}</h3>
        <p className="text-sm text-gray-500">
          回答日時: {format(new Date(response.created_at), "yyyy/MM/dd HH:mm")}
        </p>
        <p className="text-sm text-[#F2B705] mt-2">関連する口コミ: {reviews.length}件</p>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SurveyResponseDialog response={response} reviews={reviews} surveySettings={surveySettings} />
      </Dialog>
    </>
  );
};

export default SurveyResponseCard;