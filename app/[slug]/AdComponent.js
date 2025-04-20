import { useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export function AdComponent({ adHtml }) {
  const adContainerRef = useRef(null);
  
  useEffect(() => {
    if (!adContainerRef.current || !adHtml) return;
    
    // コンテナ要素の中身をクリア
    adContainerRef.current.innerHTML = '';
    
    // サニタイズされたHTMLを挿入
    const purifyConfig = {
      ADD_TAGS: ['script', 'ins'],
      ADD_ATTR: ['class', 'data-id', 'style', 'src'],
      ALLOW_UNKNOWN_PROTOCOLS: true,
    };
    
    adContainerRef.current.innerHTML = DOMPurify.sanitize(adHtml, purifyConfig);
    
    // スクリプトタグを抽出して再作成し実行する
    const scriptTags = adContainerRef.current.querySelectorAll('script');
    scriptTags.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // 全ての属性をコピー
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // インラインスクリプトの場合は内容もコピー
      newScript.innerHTML = oldScript.innerHTML;
      
      // 古いスクリプトを新しいものに置き換え
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [adHtml]);
  
  return <div ref={adContainerRef} style={{ minWidth: '300px', minHeight: '250px' }} />;
}