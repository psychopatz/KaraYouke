import React from 'react';
import { Grid, Pagination } from '@mui/material';
import { styled } from '@mui/system';

const PaginationContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  justifyContent: 'center',
  zIndex: 1,
  position: 'relative',
}));

const PaginationControls = ({ page, totalResults, maxResults, handlePageChange }) => (
  <PaginationContainer container>
    <Pagination 
      count={Math.ceil(totalResults / maxResults)} 
      page={page} 
      onChange={handlePageChange} 
      color="primary" 
    />
  </PaginationContainer>
);

export default PaginationControls;
