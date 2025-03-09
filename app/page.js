'use client';

import { useState, useEffect } from 'react';
import { Star, AlertCircle, Send, Copy, RefreshCw } from 'react-feather';

export default function Home() {
  const [error, setError] = useState('');
  const [style, setStyle] = useState('かわいい');
  const [keyword, setKeyword] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosable, setPopupClosable] = useState(false);

  const clearError = () => {
    setError('');
  };

  const generateDiary = async () => {
    if (!keyword || !keyword.trim()) {
      setError('キーワードを入力してください。');
      return;
    }
    setLoading(true);
    setShowPopup(true);
    setPopupClosable(false);
    setCountdown(10);

    setOutput('');
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, keyword }),
      });
      const data = await res.json();
      setOutput(data.text);
    } catch (e) {
      setError('生成に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showPopup) {
      setPopupClosable(false);
      setPopupClosable(false);
      setTimeout(() => setPopupClosable(true), 10000);
      setCountdown(10);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => (prev > 1 ? prev - 1 : 0));
      }, 1000);

      setTimeout(() => {
        clearInterval(countdownInterval);
        setPopupClosable(true);
      }, 10000);

      return () => clearInterval(countdownInterval);
    }
  }, [showPopup]);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(output).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      setError('このブラウザはクリップボード機能に対応していません。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="text-pink-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">写メ日記生成ツール</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-3">日記のスタイルを選択：</p>
          <div className="flex flex-wrap gap-3">
            {['かわいい', '清楚', 'ツンデレ'].map((styleOption) => (
              <button
                key={styleOption}
                onClick={() => setStyle(styleOption)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  style === styleOption
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {styleOption}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キーワード
          </label>
          <div className="relative">
            <input
              className={`w-full border rounded-lg p-3 pr-12 outline-none transition-all text-gray-900 ${
                error && !keyword.trim() 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
              }`}
              style={{ color: '#555' }}
              value={keyword}
              placeholder="例: カフェ、旅行、友達との出会い..."
              onChange={(e) => {
                setKeyword(e.target.value);
                if (e.target.value.trim() && error === 'キーワードを入力してください。') {
                  setError('');
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && keyword.trim()) {
                  generateDiary();
                }
              }}
            />
            <button
              onClick={generateDiary}
              disabled={loading || !keyword.trim()}
              className="absolute right-2 top-2 p-1 rounded-md bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              aria-label="日記を生成"
            >
              <Send size={18} />
            </button>
          </div>
          {error && !keyword.trim() && (
            <p className="text-red-500 text-sm mt-1">キーワードは必須です</p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        )}

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

        {showPopup && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="mb-4">生成中です...</p>
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
    </div>
  );
}