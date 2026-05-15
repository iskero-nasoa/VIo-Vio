import { useState, useEffect } from 'react';

export function useMobileDetect() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 640;
  const isTablet = windowSize.width > 640 && windowSize.width <= 1024;
  const isDesktop = windowSize.width > 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: windowSize.width,
  };
}
