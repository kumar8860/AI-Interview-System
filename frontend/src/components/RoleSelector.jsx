import React from "react";

function RoleSelector({ setRole }) {
  return (
    <div className="role-container">
      <h2>Select Interview Role</h2>

      <button onClick={() => setRole("sde")}>
        Software Developer
      </button>

      <button onClick={() => setRole("data_analyst")}>
        Data Analyst
      </button>
    </div>
  );
}

export default RoleSelector;