import Image from 'next/image';

export default function Header() {
  return (
    <header className="p-4 bg-white shadow">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold text-gray-800">
          <a href="/" className="flex md:justify-start justify-center">
            <Image src="/daihitsukun-logo.png" alt="代筆くん" width={250} height={60} />
          </a>
        </h1>
      </div>
    </header>
  );
}