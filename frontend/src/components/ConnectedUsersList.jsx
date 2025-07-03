// src/components/ConnectedUsersList.jsx
import React from "react";

const ConnectedUsersList = ({ users, onKick }) => (
  <div>
    <h4>👥 Connected Users</h4>
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          <img src={u.avatar_base64} alt="avatar" width={32} style={{ verticalAlign: "middle" }} />{" "}
          {u.name}
          {u.id.startsWith("remote_") && (
            <button style={{ marginLeft: "1rem", color: "red" }} onClick={() => onKick(u.id)}>
              ❌ Disconnect
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default ConnectedUsersList;
