import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';  // ←必ず追加

export async function POST(request) {
  const { style, keyword } = await request.json();

  const prompt = `
  あなたは魅力的な「写メ日記」を書いています。
  下記の条件を満たして「300文字以内（日本語換算）」でまとめてください。

  キーワード：${keyword}
  文体：${style}

  【条件】
  - 親しみやすい表現を使う
  - 結びにお礼とまた会いたい旨を伝える
  - 日常の出来事を簡潔に盛り込み、共感を誘う
  - 若い女性らしく絵文字を多く使い賑やかに
  - 少しだけエッチなニュアンスを含める
  - 出勤情報をさりげなく入れる

  以上を踏まえて日記を作成してください。
  `;

  // ランタイム時に環境変数を取得（Edgeランタイム対応）
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,  // ←max_tokensを増やし全文出力されるよう改善
    });

    const text = completion.choices[0].message.content.trim();

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
  }
}
