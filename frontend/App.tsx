import React, { useState } from 'react';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

// Attribution: this app follows module-taught patterns credited to Justin Fletcher (auth + CRUD via API).
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <HomeScreen onLogout={() => setIsLoggedIn(false)} />;
}
