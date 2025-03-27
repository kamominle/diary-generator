'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Loader, ChevronDown, ChevronUp, X } from 'react-feather';
import DOMPurify from 'dompurify';
import { ThumbsUp, ThumbsDown } from 'react-feather';
// Supabaseクライアントをインポート
import { supabase } from '@/utils/supabase';

export default function IndividualDiaryPage() {
  // Core state
  const [sourceName, setSourceName] = useState('');
  const [customer, setCustomer] = useState('');
  const [diaryType, setDiaryType] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [emojiAmount, setEmojiAmount] = useState('ふつう'); // 絵文字・顔文字の量用の状態変数を追加
  
  // Diary type specific fields
  const [workStartTime, setWorkStartTime] = useState('');
  const [workEndTime, setWorkEndTime] = useState('');
  const [freeSlot, setFreeSlot] = useState('');
  const [offDay, setOffDay] = useState('');
  const [playContent, setPlayContent] = useState('');
  const [didForMe, setDidForMe] = useState('');
  const [happyAbout, setHappyAbout] = useState('');
  const [compliment, setCompliment] = useState('');
  const [relationshipWithCustomer, setRelationshipWithCustomer] = useState('');
  const [other, setOther] = useState('');
  const [keyword, setKeyword] = useState('');
  
  // Style selection
  const [selectedStyle, setSelectedStyle] = useState('standard');
  
  // UI display control
  const [showOutput, setShowOutput] = useState(false);
  
  // For popup during generation
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosable, setPopupClosable] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // For logs
  const [generationStartTime, setGenerationStartTime] = useState(null);
  const [generationEndTime, setGenerationEndTime] = useState(null);
  const [generationDuration, setGenerationDuration] = useState(null);

  // Predefined style options
  const diaryStyles = [
    { id: 1, style_name: 'standard', display_name: '標準', prompt_word: '標準的な写メ日記スタイルで' },
    { id: 2, style_name: 'cute', display_name: 'かわいい', prompt_word: 'かわいい系の女の子らしく' },
    { id: 3, style_name: 'sexy', display_name: 'セクシー', prompt_word: '大人っぽく色気のある感じで' },
    { id: 4, style_name: 'formal', display_name: '丁寧', prompt_word: '礼儀正しく丁寧な言葉遣いで' },
    { id: 5, style_name: 'gal', display_name: 'ギャル', prompt_word: 'ギャルっぽい言葉遣いで' },
    { id: 6, style_name: 'tsundere', display_name: 'ツンデレ', prompt_word: 'ツンデレな態度と言葉遣いで' },
    { id: 7, style_name: 'young', display_name: '幼い', prompt_word: '漢字少なめ、ひらがな多めで子供っぽい文体' },
    { id: 8, style_name: 'calm', display_name: 'おっとり', prompt_word: 'ひらがな多めで行間が多く、語尾に〜〜が付く、おっとりした文体' }
  ];
  
  // クォーテーションを除去する関数
  const cleanStorageValue = (value) => {
    if (!value) return '';
    // 先頭と末尾のダブルクォーテーションを除去
    return value.replace(/^"|"$/g, '');
  };
  
  // アプリケーション起動時にlocalStorageから状態を読み込む
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;
    
    // 基本情報の読み込み
    const savedSourceName = cleanStorageValue(localStorage.getItem('sourceName'));
    const savedCustomer = cleanStorageValue(localStorage.getItem('customer'));
    const savedDiaryType = cleanStorageValue(localStorage.getItem('diaryType'));
    const savedStyle = cleanStorageValue(localStorage.getItem('selectedStyle'));
    const savedEmojiAmount = cleanStorageValue(localStorage.getItem('emojiAmount')); // 絵文字量の設定を読み込む
    
    if (savedSourceName) setSourceName(savedSourceName);
    if (savedCustomer) setCustomer(savedCustomer);
    if (savedDiaryType) setDiaryType(savedDiaryType);
    if (savedStyle) setSelectedStyle(savedStyle);
    if (savedEmojiAmount) setEmojiAmount(savedEmojiAmount);
    
    // 各日記タイプのフィールド読み込み
    // 出勤情報
    setWorkStartTime(cleanStorageValue(localStorage.getItem('workStartTime')));
    setWorkEndTime(cleanStorageValue(localStorage.getItem('workEndTime')));
    setFreeSlot(cleanStorageValue(localStorage.getItem('freeSlot')));
    setOffDay(cleanStorageValue(localStorage.getItem('offDay')));
    
    // お礼日記
    setPlayContent(cleanStorageValue(localStorage.getItem('playContent')));
    setDidForMe(cleanStorageValue(localStorage.getItem('didForMe')));
    setHappyAbout(cleanStorageValue(localStorage.getItem('happyAbout')));
    setCompliment(cleanStorageValue(localStorage.getItem('compliment')));
    setRelationshipWithCustomer(cleanStorageValue(localStorage.getItem('relationshipWithCustomer')));
    setOther(cleanStorageValue(localStorage.getItem('other')));
    
    // フリー日記
    setKeyword(cleanStorageValue(localStorage.getItem('keyword')));
  }, []);

  // 源氏名が変更されたらlocalStorageに保存
  useEffect(() => {
    if (sourceName !== '' && typeof window !== 'undefined') {
      localStorage.setItem('sourceName', sourceName);
    }
  }, [sourceName]);

  // お客様名が変更されたらlocalStorageに保存
  useEffect(() => {
    if (customer !== '' && typeof window !== 'undefined') {
      localStorage.setItem('customer', customer);
    }
  }, [customer]);

  // 日記タイプが変更されたらlocalStorageに保存
  useEffect(() => {
    if (diaryType !== '' && typeof window !== 'undefined') {
      localStorage.setItem('diaryType', diaryType);
    }
  }, [diaryType]);

  // 選択スタイルが変更されたらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedStyle', selectedStyle);
    }
  }, [selectedStyle]);

  // 絵文字の量が変更されたらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('emojiAmount', emojiAmount);
    }
  }, [emojiAmount]);

  // 出勤情報のフィールドが変更されたらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (workStartTime !== '') localStorage.setItem('workStartTime', workStartTime);
      if (workEndTime !== '') localStorage.setItem('workEndTime', workEndTime);
      if (freeSlot !== '') localStorage.setItem('freeSlot', freeSlot);
      if (offDay !== '') localStorage.setItem('offDay', offDay);
    }
  }, [workStartTime, workEndTime, freeSlot, offDay]);

  // お礼日記のフィールドが変更されたらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (playContent !== '') localStorage.setItem('playContent', playContent);
      if (didForMe !== '') localStorage.setItem('didForMe', didForMe);
      if (happyAbout !== '') localStorage.setItem('happyAbout', happyAbout);
      if (compliment !== '') localStorage.setItem('compliment', compliment);
      if (relationshipWithCustomer !== '') localStorage.setItem('relationshipWithCustomer', relationshipWithCustomer);
      if (other !== '') localStorage.setItem('other', other);
    }
  }, [playContent, didForMe, happyAbout, compliment, relationshipWithCustomer, other]);

  // フリー日記のフィールドが変更されたらlocalStorageに保存
  useEffect(() => {
    if (keyword !== '' && typeof window !== 'undefined') {
      localStorage.setItem('keyword', keyword);
    }
  }, [keyword]);
  
  // 日記タイプを変更する関数（リセットなし）
  const handleDiaryTypeChange = (newType) => {
    if (newType !== diaryType) {
      setDiaryType(newType);
    }
  };

  const generateDiary = async () => {
    // No validation - allow empty inputs
    
    // Clear previous state
    setFormError('');
    setError('');
    setLoading(true);
    setShowPopup(true);
    setPopupClosable(false);
    setCountdown(5);
    setShowOutput(false);
    
    // 開始時間を記録
    const startTime = new Date();
    setGenerationStartTime(startTime);

    // Start countdown for popup
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setPopupClosable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Get the style details
    const currentStyle = diaryStyles.find(s => s.style_name === selectedStyle) || diaryStyles[0];
    
    const basePrompt = `
ルール：写メ日記という風俗の女性キャストがお客様向けに発信する文章を生成
改行を用いて読みやすく
300文字以内（日本語換算）でまとめる。
スタイル：${currentStyle.prompt_word}
絵文字・顔文字の量：${emojiAmount}

${diaryType === '出勤情報' ? [
  workStartTime ? `出勤時間：${workStartTime}` : '',
  workEndTime ? `退勤時間：${workEndTime}` : '',
  freeSlot ? `空き枠：${freeSlot}` : '',
  offDay ? `お休み：${offDay}` : ''
].filter(Boolean).join('\n') : 
  diaryType === 'お礼日記' ? [
  playContent ? `プレイ内容：${playContent}` : '',
  didForMe ? `してくれたこと：${didForMe}` : '',
  happyAbout ? `嬉しかったこと：${happyAbout}` : '',
  compliment ? `褒めたいところ：${compliment}` : '',
  relationshipWithCustomer ? `お客様との関係：${relationshipWithCustomer}` : '',
  other ? `その他：${other}` : '',
  '来店客個人に向けたお礼'
].filter(Boolean).join('\n') : ''}

${sourceName ? `源氏名：${sourceName}` : ''}
${customer ? `お客様：${customer}` : ''}

キーワード：${diaryType === 'フリー日記' ? keyword : diaryType}
`;

    try {
      // Ensure we wait for the full countdown even if API is fast
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));
      
      const fetchPromise = fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: basePrompt,
          style_name: selectedStyle,
          keyword: diaryType === 'フリー日記' ? keyword : diaryType
        }),
      });
      
      // Wait for both the API response and minimum delay
      const [res] = await Promise.all([fetchPromise, minDelay]);
      
      if (!res.ok) {
        throw new Error(`API エラー(${res.status})`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      // Check if the response contains text property
      if (data && data.text) {
        setOutput(DOMPurify.sanitize(data.text));
        setShowOutput(true);
        
        // 終了時間を記録
        const endTime = new Date();
        setGenerationEndTime(endTime);
        
        // 生成時間を計算（ミリ秒）
        const duration = endTime - startTime;
        setGenerationDuration(duration);
        
        // DBへのログ保存
        try {
          await supabase
            .from('diary_logs')
            .insert({
              diary_id: 1, // ダミーIDを使用
              input_prompt: basePrompt,
              output_text: data.text,
              style_name: selectedStyle,
              keyword: diaryType === 'フリー日記' ? keyword : diaryType
            });
        } catch (dbError) {
          console.error('DBへの保存に失敗しました');
        }
      } else if (data && data.error) {
        // Handle API-returned errors
        throw new Error(data.error);
      } else {
        // Generic error for unexpected response format
        throw new Error('予期しないレスポンス形式です');
      }
      
      // Don't automatically close popup, wait for user action
    } catch (e) {
      console.error('生成エラー:', e);
      setError(`生成に失敗しました: ${e.message || '不明なエラー'}`);
      setShowPopup(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const sendFeedback = async (type) => {
    if (feedbackSent) return;
    
    try {
      // diary_idを含めて保存
      const { error } = await supabase
        .from('diary_feedback')
        .insert({
          diary_id: 1, // ダミーIDを使用
          feedback_type: type
        });
        
      if (!error) {
        setFeedbackSent(true);
      } else {
        console.error('フィードバックエラー');
      }
    } catch (error) {
      console.error('フィードバックエラー');
    }
  };
  
  const closePopupAndShowOutput = () => {
    setShowPopup(false);
    setShowOutput(true);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-xl mx-auto">
        {/* Title and header */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">写メ日記代筆くん</h1>
          <p className="text-center text-gray-600 mb-2">
            風俗の写メ日記を簡単に作成できるツールです
          </p>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="w-full bg-red-50 rounded-xl shadow-lg p-6 mb-6 text-red-500 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-500">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Profile section */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">プロフィール</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">源氏名</label>
              <input
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                placeholder="源氏名を入力"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">お客様</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                placeholder="お客様を入力"
              />
            </div>
          </div>
          
          {/* Style selection */}
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">文体スタイル</label>
            <div className="flex flex-wrap gap-2">
              {diaryStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.style_name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStyle === style.style_name 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.display_name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 絵文字・顔文字の量選択 */}
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">絵文字の量</label>
            <div className="flex flex-wrap gap-2">
              {['ふつう', '多め', 'なし'].map(amount => (
                <button
                  key={amount}
                  onClick={() => setEmojiAmount(amount)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    emojiAmount === amount 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diary Type Selection - Always visible 3-column layout */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">日記選択</h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDiaryTypeChange('出勤情報')}
              className={`py-3 text-sm font-medium rounded-lg transition-all ${
                diaryType === '出勤情報' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              出勤情報
            </button>
            <button
              onClick={() => handleDiaryTypeChange('お礼日記')}
              className={`py-3 text-sm font-medium rounded-lg transition-all ${
                diaryType === 'お礼日記' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              お礼日記
            </button>
            <button
              onClick={() => handleDiaryTypeChange('フリー日記')}
              className={`py-3 text-sm font-medium rounded-lg transition-all ${
                diaryType === 'フリー日記' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              フリー日記
            </button>
          </div>
        </div>

        {/* Input Fields - conditionally show based on diary type */}
        {diaryType && (
          <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              情報を入力
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({diaryType}の内容)
              </span>
            </h2>
            
            {/* 出勤情報 form fields */}
            {diaryType === '出勤情報' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">出勤時間</label>
                  <input
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 18:00"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">退勤時間</label>
                  <input
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 26:00"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">空き枠</label>
                  <input
                    value={freeSlot}
                    onChange={(e) => setFreeSlot(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 20:00~21:00"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">お休み</label>
                  <input
                    value={offDay}
                    onChange={(e) => setOffDay(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 明日はお休みです"
                  />
                </div>
              </div>
            )}
            
            {/* お礼日記 form fields */}
            {diaryType === 'お礼日記' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">プレイ内容</label>
                  <input
                    value={playContent}
                    onChange={(e) => setPlayContent(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: マットプレイ、〇〇コース"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">してくれたこと</label>
                  <input
                    value={didForMe}
                    onChange={(e) => setDidForMe(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 優しく接してくれた"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">嬉しかったこと</label>
                  <input
                    value={happyAbout}
                    onChange={(e) => setHappyAbout(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: プレゼントをもらった"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">褒めたいところ</label>
                  <input
                    value={compliment}
                    onChange={(e) => setCompliment(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 清潔感がある"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">お客様との関係</label>
                  <input
                    value={relationshipWithCustomer}
                    onChange={(e) => setRelationshipWithCustomer(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: 初めて、常連さん"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">その他</label>
                  <input
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    placeholder="例: またお会いしたい"
                  />
                </div>
              </div>
            )}
            
            {/* フリー日記 form fields */}
            {diaryType === 'フリー日記' && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">キーワード</label>
                <textarea
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full p-3 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 min-h-[100px]"
                  placeholder="日記に含めたいキーワードや内容を入力"
                />
                <p className="mt-1 text-xs text-gray-500">
                  自由に内容を入力してください。詳しく書くほど、より適切な日記が生成されます。
                </p>
              </div>
            )}
            
            {/* Generate button */}
            <button
              onClick={generateDiary}
              className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader size={16} className="animate-spin" /> : null}
              代筆する
            </button>
          </div>
        )}

        {/* Output Display */}
        {showOutput && (
          <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">生成結果</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {diaryType}
              </span>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] whitespace-pre-wrap">
              {output ? (
                <div className="text-gray-800">{output}</div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  出力がありません
                </div>
              )}
            </div>
            
            {/* Display generation time if available */}
            {generationDuration && (
              <div className="mt-2 text-xs text-gray-500 text-right">
                生成時間: {(generationDuration / 1000).toFixed(2)}秒
              </div>
            )}
            
            {/* Actions for output */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                >
                  <Copy size={16} />
                  {copied ? 'コピーしました！' : 'コピー'}
                </button>
                <a 
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(output)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >Xに投稿</a>
                <a 
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(output)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >LINEで共有</a>
                <button
                  onClick={generateDiary}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  <RefreshCw size={16} />
                  再生成
                </button>
              </div>
              
              {/* Feedback section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 mb-2">代筆は役に立ちましたか？</p>
                {!feedbackSent ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => sendFeedback('good')}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg flex items-center gap-1 transition-colors"
                      disabled={feedbackSent}
                    >
                      <ThumbsUp size={16} /> GOOD
                    </button>
                    <button
                      onClick={() => sendFeedback('bad')}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg flex items-center gap-1 transition-colors"
                      disabled={feedbackSent}
                    >
                      <ThumbsDown size={16} /> BAD
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">ご協力ありがとうございます♪</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="w-full text-center mt-4 mb-8">
          <a href="/" className="text-blue-500 hover:text-blue-700 underline transition-colors">
            トップページに戻る
          </a>
        </div>
      </div>
      
      {/* Popup during generation */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {countdown === 0 ? '代筆完了！' : `代筆中です...（残り${countdown}秒）`}
            </h3>
            <div className="my-6 flex justify-center">
              <img 
                src="/writing.png" 
                alt="代筆中" 
                className="w-48 h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPuS7o+etlOS4rTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
            <button
              disabled={!popupClosable}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                popupClosable 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={closePopupAndShowOutput}
            >
              結果を表示
            </button>
          </div>
        </div>
      )}
    </div>
  );
}