// src/layout/ProfileCheckLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getLocalItem } from '../utils/localStorageUtils';

const ProfileCheckLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getLocalItem('kara_youke_user');
    if (!userData) {
      console.log('No user data found, redirecting to create profile.');
      navigate('/create-profile', { replace: true });
    }
  }, [navigate]);

  // If user data exists, <Outlet /> will render the nested route (e.g., LandingPage)
  return <Outlet />;
};

export default ProfileCheckLayout;