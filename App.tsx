
import React, { useState } from 'react';
import { User } from './types';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { BackgroundMusic } from './components/BackgroundMusic';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleStart = () => {
    // Automatically log in as a default user
    setUser({
      username: "Little Explorer",
      grade: 1,
      xp: 0
    });
  };

  const handleExit = () => {
    setUser(null);
  };

  return (
    <>
      <BackgroundMusic />
      
      {user ? (
        <Dashboard user={user} onLogout={handleExit} />
      ) : (
        <Landing onStart={handleStart} />
      )}
    </>
  );
};

export default App;
