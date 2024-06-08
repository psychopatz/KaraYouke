import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import PaginationControls from './PaginationControls';

const PaginatedSearch = ({ apiUrl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        const response = await fetch(`${apiUrl}?query=${query} karaoke&max_results=${maxResults}&page=${page}`);
        const data = await response.json();
        setResults(data.results);
        setTotalResults(data.total_results);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      }
    };

    fetchResults();
  }, [query, page, maxResults, apiUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div>
      <SearchForm query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <SearchResults results={results} />
      <PaginationControls 
        page={page} 
        totalResults={totalResults} 
        maxResults={maxResults} 
        handlePageChange={handlePageChange} 
      />
    </div>
  );
};

export default PaginatedSearch;
