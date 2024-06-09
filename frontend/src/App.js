import React from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import RemoteControl from './components/remote/RemoteControl';
import SearchComponent from './components/search/SearchComponent';
import Navbar from './components/nav/Navbar';
import LandingPage from './components/landingPage/LandingPage';

const navItems = [
  { label: 'Search', path: '/search' },
  { label: 'Remote', path: '/remote' },
];

// Define the paths where the Navbar should be hidden
const hiddenNavPaths = ['/', '/remote'];

function App() {
  const location = useLocation();
  const isNavHidden = hiddenNavPaths.includes(location.pathname);

  return (
    <Box>
      {!isNavHidden && <Navbar title="Karayouke" navItems={navItems} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchComponent />} />
        <Route path="/remote" element={<RemoteControl />} />
        {/* Add more routes here */}
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
