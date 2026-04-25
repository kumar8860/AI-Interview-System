import React, { useState, useEffect, useRef } from "react";

function Interview({ role }) {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [score, setScore] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = async () => {
    const res = await fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();
    setQuestion(data.question);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();

    chunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };
  };

  const stopRecording = async () => {
    return new Promise((resolve) => {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/wav" });

        const formData = new FormData();
        formData.append("audio", blob, "audio.wav");

        const res = await fetch("http://127.0.0.1:5000/interview", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        setConversation((prev) => [
          ...prev,
          { question, answer: data.transcribed_text },
        ]);

        setQuestion(data.next_question);
        setScore(data.score);
        setConfidence(data.confidence);

        resolve();
      };
    });
  };

  return (
    <div className="interview-container">
      <h2>Role: {role}</h2>

      <div className="question-box">
        <strong>AI:</strong> {question}
      </div>

      <div className="controls">
        <button onClick={startRecording}>🎤 Start</button>
        <button onClick={stopRecording}>⏹ Stop</button>
      </div>

      <div className="stats">
        <p>Score: {score}</p>
        <p>Confidence: {confidence}</p>
      </div>

      <div className="chat-box">
        {conversation.map((item, index) => (
          <div key={index} className="chat-item">
            <p><strong>Q:</strong> {item.question}</p>
            <p><strong>A:</strong> {item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Interview;