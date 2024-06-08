import React from 'react';
import PaginatedSearch from './PaginatedSearch';

const SearchComponent = () => {
  return (
    <div>
      <h1>YouTube Search</h1>
      <PaginatedSearch apiUrl="https://kara-youke-backend.vercel.app/search" />
    </div>
  );
};

export default SearchComponent;
