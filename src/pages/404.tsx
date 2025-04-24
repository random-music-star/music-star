import Link from 'next/link';

export default function Custom404() {
  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gray-100'>
      <h1 className='mb-4 text-6xl font-bold text-gray-800'>404</h1>
      <p className='mb-8 text-2xl text-gray-600'>엥? 없습니다</p>
      <Link
        href='/'
        className='rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700'
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
