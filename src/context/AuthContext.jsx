import { createContext, useContext, useState } from 'react';

// Container that holds auth state
const AuthContext = createContext(null);

// Custom hook so components can call useAuth() to get auth data
export function useAuth() {
  const context = useContext(AuthContext);
  // Catch the mistake of using this outside the provider
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Logged in if there is a user object
  const isAuthenticated = user !== null;

  // Simulated login: accepts any username/password
  const login = (username, password, role = 'regular') => {
    const mockToken = `mock_jwt_token_${Date.now()}`; 
    const userData = { username, role, token: mockToken };
    setUser(userData);
    localStorage.setItem('authToken', mockToken);
    return userData;
  };

  // Clear user and token
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  // Role checks
  const hasRole = (role) => user?.role === role;
  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}