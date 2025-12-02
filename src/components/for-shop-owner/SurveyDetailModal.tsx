// src/components/for-shop-owner/SurveyDetailModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Survey } from '@/types';

interface SurveyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
}

const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({ isOpen, onClose, survey }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>アンケート詳細</DialogTitle>
          <DialogDescription>
            顧客名: {survey.customerName}<br />
            日付: {survey.date}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {survey.questions.map((question, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold">{question.text}</p>
              <p>{question.answer}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDetailModal;