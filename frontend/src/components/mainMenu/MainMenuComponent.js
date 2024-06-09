import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import localStorageAPI from '../../API/localStorageAPI';

const MainMenuComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userdata = localStorageAPI.getItem('userdata');
    if (!userdata) {
      navigate('/new-user');
    }
  }, [navigate]);

  return (
    <>
      <h1>Main Menu</h1>
    </>
  );
}

export default MainMenuComponent;
