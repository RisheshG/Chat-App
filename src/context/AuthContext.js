import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Import Firebase auth
import { signOut } from 'firebase/auth'; // Import the signOut method

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext); // Ensure the context is being used properly
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

  // Define the logout function
  const logout = () => {
    return signOut(auth); // Uses Firebase's signOut function
  };

  // Provide the logout function in the context value
  const value = {
    currentUser, // Provide the current user
    logout, // Provide the logout function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Ensure the app renders only after loading */}
    </AuthContext.Provider>
  );
}
