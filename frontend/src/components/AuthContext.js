import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile from database using the token
      fetchUserProfile(token);
    } else {
      setUser(null);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback to JWT decoding if API fails
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        let userObj = decoded.user;
        if (!userObj.firstName && userObj.name) {
          const parts = userObj.name.trim().split(' ');
          userObj.firstName = parts[0];
          userObj.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }
        setUser(userObj);
      } catch {
        setUser(null);
      }
    }
  };

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserProfile(token);
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
