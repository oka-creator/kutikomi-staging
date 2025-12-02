import React from "react";
import { motion } from "framer-motion";
import { SurveyResponse, Review, SurveySettings } from "@/types";
import SurveyResponseCard from "./SurveyResponseCard";

interface SurveyResponseListProps {
  surveyResponses: SurveyResponse[];
  reviews: Review[];
  surveySettings: SurveySettings[];
  isLoading: boolean;
}

const SurveyResponseList: React.FC<SurveyResponseListProps> = ({
  surveyResponses,
  reviews,
  surveySettings,
  isLoading,
}) => {
  console.log("SurveyResponseList - All reviews:", reviews);
  console.log("SurveyResponseList - All survey responses:", surveyResponses);

  if (isLoading) {
    return <div className="text-center text-[#262626]">読み込み中...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {surveyResponses.map((response, index) => {
        const responseReviews = reviews.filter((review) => review.survey_response_id === response.id);
        console.log(`SurveyResponse ${response.id} - Filtered reviews:`, responseReviews);
        
        return (
          <motion.div
            key={response.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SurveyResponseCard
              response={response}
              reviews={responseReviews}
              surveySettings={surveySettings.find((setting) => setting.shop_id === response.shop_id)}
              index={index}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default SurveyResponseList;