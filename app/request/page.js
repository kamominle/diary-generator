'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function FeedbackForm() {
    const searchParams = useSearchParams();
    const initialBotId = searchParams.get('botId');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [botType, setBotType] = useState(initialBotId || '');
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchBots() {
            try {
                setLoading(true);
                const { data: diariesData, error: diariesError } = await supabase
                    .from('diaries')
                    .select('*')
                    .eq('initial_display', true)  // initial_displayがtrueのものだけを取得
                    .order('id', { ascending: true });

                if (diariesError) {
                    throw diariesError;
                }

                if (diariesData) {
                    // ボットリストの先頭に「選択してください」を追加
                    const formattedBots = [{ id: '', name: '選択してください' }, ...diariesData.map(diary => ({
                        id: diary.id,
                        name: diary.name  // diariesテーブルのnameフィールドを使用
                    }))];
                    setBots(formattedBots);
                }
            } catch (error) {
                console.error('ボットリストの取得に失敗しました:', error.message);
                setError('ボットリストの取得に失敗しました。再読み込みしてお試しください。');
            } finally {
                setLoading(false);
            }
        }

        fetchBots();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConfirming) {
            setIsConfirming(true);
            return;
        }

        if (disabled) return;
        setDisabled(true);
        setTimeout(() => setDisabled(false), 60000); // 60秒間の連投防止

        // 選択されたボットの名前を取得
        const selectedBotName = bots.find(bot => bot.id.toString() === botType)?.name || '';
        
        // メッセージの形式を整える
        const formattedMessage = `【対象の代筆くん】\n${selectedBotName}\n\n【ご要望・ご意見】\n${feedback}`;

        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                email, 
                message: formattedMessage 
            }),
        });

        if (res.ok) {
            setName('');
            setEmail('');
            setBotType('');
            setFeedback('');
            setStatus('送信しました。貴重なご意見をありがとうございます。');
            setIsConfirming(false);
        } else {
            setStatus('送信に失敗しました。後ほど再度お試しください。');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
                <div className="container mx-auto p-6">
                    <h1 className="text-2xl font-bold text-gray-800">機能改善のご要望フォーム</h1>
                    <p className="mt-2 text-gray-600">
                        機能に関するご意見・ご要望をぜひお聞かせください。<br />
                        今後の開発・改善の参考とさせていただきます。
                    </p>

                    {status && <p className="mt-2 text-green-600">{status}</p>}
                    {error && <p className="mt-2 text-red-600">{error}</p>}
                    
                    {loading ? (
                        <div className="mt-4 flex justify-center">
                            <p className="text-gray-600">読み込み中...</p>
                        </div>
                    ) : (
                        <form className="mt-4" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="name">
                                    お名前 {!isConfirming && <span className="text-gray-500 text-sm">（任意）</span>}
                                </label>
                                {isConfirming ? (
                                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">{name || '未入力'}</p>
                                ) : (
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        readOnly={isConfirming}
                                        className={`mt-1 block w-full border rounded-md p-2 ${isConfirming ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="email">
                                    メールアドレス {!isConfirming && <span className="text-gray-500 text-sm">（任意）</span>}
                                </label>
                                {isConfirming ? (
                                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">{email || '未入力'}</p>
                                ) : (
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        readOnly={isConfirming}
                                        className={`mt-1 block w-full border rounded-md p-2 ${isConfirming ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="botType">
                                    対象の代筆くん {!isConfirming && <span className="text-red-500 text-sm">※必須</span>}
                                </label>
                                {isConfirming ? (
                                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                                        {bots.find(bot => bot.id.toString() === botType)?.name || botType}
                                    </p>
                                ) : (
                                    <select
                                        id="botType"
                                        value={botType}
                                        onChange={(e) => setBotType(e.target.value)}
                                        required
                                        disabled={isConfirming}
                                        className={`mt-1 block w-full border rounded-md p-2 ${isConfirming ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    >
                                        {bots.map((bot) => (
                                            <option key={bot.id} value={bot.id.toString()}>
                                                {bot.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="feedback">
                                    ご要望・ご意見 {!isConfirming && <span className="text-red-500 text-sm">※必須</span>}
                                </label>
                                {!isConfirming && (
                                    <p className="text-gray-500 text-sm mt-1">※具体的にご記入いただけると助かります</p>
                                )}
                                {isConfirming ? (
                                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">{feedback}</p>
                                ) : (
                                    <textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        required
                                        readOnly={isConfirming}
                                        rows={5}
                                        className={`mt-1 block w-full border rounded-md p-2 ${isConfirming ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                )}
                            </div>

                            {isConfirming ? (
                                <div className="flex flex-col items-start mt-4">
                                    <p className="text-red-500 font-semibold mb-2">この内容で送信しますか？</p>
                                    <div className="flex justify-between w-full">
                                        <button
                                            type="button"
                                            onClick={() => setIsConfirming(false)}
                                            className="min-w-[120px] bg-gray-300 text-black rounded-md p-2 hover:bg-gray-400"
                                        >
                                            戻る
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={disabled}
                                            className={`min-w-[120px] bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            送信する
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
                                >
                                    確認
                                </button>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}