'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Star } from 'react-feather';

export default function Home() {
  const [diaries, setDiaries] = useState([]);
  const [error, setError] = useState('');

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
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-blue-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">代筆くん</h1>
        </div>
        <p className="text-sm text-gray-600 m-4">
            なんと言っていいか、書いていいかわからない。そんな時、あなたの気持ちを代筆します。
        </p>
        <div className="grid gap-4">
          {diaries.map(diary => (
            <div key={diary.id}>
              <Link
                href={`/${diary.slug}`}
                className="block p-4 bg-white rounded-lg shadow hover:bg-blue-50 transition text-gray-800"
              >
                {diary.name} 代筆くん
              </Link>
            </div>
          ))}
        </div>
        </div>
        </div>
        </div>
  );
}