// src/components/Voice.jsx

export const speakEnglish = (text, onEnd) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // HUMANIZING PARAMETERS
  utterance.lang = "en-US";
  utterance.pitch = 1.1; // Slightly higher pitch feels warmer
  utterance.rate = 0.95; // Slightly slower pacing prevents robotic rushing
  
  const voices = window.speechSynthesis.getVoices();
  // Attempt to find premium natural voices first
  utterance.voice = voices.find(v => v.name.includes("Natural") && v.lang === "en-US") ||
                    voices.find(v => v.name.includes("Google US English")) || 
                    voices.find(v => v.name.includes("Zira")) || // Microsoft Zira is quite clear
                    voices.find(v => v.lang === "en-US") || voices[0];

  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
};

export const startEnglishMic = (onResult, onStart, onInterim, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false; 
  recognition.interimResults = true;

  recognition.onstart = onStart;
  
  recognition.onresult = (event) => {
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        onResult(event.results[i][0].transcript);
      } else {
        interimText += event.results[i][0].transcript;
      }
    }
    if (onInterim) onInterim(interimText);
  };

  recognition.onerror = (e) => {
    console.error("Mic Error:", e.error);
    if (onError) onError();
  };

  recognition.start();
  return recognition; 
};