import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import './styles/App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    setToken(savedToken);
    setUser(savedUser);
  }, []);

  const handleLogin = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', username);
    setToken(token);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
