import React from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import RemoteControl from './components/remote/RemoteControl';
import SearchComponent from './components/search/SearchComponent';
import Navbar from './components/nav/Navbar';
import LandingPage from './components/landingPage/LandingPage';
import ProfileComponent from './components/createProfile/ProfileComponent';
import MainMenuComponent from './components/mainMenu/MainMenuComponent';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import RoomComponent from './components/room/RoomComponent';
import JoinRoomComponent from './components/joinRoom/JoinRoomComponent';
import PlayerComponent from './components/player/PlayerComponent';
import CreateRoomComponent from './components/createRoom/CreateRoomComponent,';

const navItems = [
  { label: 'Search', path: '/search' },
  { label: 'Remote', path: '/remote' },
];

// Define the paths where the Navbar should be hidden
const hiddenNavPaths = ['/', '/remote', '/profile'];

function App() {
  const location = useLocation();
  const isNavHidden = hiddenNavPaths.includes(location.pathname) || location.pathname.startsWith('/play/');

  return (
    <Box>
      {!isNavHidden && <Navbar title="Karayouke" navItems={navItems} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-room" element={<CreateRoomComponent />} />
        <Route path="/join-room/:roomID?" element={<JoinRoomComponent />} />
        <Route path="/play/:videoID" element={<PlayerComponent />} />
        <Route path="/menu" element={<MainMenuComponent />} />
        <Route path="/profile" element={<ProfileComponent />} />
        <Route path="/search" element={<SearchComponent />} />
        <Route path="/remote" element={<RemoteControl />} />
        <Route path="/room/:roomID" element={<RoomComponent />} /> 
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
