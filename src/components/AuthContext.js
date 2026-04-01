import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        let userObj = decoded.user;
        // If firstName is missing but name exists, split it
        if (!userObj.firstName && userObj.name) {
          const parts = userObj.name.trim().split(' ');
          userObj.firstName = parts[0];
          userObj.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }
        setUser(userObj);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = JSON.parse(atob(token.split('.')[1]));
    let userObj = decoded.user;
    if (!userObj.firstName && userObj.name) {
      const parts = userObj.name.trim().split(' ');
      userObj.firstName = parts[0];
      userObj.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    }
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
