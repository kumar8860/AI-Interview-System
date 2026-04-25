import { useState } from "react";
import Home from "./pages/Home";
import Interview from "./pages/Interview";

function App() {
  const [start, setStart] = useState(false);

  return start ? (
    <Interview />
  ) : (
    <Home start={() => setStart(true)} />
  );
}

export default App;