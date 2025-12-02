'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewConfirmation from '@/components/review-confirmation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorHandler from '@/components/ErrorHandler';

export default function ReviewConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReviewConfirmationContent />
    </Suspense>
  );
}

function ReviewConfirmationContent() {
  const searchParams = useSearchParams();
  const surveyId = searchParams?.get('surveyId');

  if (!surveyId) {
    return <ErrorHandler error="Survey ID is missing" />;
  }

  return <ReviewConfirmation />;
}