import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ChatRoom from './components/ChatRoom';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import ProtectedRoute from './components/ProtectedRoute';
import APIClient from './utils/APIClient';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      APIClient.setToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create-room" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateRoom />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/join-room" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <JoinRoom />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chat/:roomId" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
 
