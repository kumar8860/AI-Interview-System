import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error connecting to backend");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Interview System</h2>

      <input
        type="text"
        placeholder="Enter question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit</button>

      <h3>Answer:</h3>
      <p>{answer}</p>
    </div>
  );
}

export default App;