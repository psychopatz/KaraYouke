// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Import Pages & Layouts
import LandingPage from './pages/LandingPage';
import HostPage from './pages/HostPage';
import ProfileCreationPage from './pages/ProfileCreationPage'; 
import ProfileCheckLayout from './layout/ProfileCheckLayout'; 
import JoinRoomPage from './pages/JoinRoomPage';
import RemoteRouteGuard from './layout/RemoteRouteGuard';
import RemotePage from './pages/RemotePage'; 
import KaraokePage from './pages/KaraokePage';
import VersionDisplay from './components/VersionDisplay';
import PageTitleHandler from './components/PageTitleHandler'; // ✅ Import this

// A dark theme for our Karaoke App
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954',
    },
    secondary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: '600',
    }
  },
  shape: {
    borderRadius: 8,
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <PageTitleHandler /> {/* ✅ Handles page title updates */}
        <Routes>
          {/* Public Route */}
          <Route path="/create-profile" element={<ProfileCreationPage />} />

          {/* Routes requiring profile check */}
          <Route element={<ProfileCheckLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-room" element={<HostPage />} />
            <Route path="/join-room/:sessionCode?" element={<JoinRoomPage />} />
            <Route path="/karaoke" element={<KaraokePage />} />

            {/* Remote route with guard */}
            <Route element={<RemoteRouteGuard />}>
              <Route path="/remote" element={<RemotePage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      <VersionDisplay />
    </ThemeProvider>
  );
}

export default App;
