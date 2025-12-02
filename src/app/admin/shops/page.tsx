import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ShopsPageContent = dynamic(() => import('@/components/for-admin/ShopsPageContent'), {
  ssr: false,
});

export default function ShopsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopsPageContent />
    </Suspense>
  );
}