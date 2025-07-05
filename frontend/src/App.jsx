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



// A dark theme for our Karaoke App
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954', // A Spotify-like green for primary actions
    },
    secondary: {
      main: '#FFFFFF', // White for secondary actions/text
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Buttons will use normal case, not UPPERCASE
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
        <Routes>
          {/* --- Public Routes --- */}
          {/* This route is for creating a profile. It MUST be outside the check. */}
          <Route path="/create-profile" element={<ProfileCreationPage />} />




          {/* --- "Protected" Routes --- */}
          {/* All routes inside here will first pass through ProfileCheckLayout. */}
          {/* If no profile exists, the user will be redirected to /create-profile. */}
          {/* If a profile exists, the <Outlet /> in the layout will render the correct page. */}
          <Route element={<ProfileCheckLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-room" element={<HostPage />} />
            <Route path="/join-room/:sessionCode?" element={<JoinRoomPage />} />
            <Route path="/karaoke" element={<KaraokePage />} />

            {/* NEW: NESTED ROUTE FOR REMOTE */}
            <Route element={<RemoteRouteGuard />}>
              <Route path="/remote" element={<RemotePage />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;