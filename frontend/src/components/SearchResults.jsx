import React from "react";

const SearchResults = ({ searchResults, onAdd }) => {
  if (searchResults.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h4>🔎 Search Results</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {searchResults.map((video, index) => (
          <li key={index} style={{ marginBottom: "1rem", borderBottom: "1px solid #333", paddingBottom: "1rem" }}>
            <div><strong>{video.title}</strong> — {video.duration}</div>
            <img src={video.thumbnails?.[0]} alt="thumb" width={180} style={{ marginTop: "0.5rem", borderRadius: 8 }} />
            <br />
            <button onClick={() => onAdd(video)} style={{ marginTop: "0.5rem" }}>➕ Add to Queue</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
