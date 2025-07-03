import React from "react";

const JoinSessionBar = ({ sessionCode, setSessionCode, onJoin }) => (
  <div style={{ marginBottom: "2rem" }}>
    <input
      type="text"
      value={sessionCode}
      onChange={(e) => setSessionCode(e.target.value)}
      placeholder="Enter Room Code"
      style={{ padding: "0.5rem", marginRight: "1rem" }}
    />
    <button onClick={onJoin}>🔗 Join Session</button>
  </div>
);

export default JoinSessionBar;
