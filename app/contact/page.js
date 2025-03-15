'use client';

import { useState } from 'react';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [disabled, setDisabled] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (disabled) return;
        setDisabled(true);
        setTimeout(() => setDisabled(false), 60000); // 60秒間の連投防止

        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message: message }),
        });

        if (res.ok) {
            setName('');
            setEmail('');
            setMessage('');
            setStatus('送信しました。お問い合わせありがとうございます。');
        } else {
            setStatus('送信に失敗しました。後ほど再度お試しください。');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
                <div className="container mx-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-800">お問い合わせ</h1>

                    {status && <p className="mt-2 text-green-600">{status}</p>}

                    <form className="mt-4" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700" htmlFor="name">お名前</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full border rounded-md p-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700" htmlFor="email">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full border rounded-md p-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700" htmlFor="message">お問い合わせ内容</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="mt-1 block w-full border rounded-md p-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={disabled}
                            className={`w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            送信
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}