import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import RemoteControl from './components/remote/RemoteControl';
import SearchComponent from './components/search/SearchComponent';
import Navbar from './components/nav/Navbar';

const navItems = [
  { label: 'Search', path: '/' },
  { label: 'Remote', path: '/remote' },
];

function App() {
  return (
    <Router>
      <Navbar title="Karayouke" navItems={navItems} />
      <Box>
        <Routes>
          <Route path="/" element={<SearchComponent />} />
          <Route path="/remote" element={<RemoteControl />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
