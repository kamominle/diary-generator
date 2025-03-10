import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(request) {
  const { prompt } = await request.json();

  const adjustedPrompt = `
${prompt}

【重要】上記の内容を「日本語で300文字以内」でまとめてください。
`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      // model: "gpt-3.5-turbo",
      // model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: adjustedPrompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content.trim();

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
  }
} 