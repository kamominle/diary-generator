'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Star } from 'react-feather';

export default function Home() {
  const [diaries, setDiaries] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchDiaries() {
      const { data: diariesData, error: diariesError } = await supabase
        .from('diaries')
        .select('*').order('id', { ascending: false });

      if (diariesError || !diariesData) {
        setError('日記一覧が見つかりませんでした。');
        return;
      }

      setDiaries(diariesData);
    }

    fetchDiaries();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 min-h-[600px]">
        <div className="mb-6">
          <p className="text-sm text-gray-600 m-4">
            なんと言っていいか、書いていいかわからない。そんな時、あなたの気持ちを代筆します。
          </p>
          <div className="grid gap-4">
            {diaries && diaries.filter(diary => diary.initial_display).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(diary => diary && (
              <div key={diary.id}>
                <Link href={`/${diary.slug}`} className="block border rounded-lg p-4 shadow hover:shadow-md transition">
                  <h2 className="text-xl font-bold text-gray-800">{diary.name}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {diary.description.length > 33 ? `${diary.description.slice(0, 33)}...` : diary.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
          {diaries && diaries.length > itemsPerPage && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: Math.ceil(diaries.length / itemsPerPage) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 bg-gray-200 rounded ${
                    currentPage === index + 1 ? 'bg-gray-400 text-white' : 'text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}