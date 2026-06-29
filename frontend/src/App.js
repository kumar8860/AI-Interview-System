import React, { useState } from 'react';
import Login from './components/Login';
import Interview from './components/Interview'; // Your stable component is imported here

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Interview currentUser={user} />
      )}
    </div>
  );
}

export default App;