import React, { useState, useRef, useEffect } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { apiSearch } from '../../API/apiService';

const PaginatedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFormFocused, setFocusState] = useState(false);
  const [maxResults, setMaxResults] = useState(20);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await apiSearch(query, maxResults, page);
      setResults(data.results);
      setTotalResults(data.totalResults);
      setFocusState(false); // Switch focus state to false
    } catch (error) {
      // Handle error appropriately
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
