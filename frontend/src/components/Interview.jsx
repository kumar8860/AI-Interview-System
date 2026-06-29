import React, { useState, useRef, useEffect, useCallback } from "react";
import Camera from "./Camera";
import ScoreBoard from "./ScoreBoard";
import RoleSelector from "./RoleSelector";
import { speakEnglish, startEnglishMic } from "./Voice";

const Interview = () => {
  const [question, setQuestion] = useState("AI Interview System | Readiness Check");
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Fresher");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  
  // --- NEW: State for the final evaluation report ---
  const [evaluationData, setEvaluationData] = useState(null);
  
  const [eyeContact, setEyeContact] = useState("Direct");
  const [eyeColor, setEyeColor] = useState("#10b981");
  const [confidence, setConfidence] = useState("High");
  const [clarity, setClarity] = useState("High");
  
  const activeMic = useRef(null);
  const watchdog = useRef(null);

  const handleMetrics = useCallback((data) => {
    if (data.eyeContact) {
      setEyeContact(data.eyeContact);
      setEyeColor(data.contactColor);
    }
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (activeMic.current) activeMic.current.abort();
      clearTimeout(watchdog.current);
    };
  }, []);

  const analyzeSpeechQuality = (text) => {
    const fillers = (text.toLowerCase().match(/\b(um|uh|like|sort of)\b/g) || []).length;
    if (fillers > 2) {
        setClarity("Moderate");
        setConfidence("Wavering");
    } else {
        setClarity("High");
        setConfidence("High");
    }
  };

  const handleStart = async () => {
    if (!resumeFile) return alert("System requires resume for profile mapping.");
    setStatus("processing");
    const fd = new FormData();
    fd.append("resume", resumeFile);
    fd.append("role", role);
    fd.append("level", level);
    fd.append("mode", mode);

    try {
      const res = await fetch("http://localhost:5000/start", { method: "POST", body: fd });
      const data = await res.json();
      setSessionId(data.session_id);
      engineControl(data.question, data.session_id, false);
    } catch (e) { 
        setStatus("idle"); 
        alert("Failed to connect to the server.");
    }
  };

  // --- UPDATED: Automatically fetch evaluation when interview is over ---
  const submitAnswerToBackend = async (finalTranscript, sid) => {
    if (status === "processing" || status === "evaluating" || isFinished) return;
    
    setStatus("processing");
    clearTimeout(watchdog.current);
    if (activeMic.current) activeMic.current.abort();

    try {
      // 1. Submit the answer
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            session_id: sid || sessionId, 
            answer: finalTranscript || liveTranscript, 
            code: userCode 
        })
      });
      const data = await res.json();
      
      setUserCode(""); // Clear editor for next question

      if (data.is_final) {
          // 2. Speak the final goodbye message
          engineControl(data.next_question, sid || sessionId, true);
          
          // 3. Change UI status to show we are analyzing the results
          setStatus("evaluating");
          
          // 4. Fetch the final JSON report
          const evalRes = await fetch("http://localhost:5000/evaluate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sid || sessionId })
          });
          const evalData = await evalRes.json();
          
          // 5. Save the data and transition to the ScoreBoard
          setEvaluationData(evalData);
          setIsFinished(true);
          setStatus("idle");
      } else {
          // Continue to the next question
          engineControl(data.next_question, sid || sessionId, false);
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => startListening(sid || sessionId), 1000);
    }
  };

  const engineControl = (text, sid, final) => {
    if (activeMic.current) activeMic.current.abort();
    clearTimeout(watchdog.current);

    // If it's the final question, we might already be in "evaluating" state, so don't overwrite it with "speaking"
    if (!final) setStatus("speaking");
    
    setQuestion(text);
    setLiveTranscript("");

    speakEnglish(text, () => {
      if (!final) {
        setTimeout(() => startListening(sid), 400);
      }
    });
  };

  const startListening = (sid) => {
    if (status === "processing" || status === "evaluating" || isFinished) return;

    clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      if (status === "listening") startListening(sid);
    }, 12000);

    activeMic.current = startEnglishMic(
      async (ans) => {
        if (ans.trim().length < 2 && !userCode.trim()) return; 
        submitAnswerToBackend(ans, sid);
      },
      () => setStatus("listening"),
      (interim) => {
        setLiveTranscript(interim);
        analyzeSpeechQuality(interim);
        clearTimeout(watchdog.current);
        watchdog.current = setTimeout(() => startListening(sid), 10000);
      },
      () => { setTimeout(() => startListening(sid), 1000); }
    );
  };

  return (
    <div style={ui.page}>
      <div style={ui.wrapper}>
        <header style={ui.header}>
          <div style={ui.logo}>AI <span style={{color: '#3b82f6'}}>INTERVIEW SYSTEM</span></div>
          <div style={ui.status(status)}>{status.toUpperCase()}</div>
        </header>

        {!isFinished ? (
          <div style={ui.grid}>
            <aside style={ui.aside}>
              <div style={ui.camContainer}>
                <Camera 
                    onMetricsUpdate={handleMetrics} 
                    isInterviewActive={sessionId !== null && !isFinished} 
                />
              </div>
              <div style={ui.analyticsCard}>
                <h4 style={ui.miniHeader}>BEHAVIORAL ANALYTICS</h4>
                <div style={ui.stat}>Eye Contact: <strong style={{color: eyeColor}}>{eyeContact}</strong></div>
                <div style={ui.stat}>Confidence: <strong>{confidence}</strong></div>
                <div style={ui.stat}>Clarity: <strong>{clarity}</strong></div>
              </div>
            </aside>

            <main style={ui.main}>
              {!sessionId ? (
                <div style={ui.glassBox}>
                  <RoleSelector selectedRole={role} onRoleChange={setRole} />
                  <div style={ui.flexGroup}>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} style={ui.select}>
                      <option value="Fresher">Entry Level (Fresher)</option>
                      <option value="Intermediate">Mid-Level (Intermediate)</option>
                      <option value="Senior">Expert (Senior)</option>
                    </select>
                    <select value={mode} onChange={(e) => setMode(e.target.value)} style={ui.select}>
                      <option value="Technical">Technical Round</option>
                      <option value="HR">Behavioral / HR Round</option>
                    </select>
                  </div>
                  
                  <div style={ui.resumeUploadBox}>
                    <label style={ui.uploadLabel}>Upload Candidate Resume (PDF):</label>
                    <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} style={ui.file} />
                  </div>

                  <button onClick={handleStart} style={ui.actionBtn}>ESTABLISH LINK</button>
                </div>
              ) : (
                <div style={ui.glassBox}>
                  <h2 style={ui.questionText}>{question}</h2>
                  {mode === "Technical" && (
                    <textarea 
                      placeholder="// Type your implementation here..." 
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      style={ui.codeEditor}
                    />
                  )}
                  <div style={ui.transcriptRow}>
                    <div style={ui.pulse(status)}></div>
                    <p>{liveTranscript || "Awaiting verbal response..."}</p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', alignItems: 'center' }}>
                    <button onClick={() => window.location.reload()} style={ui.abortBtn}>ABORT SESSION</button>
                    
                    <button 
                        onClick={() => submitAnswerToBackend(liveTranscript, sessionId)} 
                        disabled={status === "processing" || status === "speaking" || status === "evaluating"}
                        style={{...ui.actionBtn, padding: '12px 24px', opacity: (status === "processing" || status === "speaking" || status === "evaluating") ? 0.5 : 1}}
                    >
                        {status === "processing" ? "PROCESSING..." : status === "evaluating" ? "GENERATING REPORT..." : "SUBMIT ANSWER"}
                    </button>
                  </div>

                </div>
              )}
            </main>
          </div>
        ) : (
          /* --- UPDATED: Pass the evaluation object instead of just text --- */
          <ScoreBoard evaluationData={evaluationData} />
        )}
      </div>
    </div>
  );
};

const ui = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top, #111827, #030712)", color: "#f9fafb", padding: "40px 20px", fontFamily: "'Inter', sans-serif" },
  wrapper: { maxWidth: "1200px", margin: "auto" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "40px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  logo: { fontSize: "1.3rem", fontWeight: "900", letterSpacing: "2px" },
  status: (s) => ({ 
      padding: "4px 14px", 
      borderRadius: "4px", 
      fontSize: "0.6rem", 
      fontWeight: "bold", 
      background: s === "listening" ? "#ef4444" : s === "processing" ? "#f59e0b" : s === "evaluating" ? "#8b5cf6" : "#1e293b", 
      color: "#fff" 
  }),
  grid: { display: "grid", gridTemplateColumns: "380px 1fr", gap: "30px" },
  aside: { display: "flex", flexDirection: "column", gap: "20px" },
  camContainer: { width: "100%", aspectRatio: "1/1", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" },
  analyticsCard: { padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" },
  miniHeader: { fontSize: "0.6rem", color: "#6b7280", letterSpacing: "1px", marginBottom: "15px" },
  stat: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "10px" },
  main: { display: "flex" },
  glassBox: { flex: 1, padding: "40px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" },
  flexGroup: { display: "flex", gap: "10px", margin: "20px 0 10px 0" },
  select: { flex: 1, padding: "14px", borderRadius: "10px", background: "#111827", color: "#fff", border: "1px solid #374151" },
  resumeUploadBox: { margin: "20px 0 35px 0", padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed #374151", display: "flex", flexDirection: "column", gap: "10px" },
  uploadLabel: { fontSize: "0.85rem", color: "#9ca3af", fontWeight: "500" },
  file: { fontSize: "0.85rem", color: "#e5e7eb", cursor: "pointer" },
  actionBtn: { padding: "18px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #1e40af)", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer", transition: "0.2s" },
  questionText: { fontSize: "1.7rem", fontWeight: "300", lineHeight: "1.4", marginBottom: "30px" },
  codeEditor: { flex: 1, minHeight: "250px", padding: "20px", background: "#030712", color: "#10b981", borderRadius: "12px", border: "1px solid #1f2937", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "20px" },
  transcriptRow: { display: "flex", alignItems: "center", gap: "15px", color: "#3b82f6", fontSize: "0.9rem", fontStyle: "italic" },
  pulse: (s) => ({ width: "10px", height: "10px", borderRadius: "50%", background: s === "listening" ? "#ef4444" : "#3b82f6" }),
  abortBtn: { background: "none", border: "1px solid #374151", color: "#6b7280", padding: "12px 24px", borderRadius: "12px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }
};

export default Interview;