// File: frontend/src/components/QueueTest.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ["polling", "websocket"],
});

const USER_ID = "test-user-id";

const QueueTest = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [queue, setQueue] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    socket.on("queue_updated", (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      socket.off("queue_updated");
    };
  }, []);

  const joinSession = async () => {
    if (!sessionCode) return;

    // Backend user join (ensure the user is part of session)
    await fetch("http://localhost:8000/api/user/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_code: sessionCode,
        id: USER_ID,
        name: "Test User",
        avatar_base64: "",
      }),
    });

    socket.emit("join_room", sessionCode);
    socket.emit("register_user", {
      session_code: sessionCode,
      id: USER_ID,
    });

    // Fetch initial queue
    const res = await fetch(`http://localhost:8000/api/session/${sessionCode}`);
    const data = await res.json();
    setQueue(data.data.queue || []);

    setJoined(true);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    const res = await fetch(
      `http://localhost:8000/api/youtube/search?q=${encodeURIComponent(query)}&limit=5`
    );
    const json = await res.json();

    if (json.status === "OK") {
      setSearchResults(json.results);
    } else {
      alert("Search error: " + json.message);
    }
  };

  const handleAddSong = async (video) => {
    const song = {
      song_id: video.id,
      title: video.title,
      duration: video.duration,
      added_by: USER_ID,
      thumbnails: video.thumbnails,
    };

    await fetch("http://localhost:8000/api/queue/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_code: sessionCode,
        song,
      }),
    });

    setSearchResults([]);
    setQuery("");
  };

  const handleRemove = async (song_id) => {
    await fetch("http://localhost:8000/api/queue/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_code: sessionCode,
        song_id,
        user_id: USER_ID,
      }),
    });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", background: "#111", color: "white", minHeight: "100vh" }}>
      <h2>🎤 Karayouke Queue Test</h2>

      {!joined && (
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="Enter Room Code"
            style={{ padding: "0.5rem", marginRight: "1rem" }}
          />
          <button onClick={joinSession}>🔗 Join Session</button>
        </div>
      )}

      {joined && (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube for Karaoke"
              style={{ padding: "0.5rem", width: "400px", marginRight: "1rem" }}
            />
            <button onClick={handleSearch}>🔍 Search</button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4>🔎 Search Results</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {searchResults.map((video, index) => (
                  <li key={index} style={{ marginBottom: "1rem", borderBottom: "1px solid #333", paddingBottom: "1rem" }}>
                    <div><strong>{video.title}</strong> — {video.duration}</div>
                    <img src={video.thumbnails?.[0]} alt="thumb" width={180} style={{ marginTop: "0.5rem", borderRadius: 8 }} />
                    <br />
                    <button onClick={() => handleAddSong(video)} style={{ marginTop: "0.5rem" }}>
                      ➕ Add to Queue
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                  <button onClick={() => handleRemove(song.song_id)} style={{ marginTop: "0.5rem" }}>
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default QueueTest;
