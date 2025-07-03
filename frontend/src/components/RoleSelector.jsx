// src/components/RoleSelector.jsx
import React from "react";

const RoleSelector = ({ role, setRole }) => (
  <label>
    Select Role:{" "}
    <select value={role} onChange={(e) => setRole(e.target.value)}>
      <option value="monitor">Monitor</option>
      <option value="remote">Remote</option>
    </select>
  </label>
);

export default RoleSelector;
