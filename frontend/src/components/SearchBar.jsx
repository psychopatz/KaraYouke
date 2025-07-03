// src/components/SearchBar.jsx
import React from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// The component no longer has its own state. It gets everything from props.
const SearchBar = ({ query, onQueryChange, onSearch, isLoading }) => {

  const handleSearchClick = () => {
    // onSearch is called without arguments, as the parent already has the query.
    if (query.trim()) {
      onSearch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <TextField
      label="Search for a song..."
      variant="filled"
      fullWidth
      value={query} // The displayed text is now controlled by the parent.
      onChange={(e) => onQueryChange(e.target.value)} // It reports changes up to the parent.
      onKeyPress={handleKeyPress}
      disabled={isLoading}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleSearchClick} edge="end" disabled={isLoading || !query.trim()}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;