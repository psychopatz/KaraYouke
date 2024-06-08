import React, { useState, useRef, useEffect } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

const PaginatedSearch = ({ apiUrl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFormFocused, setFocusState] = useState(false);
  const [maxResults, setMaxResults] = useState(22);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Perform the search using the apiUrl and update results
    try {
      const response = await fetch(`${apiUrl}?query=${query}&max_results=${maxResults}&page=${page}`);
      const data = await response.json();
      setResults(data.results); // Adjust based on your API response structure
      setTotalResults(data.total_results);
      setFocusState(false); // Switch focus state to false
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  useEffect(() => {
    if (!isFormFocused && results.length > 0) {
      resultsRef.current.focus();
    }
  }, [isFormFocused, results]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div>
      <SearchForm 
        query={query} 
        setQuery={setQuery} 
        maxResults={maxResults} 
        setMaxResults={setMaxResults}
        handleSearch={handleSearch} 
        setFocusState={setFocusState} 
      />
      <SearchResults results={results} isFormFocused={isFormFocused} ref={resultsRef} />
      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={page * maxResults >= totalResults}>Next</button>
      </div>
    </div>
  );
};

export default PaginatedSearch;
