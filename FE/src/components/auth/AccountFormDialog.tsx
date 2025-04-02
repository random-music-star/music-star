import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AccountFormDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [signupUsername, setSignupUsername] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setSignupUsername('');
      setActiveTab('login');
    }
  }, [open]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleSignupSuccess = (username: string) => {
    setSignupUsername(username);
    setActiveTab('login');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-gray-900'>로그인 / 회원가입</Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className='bg-opacity-100 rounded-lg rounded-tr-none border-4 border-white bg-gradient-to-b from-[#9F89EB] to-[#5D42AA] sm:max-w-[500px]'
      >
        <DialogHeader className='absolute top-[-25px] left-[20px]'>
          <DialogTitle
            className='text-4xl font-bold text-white'
            style={{
              textShadow: `-3px -3px 0 #6548B9, 3px -3px 0 #6548B9, -3px 3px 0 #6548B9, 3px 3px 0 #6548B9`,
            }}
          >
            ACCOUNT
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className='mt-4'
        >
          <TabsList className='absolute top-[-40px] right-[-7px] flex flex-row space-x-1 bg-transparent'>
            <TabsTrigger
              className='h-[45px] w-[120px] rounded-lg rounded-br-none rounded-bl-none border-4 border-white bg-[#9F89EB] text-lg font-bold text-white data-[state=active]:border-b-0 data-[state=active]:bg-gradient-to-b data-[state=active]:shadow-none data-[state=inactive]:bg-[#C6B6FF]'
              value='signup'
            >
              회원가입
            </TabsTrigger>
            <TabsTrigger
              className='h-[45px] w-[120px] rounded-lg rounded-br-none rounded-bl-none border-4 border-white bg-[#9F89EB] text-lg font-bold text-white data-[state=active]:border-b-0 data-[state=active]:bg-gradient-to-b data-[state=active]:shadow-none data-[state=inactive]:bg-[#C6B6FF]'
              value='login'
            >
              로그인
            </TabsTrigger>
          </TabsList>
          <TabsContent value='login' className='space-y-4 py-4 text-white'>
            <LoginForm
              onSuccess={handleSuccess}
              initialUsername={signupUsername}
            />
          </TabsContent>
          <TabsContent value='signup' className='space-y-4 py-4 text-white'>
            <SignupForm onSuccess={handleSignupSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
