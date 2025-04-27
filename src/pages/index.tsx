import { useEffect } from 'react';

import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';

import { ApiContext } from '@/api/core';
import { userNicknameAPI } from '@/api/member';
import SEO from '@/components/SEO';
import AccountFormDialog from '@/components/auth/AccountFormDialog';
import BackgroundMusic from '@/components/common/BackgroundMusic';
import JumpingAnimation from '@/components/home/JumpingAnimation';
import ChannelList from '@/components/home/channel/ChannelList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const ctx: ApiContext = {
    req: req as NextApiRequest,
    res: res as NextApiResponse,
  };

  const result = await userNicknameAPI(ctx);

  return {
    props: {
      userNickname: result.data?.username || null,
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
      <SEO title='채널 입장' />
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
            <span className='text-pink-100'>랜덤뮤직스타</span>
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
              {nickname} 님, 랜덤뮤직스타에 오신 걸 환영합니다!
            </span>
            <Button
              variant='custom'
              className='cursor-pointer rounded-2xl bg-gradient-to-b from-purple-600/70 to-purple-800/70 px-3 py-1 hover:bg-gradient-to-t hover:from-purple-900/50 hover:to-purple-900/90'
              onClick={logout}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <div className='my-4 flex items-center justify-center gap-6'>
            <AccountFormDialog />
            <div className='relative'>
              <Button
                className='rounded-2xl bg-purple-700/90 hover:bg-purple-700/70'
                onClick={guestLogin}
              >
                비회원 로그인
              </Button>
              <div className='absolute -top-3 -right-10 flex rotate-12 transform items-center gap-1 rounded-full border-2 border-white bg-red-500 px-2 py-1 shadow-lg'>
                <ThumbsUp size={14} className='text-white' />
                <span className='text-xs font-bold text-white'>추천!</span>
              </div>
            </div>
          </div>
        )}

        <div className='w-full'>
          <ChannelList />
        </div>
      </motion.div>
      <div className='flex w-full flex-1 flex-col justify-end'>
        <JumpingAnimation />
      </div>
      <BackgroundMusic pageType='home' />
    </div>
  );
}
