// src/context/AuthContext.js
import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Import Firebase auth

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext); // Make sure this is exported properly
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener to handle user state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); // Ensure loading stops after the user state is updated
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser, // Ensure currentUser is provided in the context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Ensure the app renders only after loading */}
    </AuthContext.Provider>
  );
}
