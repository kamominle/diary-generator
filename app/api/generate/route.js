import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(request) {
  const { prompt } = await request.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0].message.content.trim();

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
  }
}
