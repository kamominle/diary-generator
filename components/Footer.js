export default function Footer() {
    return (
      <footer className="bg-white py-6">
        <div className="container mx-auto text-center">
          <div className="text-sm text-gray-500">
            <a href="/request" className="hover:text-gray-500 mr-6">機能改善のご要望</a>
            <a href="/contact" className="hover:text-gray-500 mr-6">お問い合わせ</a>
            <a href="/privacy" className="hover:text-gray-500">プライバシーポリシー</a>
          </div>
        </div>
      </footer>
    );
}