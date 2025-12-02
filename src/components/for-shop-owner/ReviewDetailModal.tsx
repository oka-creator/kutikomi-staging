// src/components/for-shop-owner/ReviewDetailModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Review } from '@/types';

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
}

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ isOpen, onClose, review }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>口コミ詳細</DialogTitle>
          <DialogDescription>
            日付: {review.date}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p>{review.content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailModal;