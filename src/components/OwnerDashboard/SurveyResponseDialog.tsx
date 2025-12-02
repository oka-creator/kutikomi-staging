import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SurveyResponse, Review, SurveySettings } from '@/types';
import { motion } from 'framer-motion';

interface SurveyResponseDialogProps {
  response: SurveyResponse;
  reviews: Review[];
  surveySettings: SurveySettings;
}

const SurveyResponseDialog: React.FC<SurveyResponseDialogProps> = ({ response, reviews, surveySettings }) => {
  useEffect(() => {
    console.log("SurveyResponseDialog - props:", { response, reviews, surveySettings });
  }, [response, reviews, surveySettings]);

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-[90vw] min-w-[280px] bg-[#FFF9E5]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-[#262626]">アンケート回答詳細</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] mt-4">
        {Object.entries(response.answers).map(([questionId, answer], index) => {
          const question = surveySettings.questions.find(q => q.id === questionId);
          console.log(`Question ${index + 1}:`, { questionId, answer, question });
          return (
            <motion.div
              key={questionId}
              className="mb-6 bg-white p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="font-medium text-[#262626] mb-2 bg-[#F2B705] p-2 rounded">
                {question ? question.text : `質問 ID: ${questionId}`}
              </h3>
              <p className="text-gray-600 bg-[#FFF9E5] p-2 rounded">{String(answer)}</p>
            </motion.div>
          );
        })}
        <p className="text-sm text-gray-500 mt-4">
          回答日時: {format(new Date(response.created_at), 'yyyy/MM/dd HH:mm')}
        </p>
        {reviews.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-medium text-[#262626]">関連する口コミ</h3>
            {reviews.map((review: Review, index) => {
              console.log(`Review ${index + 1}:`, review);
              return (
                <motion.div
                  key={review.id}
                  className="mt-2 p-2 bg-white rounded shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <p className="text-gray-600">{review.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(review.created_at), 'yyyy/MM/dd HH:mm')}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">関連する口コミはありません。</p>
        )}
      </ScrollArea>
    </DialogContent>
  );
};

export default SurveyResponseDialog;