import Link from 'next/link';

// pages/404.js
export default function Custom404() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <h1 className='text-6xl font-bold text-gray-800 mb-4'>404</h1>
      <p className='text-2xl text-gray-600 mb-8'>엥? 없습니다</p>
      <Link
        href='/'
        className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
