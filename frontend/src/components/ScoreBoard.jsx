import React from 'react';

const ScoreBoard = ({ evaluationData }) => {
    
    // If there's an error or data didn't load properly
    if (!evaluationData || evaluationData.error) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>Session Ended</h2>
                <p>We could not generate a full report at this time.</p>
                <button onClick={() => window.location.reload()} style={styles.btn}>Start New Interview</button>
            </div>
        );
    }

    // Determine color based on score
    const { score, summary, strengths, weaknesses, improvements } = evaluationData;
    let scoreColor = "#10b981"; // Green (Good)
    if (score < 75) scoreColor = "#f59e0b"; // Yellow (Average)
    if (score < 50) scoreColor = "#ef4444"; // Red (Poor)

    return (
        <div style={styles.container}>
            <div style={styles.headerBox}>
                <div>
                    <h2 style={styles.title}>Interview Analysis Report</h2>
                    <p style={styles.subtitle}>Session completed successfully.</p>
                </div>
                <div style={{...styles.scoreCircle, borderColor: scoreColor}}>
                    <span style={{...styles.scoreNumber, color: scoreColor}}>{score}</span>
                    <span style={styles.scoreText}>/ 100</span>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Performance Summary</h3>
                <p style={styles.text}>{summary}</p>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={{...styles.sectionTitle, color: '#10b981'}}>Key Strengths</h3>
                    <ul style={styles.list}>
                        {strengths.map((item, i) => <li key={i} style={styles.listItem}>{item}</li>)}
                    </ul>
                </div>
                
                <div style={styles.card}>
                    <h3 style={{...styles.sectionTitle, color: '#ef4444'}}>Areas of Weakness</h3>
                    <ul style={styles.list}>
                        {weaknesses.map((item, i) => <li key={i} style={styles.listItem}>{item}</li>)}
                    </ul>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={{...styles.sectionTitle, color: '#3b82f6'}}>Actionable Improvements</h3>
                <ul style={styles.list}>
                    {improvements.map((item, i) => <li key={i} style={styles.listItem}>{item}</li>)}
                </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button onClick={() => window.location.reload()} style={styles.btn}>Start New Interview</button>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: "900px", margin: "0 auto", padding: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#f9fafb", fontFamily: "'Inter', sans-serif" },
    headerBox: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "30px", marginBottom: "30px" },
    title: { fontSize: "2rem", margin: 0, fontWeight: "bold" },
    subtitle: { color: "#9ca3af", margin: "10px 0 0 0" },
    scoreCircle: { width: "120px", height: "120px", borderRadius: "50%", border: "4px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" },
    scoreNumber: { fontSize: "3rem", fontWeight: "bold", lineHeight: "1" },
    scoreText: { fontSize: "0.9rem", color: "#9ca3af" },
    section: { background: "rgba(0,0,0,0.2)", padding: "25px", borderRadius: "16px", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.05)" },
    sectionTitle: { fontSize: "1.2rem", marginBottom: "15px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
    text: { color: "#d1d5db", lineHeight: "1.6", fontSize: "1rem" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "25px" },
    card: { background: "rgba(0,0,0,0.2)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" },
    list: { margin: 0, paddingLeft: "20px", color: "#d1d5db" },
    listItem: { marginBottom: "10px", lineHeight: "1.5" },
    btn: { padding: "15px 30px", fontSize: "1rem", fontWeight: "bold", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #1e40af)", color: "#fff", border: "none", cursor: "pointer", transition: "0.2s" }
};

export default ScoreBoard;