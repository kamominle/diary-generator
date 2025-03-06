import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';  // ←必ず追加

export async function POST(request) {
  const { style, keyword } = await request.json();

  const prompt = `
あなたは写メ日記を書く女性です。
以下の条件を満たして写メ日記を作成してください。

キーワード：${keyword}
文体：${style}

【条件】
- 一人称で、親しみやすくフレンドリーに書く
- 絵文字を適度に入れて、読者に語りかけるような自然な文体にする
- お客様への感謝や親近感が伝わるようにする
`;

  // ランタイム時に環境変数を取得（Edgeランタイム対応）
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = completion.choices[0].message.content.trim();

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
  }
}
