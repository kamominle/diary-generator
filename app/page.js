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
          執筆欲にまみれたひつじ。なんと言っていいか、書いていいかわからない。そんな時、あなたの気持ちを代筆するよ。
        </p>
        {diaries && (
          <>
            {/* 固定カード */}
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              人気の代筆くん
            </h2>
            {diaries.find(diary => diary.id === 1) && (
              <div className="mb-6">
                <Link
                  href={`/${diaries.find(diary => diary.id === 1).slug}`}
                  className="block border rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {diaries.find(diary => diary.id === 1).name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {diaries.find(diary => diary.id === 1).description.length > 33
                      ? `${diaries.find(diary => diary.id === 1).description.slice(0, 33)}...`
                      : diaries.find(diary => diary.id === 1).description}
                  </p>
                </Link>
              </div>
            )}

            {/* 一覧部分 */}
            <h2 className="text-2xl font-bold mb-4">代筆くん一覧</h2>
            <div className="grid gap-4">
              {diaries
                .filter(diary => diary.initial_display && diary.id !== 1)
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(diary => diary && (
                  <div key={diary.id}>
                    <Link
                      href={`/${diary.slug}`}
                      className="block border rounded-lg p-4 shadow hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-bold text-gray-800">{diary.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {diary.description.length > 33 ? `${diary.description.slice(0, 33)}...` : diary.description}
                      </p>
                    </Link>
                  </div>
                ))}
            </div>
            {diaries.filter(diary => diary.initial_display && diary.id !== 1).length > itemsPerPage && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: Math.ceil(diaries.filter(diary => diary.initial_display && diary.id !== 1).length / itemsPerPage) }, (_, index) => (
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
          </>
        )}
      </div>
      </div>
    </div>
  );
}