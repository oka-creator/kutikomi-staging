// src/app/survey/limit-reached/page.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function LimitReachedPage() {
  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Image
            src="/images/アセット 3@3x.png"
            alt="クチコミファースト ロゴ"
            width={200}
            height={60}
          />
        </div>
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#262626] mb-4">
            アンケートは既に完了しています
          </h1>
          <p className="text-[#262626] mb-6">
            申し訳ありませんが、このアンケートは既に完了しております。
            ご協力ありがとうございました。
          </p>
          <button
            onClick={handleCloseWindow}
            className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626] font-bold py-2 px-4 rounded"
          >
            ページを閉じる
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}