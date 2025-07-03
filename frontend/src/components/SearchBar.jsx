import React from "react";

const SearchBar = ({ query, setQuery, onSearch }) => (
  <div style={{ marginBottom: "1.5rem" }}>
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search YouTube for Karaoke"
      style={{ padding: "0.5rem", width: "400px", marginRight: "1rem" }}
    />
    <button onClick={onSearch}>🔍 Search</button>
  </div>
);

export default SearchBar;
