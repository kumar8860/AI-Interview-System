import { useState } from "react";
import Camera from "../components/Camera";
import Voice from "../components/Voice";
import ResumeUpload from "../components/ResumeUpload";

export default function Interview() {

  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [confidence, setConfidence] = useState("");
  const [score, setScore] = useState(0);
  const [resume, setResume] = useState(null);

  // 🔊 AI SPEAK FUNCTION
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // 🚀 START INTERVIEW
  const startInterview = async () => {
    const res = await fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "sde" })
    });

    const data = await res.json();

    setQuestion(data.question);
    speak(data.question);
  };

  // 🎯 SUBMIT ANSWER
  const handleSubmit = async () => {

    if (!answer) return;

    const res = await fetch("http://127.0.0.1:5000/interview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer })
    });

    const data = await res.json();

    setQuestion(data.next_question);
    setConfidence(data.analysis?.confidence || "N/A");
    setScore(data.score || 0);

    speak(data.next_question);

    setAnswer(""); // clear input
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* LEFT SIDE - CAMERA */}
      <div style={{
        flex: 1,
        background: "#0f172a",
        color: "white",
        padding: "20px"
      }}>
        <h3>Candidate</h3>
        <Camera />
      </div>

      {/* RIGHT SIDE - INTERVIEW */}
      <div style={{
        flex: 2,
        padding: "30px",
        background: "#f8fafc"
      }}>

        <h2>AI Interviewer</h2>

        {/* Resume Upload */}
        <ResumeUpload setResume={setResume} />

        <br />

        {/* Start Button */}
        <button
          onClick={startInterview}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            marginBottom: "20px"
          }}
        >
          Start Interview
        </button>

        {/* Question Box */}
        <div style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "white"
        }}>
          <b>Question:</b>
          <p>{question || "Click Start Interview"}</p>
        </div>

        <br />

        {/* Answer Input */}
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          style={{
            width: "80%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <br /><br />

        {/* Voice Input */}
        <Voice setText={setAnswer} />

        <br /><br />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            border: "none"
          }}
        >
          Submit Answer
        </button>

        <br /><br />

        {/* Analysis */}
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e2e8f0",
          borderRadius: "10px"
        }}>
          <p><b>Confidence:</b> {confidence}</p>
          <p><b>Score:</b> {score}/100</p>
        </div>

      </div>
    </div>
  );
}