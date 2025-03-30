export default function Footer() {
    return (
      <footer className="bg-white py-6">
        <div className="container mx-auto text-center">
          <div className="text-sm text-gray-500">
            <a href="/request" className="hover:text-gray-500 mr-6">機能改善のご要望</a>
            <a href="/contact" className="hover:text-gray-500 mr-6">お問い合わせ</a>
            <a href="/privacy" className="hover:text-gray-500 mr-6">プライバシーポリシー</a>
            <a href="https://x.com/ai_hituji" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">公式X</a>
          </div>
        </div>
      </footer>
    );
}