import { NextResponse } from 'next/server';

export async function POST(request) {
  const { name, email, message } = await request.json();

  const roomId = process.env.CHATWORK_ROOM_ID;
  const apiToken = process.env.CHATWORK_API_KEY;
  const chatworkEndpoint = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;

  const body = `[info][title]お問い合わせを受信しました[/title]名前：${name}\nメール：${email}\n\n内容：${message}[/info]`;

  try {
    const res = await fetch(chatworkEndpoint, {
      method: 'POST',
      headers: {
        'X-ChatWorkToken': apiToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ body }),
    });

    if (!res.ok) throw new Error(`Chatwork API error: ${res.statusText}`);

    return NextResponse.json({ message: 'お問い合わせを受信しました。' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '送信に失敗しました。' }, { status: 500 });
  }
}
