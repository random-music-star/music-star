import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

const MobileWarning = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-[url(/background.svg)] bg-cover bg-center text-white'
    >
      <div className='rounded-xl bg-gray-800 p-6 text-center shadow-lg'>
        <h2 className='text-xl font-semibold'>
          모바일 화면은 지원하지 않습니다.
        </h2>
        <p className='mt-2 text-sm'>PC를 이용해 주세요.</p>
      </div>
    </motion.div>
  );
};

export default MobileWarning;
