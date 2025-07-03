// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Import Pages
import LandingPage from './pages/LandingPage';
import SessionTest from './pages/SessionTest'; 
import HostPage from './pages/HostPage';

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
      {/* CssBaseline resets browser styles for consistency */}
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create-room" element={<HostPage/>} />
          <Route path="/sessiontest" element={<SessionTest/>} />


        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;