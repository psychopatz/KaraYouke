import React from 'react';
import PaginatedSearch from './PaginatedSearch';

const Search = () => {
  return (
    <div>
      <h1>YouTube Search</h1>
      <PaginatedSearch apiUrl="https://karayouke-backend-h25y9ilhw-psychopatzs-projects.vercel.app/search" />
    </div>
  );
};

export default Search;
