import React from "react";

const QueueList = ({ queue, onRemove }) => (
  <>
    <h4>🎶 Current Queue:</h4>
    {queue.length === 0 ? (
      <p>No songs in queue.</p>
    ) : (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {queue.map((song) => (
          <li key={song.song_id} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #444", paddingBottom: "1rem" }}>
            <div><strong>{song.title}</strong> ({song.duration})</div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              {song.thumbnails.map((thumb, idx) => (
                <img key={idx} src={thumb} alt="thumb" width={100} style={{ borderRadius: "6px" }} />
              ))}
            </div>
            <button onClick={() => onRemove(song.song_id)} style={{ marginTop: "0.5rem" }}>❌ Remove</button>
          </li>
        ))}
      </ul>
    )}
  </>
);

export default QueueList;
