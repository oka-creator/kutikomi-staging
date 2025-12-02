// src/components/for-shop-owner/ReviewList.tsx
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Review } from '@/types';
import ReviewDetailModal from './ReviewDetailModal';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>内容</TableHead>
            <TableHead>詳細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.date}</TableCell>
              <TableCell>{review.content.substring(0, 50)}...</TableCell>
              <TableCell>
                <Button variant="link" onClick={() => setSelectedReview(review)}>詳細を見る</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedReview && (
        <ReviewDetailModal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          review={selectedReview}
        />
      )}
    </>
  );
};

export default ReviewList;