export default function Home({ start }) {
  return (
    <div style={{textAlign: "center", marginTop: "100px"}}>
      <h1>AI Interview System</h1>

      <button onClick={start}>
        Start Interview
      </button>
    </div>
  );
}
