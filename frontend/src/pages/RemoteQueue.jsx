import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import JoinSessionBar from "../components/JoinSessionBar";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import QueueList from "../components/QueueList";

const socket = io("http://localhost:8000", {
  withCredentials: true,
  transports: ["polling", "websocket"],
});

const USER_ID = "test-user-id";

const RemoteQueue = () => {
  const [sessionCode, setSessionCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [queue, setQueue] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    socket.on("queue_updated", setQueue);
    return () => socket.off("queue_updated");
  }, []);

  const joinSession = async () => {
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

    socket.emit("join_room", sessionCode, () => {
      socket.emit("register_user", { session_code: sessionCode, id: USER_ID });
    });

    const res = await fetch(`http://localhost:8000/api/session/${sessionCode}`);
    const data = await res.json();
    setQueue(data.data.queue || []);
    setJoined(true);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    const res = await fetch(`http://localhost:8000/api/youtube/search?q=${encodeURIComponent(query)}&limit=5`);
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
      <h2>🎤 Karayouke Remote Queue</h2>

      {!joined ? (
        <JoinSessionBar sessionCode={sessionCode} setSessionCode={setSessionCode} onJoin={joinSession} />
      ) : (
        <>
          <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
          <SearchResults searchResults={searchResults} onAdd={handleAddSong} />
          <QueueList queue={queue} onRemove={handleRemove} />
        </>
      )}
    </div>
  );
};

export default RemoteQueue;
