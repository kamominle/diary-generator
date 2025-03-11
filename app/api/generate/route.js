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
    const { prompt } = await request.json();

    // 入力値の検証
    const validation = validateInput(prompt);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const adjustedPrompt = `
${prompt}
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      // モデレーションチェック
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

      // OpenAI APIの呼び出し
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: adjustedPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const text = completion.choices[0].message.content.trim();

      // 生成されたテキストの検証
      if (!text || text.length > 2000) {
        throw new Error("無効な応答が生成されました");
      }

      return NextResponse.json({ text, moderation_flagged: false });
    } catch (error) {
      console.error('OpenAI Error:', error);
      return NextResponse.json({ error: "文章生成に失敗しました。" }, { status: 500 });
    }
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json({ error: "無効なリクエストです。" }, { status: 400 });
  }
}