import React from "react";

const RoleSelector = ({ selectedRole, onRoleChange, disabled }) => {
  const roles = [
    "Software Engineer",
    "Data Analyst",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Product Manager",
    "DevOps Engineer"
  ];

  return (
    <div style={styles.container}>
      <label style={styles.label}>Target Job Role:</label>
      <select 
        value={selectedRole} 
        onChange={(e) => onRoleChange(e.target.value)} 
        style={styles.select}
        disabled={disabled}
      >
        {roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: { marginBottom: "20px", textAlign: "left" },
  label: { fontWeight: "bold", display: "block", marginBottom: "8px", color: "#2d3436" },
  select: { 
    width: "100%", 
    padding: "12px", 
    borderRadius: "8px", 
    border: "1px solid #dfe6e9", 
    backgroundColor: "#fff",
    fontSize: "1rem",
    outline: "none"
  }
};

export default RoleSelector;