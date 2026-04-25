export default function Voice({ setText }) {

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      setText(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <button onClick={startListening}>
      🎤 Speak
    </button>
  );
}