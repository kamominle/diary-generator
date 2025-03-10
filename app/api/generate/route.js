import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(request) {
  const { prompt } = await request.json();

  const adjustedPrompt = `
${prompt}

【追加条件】安全で適切な内容を300文字以内でまとめてください。
`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const moderationResponse = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: prompt,
    });

    if (moderationResponse.results[0].flagged) {
      return NextResponse.json({ 
        moderation_flagged: true,
        text: "入力内容に公序良俗に反するキーワードを検知しました。キーワードを修正してください。"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      // model: "gpt-3.5-turbo",
      // model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: adjustedPrompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content.trim();

    return NextResponse.json({ text, moderation_flagged: false });
  } catch (error) {
    return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
  }
}