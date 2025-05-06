import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';



// 入力値の検証用ユーティリティ関数を修正
const validateInput = (prompt, keyword) => {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: "無効なプロンプトです" };
  }

  if (prompt.length > 3000) {
    return { isValid: false, error: "プロンプトが長すぎます（3000文字以内）" };
  }

  if (!keyword || typeof keyword !== 'string') {
    return { isValid: false, error: "キーワードが指定されていません" };
  }

  return { isValid: true };
};

export async function POST(request) {
  try {
    // リクエストからpromptとkeywordを取得
    const { prompt, keyword } = await request.json();
    
    // 入力値の検証
    const validation = validateInput(prompt, keyword);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Grok（xAI API）用クライアント
    const openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,  // Grok の API Key
      baseURL: 'https://api.x.ai/v1',   // Grok エンドポイント
    });

    // プロンプトとキーワードを組み合わせて送信
    const userPrompt = `${prompt}\nキーワード: ${keyword}`;

    // Grok への呼び出し
    const completion = await openai.chat.completions.create({
      model: 'grok-3-beta',  // Grok モデル名
      messages: [
        { 
          role: 'system', 
          content: '写メ日記という風俗の女性キャストがお客様向けに発信する文章を生成'
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0].message.content.trim();
    if (!text || text.length > 2000) {
      throw new Error('無効な応答が生成されました');
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '文章生成に失敗しました。' },
      { status: 500 }
    );
  }
}