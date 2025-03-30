'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Star, Copy, RefreshCw, Loader, ChevronDown, ChevronUp } from 'react-feather';
import DOMPurify from 'dompurify';
import { ThumbsUp, ThumbsDown } from 'react-feather';
import ShameDiaryPage from './ShameDiaryPage';

export default function ClientPage() {
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
  const [countdown, setCountdown] = useState(5);
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosable, setPopupClosable] = useState(false);
  const [debugPrompt, setDebugPrompt] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [memoErrors, setMemoErrors] = useState({});
  const [feedbackSent, setFeedbackSent] = useState(false);
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
  setFormError('');

  const memoInputs = diaryMemos.map((memo, idx) => {
    const element = document.getElementById(`memo-input-${idx}`);
    const value = element ? element.value : '';
    if (!value.trim()) return null;
    return { input_title: memo.input_title, prompt: memo.prompt, value };
  }).filter(Boolean);

  const hasErrors = Object.values(memoErrors).some(error => !!error);
  if (hasErrors) return;

  setError(''); // エラーをクリア
  setShowOutput(false);
  setLoading(true);
  setShowPopup(true);
  setPopupClosable(false);
  setCountdown(5);

  const countdownInterval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(countdownInterval);
        setPopupClosable(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  const selectedStyle = diaryStyles.find(s => s.style_name === style);
  const memoText = memoInputs
    .map(memo => `${memo.prompt}：${memo.value}`)
    .join('\n');

const prompt = `
ルール：${diary.prompt}
${diary.word_count || 300}文字以内（日本語換算）でまとめてください。
スタイル：${selectedStyle?.prompt_word || ''}
${memoText}

キーワード：${keyword}
`;
  setDebugPrompt(prompt);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    console.log('API Response:', data);
    
    setOutput(DOMPurify.sanitize(data.text));
    
    if (data.moderation_flagged) {
      setShowPopup(false);
      setShowOutput(true);
      clearInterval(countdownInterval);
    } else {
      await supabase
        .from('diary_logs')
        .insert({
          diary_id: diary.id,
          input_prompt: prompt,
          output_text: data.text,
          style_name: selectedStyle?.style_name,
          keyword: keyword,
          memo_inputs: memoInputs
        });
    }

  } catch (e) {
    console.error('生成エラー:', e);
    setError('生成に失敗しました。');
    setShowPopup(false);
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  async function sendFeedback(type) {
    if (feedbackSent) return;
    const { error } = await supabase.from('diary_feedback').insert({
      diary_id: diary.id,
      feedback_type: type,
    });
  
    if (!error) {
      setFeedbackSent(true);
    } else {
      console.error('Feedback Error:', error.message, error.details);
    }
  }

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 text-red-500">
        {error}
      </div>
    </div>
  );

  // 関数内に追加
  if (slug === 'shame-diary') {
    return <ShameDiaryPage />;
  }

  if (!diary) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex flex-col items-center justify-center">
      <div className="animate-spin mb-4">
        <Loader size={32} className="text-blue-500" />
      </div>
      <p className="text-gray-600 animate-pulse">読み込み中...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.href}`)}
            className="text-[10px] flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
            >
            <Copy size={16} />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`【${diary.name}】 ${diary.description}`)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg transition-all"
          >
            X
          </a>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`【${diary.name}】 ${diary.description}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            LINE
          </a>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">{diary.name} 代筆くん</h1>
          </div>
          {diary.description && (
            <p className="text-sm text-gray-600 m-4">
              {diary.description}
            </p>
          )}
        </div>

{diaryStyles.length > 0 && (
  <div className="bg-gray-50 p-4 rounded-lg mb-6">
    <p className="text-sm text-gray-600 mb-3">スタイル選択：</p>
    <div className="flex flex-wrap gap-1 md:gap-3">
      {diaryStyles.map(styleOption => (
        <button
          key={styleOption.id}
          onClick={() => setStyle(styleOption.style_name)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            style === styleOption.style_name ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {styleOption.style_name}
        </button>
      ))}
    </div>
  </div>
)}

  <div className="mt-6">
    <label className="block mt-3 mb-1 text-sm font-medium text-gray-700">キーワード</label>
    <input
      placeholder={diary.initial_keyword || 'キーワードを入力'}
      onChange={(e) => {
        setKeyword(e.target.value);
        if (e.target.value.length > 500) {
          setFormError('キーワードは500文字以内で入力してください');
        } else {
          setFormError('');
        }
      }}
      className={`w-full p-3 border rounded-lg text-gray-600 ${
        formError ? 'border-red-500' : ''
      }`}
    />
    <p className="text-sm text-gray-600 m-2">
      書きたい内容をかんたんに入力してください。
    </p>
    {formError && (
      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
        <p>{formError}</p>
      </div>
    )}
  </div>

        <div className="mt-6">
          {diaryMemos.length > 0 && (
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-700">こだわり条件</h2>
                <span className="text-xs text-gray-500">（任意）</span>
              </div>
              {isAccordionOpen ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
          )}

          {isAccordionOpen && diaryMemos.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
              <div className="space-y-4">
                {diaryMemos.map((memo, idx) => (
                  <div key={memo.id} className="mb-4">
                    <label className="block mb-1">{memo.input_title}</label>
                    <input
                      id={`memo-input-${idx}`}
                      placeholder={memo.placeholder}
                      className={`w-full p-3 border rounded-lg ${memoErrors[idx] ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMemoErrors(prev => ({
                          ...prev,
                          [idx]: value.length > 100 ? '入力が長すぎます（100文字以内）' : ''
                        }));
                      }}
                    />
                    {memoErrors[idx] && <p className="text-red-500 text-sm mt-1">{memoErrors[idx]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={generateDiary} 
          className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!!formError}
        >
          代筆する
        </button>

        <div className="mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] whitespace-pre-wrap text-gray-500">
            {output && showOutput ? (
              <div className="text-gray-800">{output}</div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm">
              </div>
            )}
          </div>

          {output && showOutput && (
        <div className="mt-6">
            <div className="flex flex-wrap flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                aria-label="テキストをコピー"
              >
                <Copy size={16} />
                {copied ? 'コピーしました！' : 'コピー'}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${output}\n\n${diary.name}\n${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all"
              >
                Xに投稿
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${output} 【${diary.name}（代筆くん）】`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                LINEで共有
              </a>
              <button
                onClick={generateDiary}
                className="flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
                aria-label="代筆を再生成"
              >
                <RefreshCw size={16} />
                再生成
              </button>
              <div className="mt-4 text-gray-700">
                <p>代筆は役に立ちましたか？</p>
                {!feedbackSent ? (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => sendFeedback('good')}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg flex items-center gap-1"
                      disabled={feedbackSent}
                    >
                      <ThumbsUp size={16} /> GOOD
                    </button>
                    <button
                      onClick={() => sendFeedback('bad')}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg flex items-center gap-1"
                      disabled={feedbackSent}
                    >
                      <ThumbsDown size={16} /> BAD
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">ご協力ありがとうございます♪</p>
                )}
              </div>
              </div>
              </div>
            )}
        </div>

        {/* 広告の挿入位置 */}
        <div 
          className="mt-6 p-4 rounded-lg border border-gray-200 text-center flex flex-col items-center justify-center"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(`
            ★TVで話題★<br>
            24時間相談できる「ココナラ電話占い」[PR]<br>
            <a href="https://px.a8.net/svt/ejp?a8mat=3NAJSM+69NH82+2PEO+C4DVL" rel="nofollow">
              <img border="0" width="100%" alt="" src="https://www28.a8.net/svt/bgt?aid=220521910379&wid=009&eno=01&mid=s00000012624002036000&mc=1">
            </a>
            <img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=3NAJSM+69NH82+2PEO+C4DVL" alt="">
            `)
          }}
        />

        <div className="w-full text-center mt-4 clear-both">
          <a href="/" className="text-blue-500 underline">トップページに戻る</a>
          <span className="mx-2">|</span>
          <a href={`/request?botId=${diary.id}`} className="text-blue-500 underline">機能改善のご要望</a>
        </div>
        {/* <div className="mt-4 bg-gray-100 p-4 rounded-lg">
    <h3 className="font-bold text-sm text-gray-600">検証用プロンプト：</h3>
    <pre className="text-gray-700 whitespace-pre-wrap">{debugPrompt}</pre>
</div> */}
      {diary.column && (
<div
  className="column mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(diary.column) }}
/>
)}

      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-white/80 bg-opacity-70 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {countdown === 0 ? '代筆完了！' : `代筆中です...（残り${countdown}秒）`}
            </h3>
            <div className="my-6 flex justify-center">
            <div
              dangerouslySetInnerHTML={{
                __html: `★TVで話題★<br>
            24時間相談できる「ココナラ電話占い」[PR]<br>
            <a href="https://px.a8.net/svt/ejp?a8mat=3NAJSM+69NH82+2PEO+C4DVL" rel="nofollow">
              <img border="0" width="100%" alt="" src="https://www28.a8.net/svt/bgt?aid=220521910379&wid=009&eno=01&mid=s00000012624002036000&mc=1">
            </a>
            <img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=3NAJSM+69NH82+2PEO+C4DVL" alt="">`
              }}
            />
            </div>
            {/* <img src="/writing.png" alt="代筆中" className="mx-auto my-4" style={{ width: '200px' }} /> */}
            <button
              disabled={!popupClosable}
              className={`px-4 py-2 rounded ${popupClosable ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              onClick={() => {
                setShowPopup(false);
                setShowOutput(true);
              }}
            >
              表示
            </button>
          </div>
        </div>
      )}
    </div>
  );
}