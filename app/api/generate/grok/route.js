import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// 入力値の検証用ユーティリティ関数
const validateInput = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: "無効な入力です" };
  }

  if (prompt.length > 3000) {
    return { isValid: false, error: "入力が長すぎます（3000文字以内）" };
  }

  // 必須項目のチェック
  const requiredFields = ['スタイル：', 'キーワード：', 'ルール：'];
  for (const field of requiredFields) {
    if (!prompt.includes(field)) {
      return { isValid: false, error: `${field.replace('：', '')}が指定されていません` };
    }
  }

  return { isValid: true };
};

export async function POST(request) {
  try {
    const { prompt } = await request.json()
    const validation = validateInput(prompt)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Grok（xAI API）用クライアント
    const openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,         // Grok の API Key
      baseURL: 'https://api.x.ai/v1',         // Grok エンドポイント
    })

    // （※モデレーションが必要なら OpenAI 本家クライアントを別途用意してください）
    // → ここでは省略 or 継続利用可

    // Grok への呼び出し
    const completion = await openai.chat.completions.create({
      model: 'grok-3-mini-beta',                         // Grok モデル名に変更
      messages: [
        { role: 'system', content: 'You are Grok, a helpful assistant.' },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const text = completion.choices[0].message.content.trim()
    if (!text || text.length > 2000) {
      throw new Error('無効な応答が生成されました')
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: '文章生成に失敗しました。' },
      { status: 500 }
    )
  }
}