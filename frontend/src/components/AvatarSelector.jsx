// src/components/AvatarSelector.jsx
import React from "react";

const AvatarSelector = ({ avatarIndex, setAvatarIndex }) => (
  <label>
    Avatar:
    <select value={avatarIndex} onChange={(e) => setAvatarIndex(e.target.value)}>
      {[...Array(21).keys()].map((i) => (
        <option key={i + 1} value={i + 1}>
          Avatar {i + 1}
        </option>
      ))}
    </select>
  </label>
);

export default AvatarSelector;
