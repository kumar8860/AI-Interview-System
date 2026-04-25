import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [score, setScore] = useState("");
  const [confidence, setConfidence] = useState("");

  useEffect(() => {
    startInterview();
  }, []);

  // -------- START --------
  const startInterview = async () => {
    const res = await fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "sde" }),
    });

    const data = await res.json();
    setQuestion(data.question);
    speak(data.question);
  };

  // -------- SPEECH (AI VOICE) --------
  const speak = (text) => {
    window.speechSynthesis.cancel(); // stop previous
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // -------- LISTEN (AUTO) --------
  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      console.log("User:", transcript);

      // send to backend
      const res = await fetch("http://127.0.0.1:5000/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: transcript }),
      });

      const data = await res.json();

      setQuestion(data.next_question);
      setScore(data.score);
      setConfidence(data.confidence);

      speak(data.next_question);
    };

    // -------- INTERRUPTION (barge-in) --------
    recognition.onstart = () => {
      window.speechSynthesis.cancel();
    };

    recognition.start();
  }, []);

  return (
    <div className="app">
      <h1>AI Interviewer</h1>

      <div className="question">
        <strong>AI:</strong> {question}
      </div>

      <div className="stats">
        <p>Score: {score}</p>
        <p>Confidence: {confidence}</p>
      </div>
    </div>
  );
}

export default App;