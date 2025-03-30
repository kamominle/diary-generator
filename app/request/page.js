'use client';

import { Suspense } from 'react';
import FeedbackFormContent from './FeedbackFormContent';

export default function FeedbackFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
          <div className="container mx-auto p-6 text-center">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <FeedbackFormContent />
    </Suspense>
  );
}