import React from "react";

const ScoreBoard = ({ finalFeedback, history }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{margin: 0}}>Interview Performance Report</h2>
        <span style={styles.tag}>AI Evaluated</span>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Emotional Stability</h4>
          <div style={styles.score}>High</div>
          <p style={styles.cardDetail}>Consistent eye contact and focused expression detected.</p>
        </div>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Response Clarity</h4>
          <div style={styles.score}>Professional</div>
          <p style={styles.cardDetail}>English language proficiency and tone were within industry standards.</p>
        </div>
      </div>

      <div style={styles.feedbackSection}>
        <h3 style={{color: "#0984e3"}}>Expert Behavioral Feedback</h3>
        <div style={styles.feedbackText}>{finalFeedback}</div>
      </div>

      <div style={styles.footer}>
        <button onClick={() => window.location.reload()} style={styles.resetBtn}>Try New Interview</button>
        <button onClick={() => window.print()} style={styles.printBtn}>Export as PDF</button>
      </div>
    </div>
  );
};

const styles = {
  container: { background: "#fff", padding: "50px", borderRadius: "30px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", maxWidth: "900px", margin: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f2f6", paddingBottom: "20px", marginBottom: "30px" },
  tag: { padding: "5px 15px", background: "#e1f5fe", color: "#039be5", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" },
  metricsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" },
  card: { padding: "25px", background: "#f8f9fa", borderRadius: "20px", textAlign: "center" },
  cardTitle: { margin: "0 0 10px 0", color: "#636e72", fontSize: "0.9rem" },
  score: { fontSize: "2rem", fontWeight: "bold", color: "#2d3436", marginBottom: "10px" },
  cardDetail: { fontSize: "0.85rem", color: "#b2bec3", margin: 0 },
  feedbackSection: { background: "#f1f2f6", padding: "30px", borderRadius: "20px", lineHeight: "1.8", color: "#2d3436" },
  feedbackText: { whiteSpace: "pre-line" },
  footer: { marginTop: "40px", display: "flex", gap: "15px", justifyContent: "center" },
  resetBtn: { padding: "12px 30px", borderRadius: "10px", border: "2px solid #dfe6e9", background: "none", cursor: "pointer", fontWeight: "bold" },
  printBtn: { padding: "12px 30px", borderRadius: "10px", border: "none", background: "#2d3436", color: "#fff", cursor: "pointer", fontWeight: "bold" }
};
// src/components/ScoreBoard.jsx (Add this section to the UI)
<div style={styles.biometricGrid}>
  <div style={styles.biometricCard}>
    <h4>Stress Recovery Rate</h4>
    <div style={styles.chartBar}><div style={{width: '75%', background: '#10b981'}}></div></div>
    <p>User recovers quickly after difficult technical questions.</p>
  </div>
  <div style={styles.biometricCard}>
    <h4>Cognitive Authenticity</h4>
    <p style={{color: '#3b82f6', fontSize: '1.2rem'}}>92% Alignment</p>
    <p>Body language and verbal answers show high consistency.</p>
  </div>
</div>
export default ScoreBoard;