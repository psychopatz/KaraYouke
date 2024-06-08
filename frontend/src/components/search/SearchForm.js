import React from 'react';
import { TextField, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';

const SearchFormContainer = styled('form')(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SearchGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SearchForm = ({ query, setQuery, handleSearch }) => (
  <SearchFormContainer onSubmit={handleSearch}>
    <SearchGrid container spacing={2} alignItems="center">
      <Grid item xs={8}>
        <TextField 
          fullWidth 
          variant="outlined" 
          label="Search" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
      </Grid>
      <Grid item xs={4}>
        <Button fullWidth variant="contained" color="primary" type="submit">Search</Button>
      </Grid>
    </SearchGrid>
  </SearchFormContainer>
);

export default SearchForm;
