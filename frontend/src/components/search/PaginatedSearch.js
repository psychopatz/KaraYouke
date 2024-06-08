import React, { useState, useEffect } from 'react';

const PaginatedSearch = ({ apiUrl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  const fetchResults = async () => {
    if (!query) return;
    try {
      const response = await fetch(`${apiUrl}?query=${query}&max_results=${maxResults}&page=${page}`);
      const data = await response.json();
      setResults(data.results);
      setTotalResults(data.total_results);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, page, maxResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchResults();
  };

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search..." 
        />
        <button type="submit">Search</button>
      </form>

      <div>
        {results.map((result, index) => (
          <div key={index}>
            <h3>{result.title}</h3>
            <p>{result.description}</p>
          </div>
        ))}
      </div>

      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={(page * maxResults) >= totalResults}>Next</button>
      </div>
    </div>
  );
};

export default PaginatedSearch;
