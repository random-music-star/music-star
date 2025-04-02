import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';

import AccountFormDialog from '@/components/auth/AccountFormDialog';
import JumpingAnimation from '@/components/home/JumpingAnimation';
import ChannelList from '@/components/home/channel/ChannelList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';

  return {
    props: {
      userNickname,
    },
  };
};

interface HomeServerProps {
  userNickname: string;
}

export default function Home({ userNickname }: HomeServerProps) {
  const { setNickname, nickname } = useNicknameStore();
  const { guestLogin, logout } = useAuth();

  useEffect(() => {
    if (userNickname) setNickname(userNickname);
  }, [userNickname]);

  return (
    <div
      className={`flex max-h-screen min-h-screen flex-col items-center bg-[url('/background.svg')] bg-cover bg-center p-12`}
    >
      <motion.main
        className='flex text-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: 1,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          <h1 className='text-9xl font-extrabold drop-shadow-lg md:text-8xl'>
            <span className='text-pink-100'>알쏭달쏭</span>
          </h1>
        </motion.div>
      </motion.main>

      <motion.div
        className='flex w-[80%] flex-col items-center gap-5'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {nickname ? (
          <div className='relative my-4 flex items-center justify-center gap-6'>
            <span className='rounded-2xl bg-purple-950/70 px-4 py-1 text-center text-lg text-pink-100'>
              {nickname} 님, 알쏭달쏭에 오신 걸 환영합니다!
            </span>
            <Button
              variant='custom'
              className='absolute -right-26 text-purple-900/40 hover:text-purple-900/60'
              onClick={logout}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <div className='my-4 flex items-center justify-center gap-6'>
            <AccountFormDialog />
            <Button className='bg-gray-900' onClick={guestLogin}>
              원클릭 비회원 로그인
            </Button>
          </div>
        )}

        <div className='w-full'>
          <ChannelList />
        </div>
      </motion.div>
      <div className='flex w-full flex-1 flex-col justify-end'>
        <JumpingAnimation />
      </div>
    </div>
  );
}
