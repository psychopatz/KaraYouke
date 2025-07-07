// src/hooks/usePageTitle.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (pathname) => {
  if (pathname === '/') return 'KaraYouke 🎤🎶';
  if (pathname.startsWith('/create-room')) return 'Create Room – KaraYouke 🎤🎶';
  if (pathname.startsWith('/join-room')) return 'Join Room – KaraYouke 🎤🎶';
  if (pathname.startsWith('/create-profile')) return 'Create Profile – KaraYouke 🎤🎶';
  if (pathname.startsWith('/karaoke')) return 'Now Singing – KaraYouke 🎤🎶';
  if (pathname.startsWith('/remote')) return 'Remote Control – KaraYouke 🎤🎶';
  return 'KaraYouke 🎤🎶';
};

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const title = getTitleFromPath(location.pathname);
    document.title = title;
  }, [location.pathname]);
};

export default usePageTitle;
