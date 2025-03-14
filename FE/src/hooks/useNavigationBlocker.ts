import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface UsePromptReturn {
  isBlocked: boolean;
  handleProceed: () => void;
  handleCancel: () => void;
  setException: () => void; // 페이지 이동 예외 설정 함수
}

const usePrompt = (): UsePromptReturn => {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const handleRouteChangeStart = (url: string) => {
      if (allowNavigation) return;
      if (router.pathname !== url) {
        setIsBlocked(true);
        setNextRoute(url);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router, allowNavigation]);

  const handleProceed = () => {
    setIsBlocked(false);
    if (nextRoute) {
      setAllowNavigation(true);
      router.push(nextRoute);
    }
  };

  const handleCancel = () => {
    setIsBlocked(false);
    setNextRoute(null);
  };

  const setException = () => {
    setAllowNavigation(true);
  };

  return { isBlocked, handleProceed, handleCancel, setException };
};

export default usePrompt;
