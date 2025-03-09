'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Star, Copy, RefreshCw } from 'react-feather';

export default function DiaryPage() {
  const params = useParams();
  const slug = params.slug;

  const [diary, setDiary] = useState(null);
  const [diaryStyles, setDiaryStyles] = useState([]);
  const [diaryMemos, setDiaryMemos] = useState([]);
  const [style, setStyle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosable, setPopupClosable] = useState(false);
  console.log('diaryData:', diary);
  useEffect(() => {
    async function fetchDiaryData() {
      const { data: diaryData, error: diaryError } = await supabase
        .from('diaries')
        .select('*')
        .eq('slug', slug)
        .single();

      if (diaryError || !diaryData) {
        setError('日記が見つかりませんでした。');
        return;
      }

      setDiary(diaryData);
      setKeyword(diaryData.initial_keyword || '');

      const { data: stylesData } = await supabase
        .from('diary_styles')
        .select('*')
        .eq('diary_id', diaryData.id)
        .order('display_order');

      setDiaryStyles(stylesData || []);
      if (stylesData && stylesData.length > 0) {
        setStyle(stylesData[0].style_name);
      }

      const { data: memosData } = await supabase
        .from('diary_memos')
        .select('*')
        .eq('diary_id', diaryData.id)
        .order('display_order');

      setDiaryMemos(memosData || []);
    }

    fetchDiaryData();
  }, [slug]);

  const generateDiary = async () => {
    setLoading(true);
    setShowPopup(true);
    setPopupClosable(false);
    setCountdown(10);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setPopupClosable(true);
    }, 10000);

    const selectedStyle = diaryStyles.find(s => s.style_name === style);
    const memoInputs = diaryMemos.map((_, idx) => {
      const el = document.getElementById(`memo-input-${idx}`);
      return el ? el.value : '';
    });

    const prompt = `
${diary.prompt}
スタイル：${selectedStyle?.prompt_word || ''}
キーワード：${keyword}
${memoInputs.join('\n')}
    `;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setOutput(data.text);
    } catch (e) {
      setError('生成に失敗しました。');
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <div>{error}</div>;
  if (!diary) return <div>読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="text-pink-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">{diary.name}生成ツール</h1>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-3">スタイル選択：</p>
          <div className="flex gap-3">
            {diaryStyles.map(styleOption => (
              <button
                key={styleOption.id}
                onClick={() => setStyle(styleOption.style_name)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  style === styleOption.style_name ? 'bg-pink-500 text-white' : 'bg-gray-400'
                }`}
              >
                {styleOption.style_name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
        <label className="block mt-3 mb-1 text-sm font-medium text-gray-700">テーマ</label>
        <input
            value={keyword}
            placeholder={diary.initial_keyword || 'キーワードを入力'}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full p-3 border rounded-lg text-gray-600"
          />
        </div>

        <div>
          {diaryMemos.map((memo, idx) => (
            <div key={memo.id}>
              <label className="block mt-3 mb-1 text-sm font-medium text-gray-700">{memo.input_title}</label>
              <input
                id={`memo-input-${idx}`}
                placeholder={memo.placeholder}
                className="w-full p-3 border rounded-lg mt-2 text-gray-800"
              />
            </div>
          ))}
        </div>

        <button onClick={generateDiary} className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg">
          日記を生成
        </button>

        {output && (
          <div className="mt-4">
            <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
              {output}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                aria-label="テキストをコピー"
              >
                <Copy size={16} />
                {copied ? 'コピーしました！' : 'コピー'}
              </button>
              <button
                onClick={generateDiary}
                className="flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
                aria-label="日記を再生成"
              >
                <RefreshCw size={16} />
                再生成
              </button>
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4 text-gray-700">生成中です...</p>
            <button
              disabled={!popupClosable}
              className={`px-4 py-2 rounded ${popupClosable ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              onClick={() => setShowPopup(false)}
            >
              閉じる {popupClosable ? '' : `(${countdown})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}