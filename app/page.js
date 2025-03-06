'use client';

import { useState } from 'react';

export default function Home() {
  const [style, setStyle] = useState('かわいい');
  const [keyword, setKeyword] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateDiary = async () => {
    if (!keyword) {
      alert('キーワードを入力してください。');
      return;
    }

    setLoading(true);
    setOutput('');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style, keyword }),
    });

    const data = await res.json();

    if (res.ok) {
      setOutput(data.text);
    } else {
      alert('生成エラー：' + data.error);
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => alert('コピーしました！'));
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-xl font-bold mb-4">写メ日記生成ツール</h1>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="かわいい"
            checked={style === 'かわいい'}
            onChange={() => setStyle('かわいい')}
          />
          かわいい
        </label>
        <label>
          <input
            type="radio"
            value="清楚"
            checked={style === '清楚'}
            onChange={() => setStyle('清楚')}
          />
          清楚
        </label>
      </div>

      <input
        className="border rounded p-2 w-full mb-4"
        value={keyword}
        placeholder="キーワードを入力"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <button
        onClick={generateDiary}
        disabled={loading}
        className="bg-blue-500 text-white rounded p-2"
      >
        {loading ? '生成中...' : '写メ日記を生成する'}
      </button>

      {output && (
        <>
          <div className="mt-4 p-4 border rounded whitespace-pre-wrap">
            {output}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={copyToClipboard}
              className="bg-green-500 text-white p-2 rounded"
            >
              コピー
            </button>
            <button
              onClick={generateDiary}
              className="bg-gray-300 text-white p-2 rounded"
            >
              再生成
            </button>
          </div>
        </>
      )}
    </div>
  );
}
