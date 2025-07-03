// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Import Pages
import LandingPage from './pages/LandingPage';
import RemoteQueue from './pages/RemoteQueue'; // Assuming this exists for the placeholder

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
          {/* Route 1: The Landing Page (our entry point) */}
          <Route path="/" element={<LandingPage />} />

          {/* Route 2: Placeholder for the Host/Main Screen */}
          <Route path="/host" element={<div>Host Screen Page - To Be Built</div>} />

          {/* Route 3: Placeholder for the Remote/Controller Screen */}
          <Route path="/remote" element={<RemoteQueue />} />
          
          {/* You can add a 404 Not Found page here later */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;