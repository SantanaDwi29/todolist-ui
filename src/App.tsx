import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen text-[#e5e2e1]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131313',
            color: '#e5e2e1',
            border: '1px solid #2a2a2a',
            borderRadius: '0',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          },
          success: {
            iconTheme: {
              primary: '#B4E3AC',
              secondary: '#131313',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#131313',
            },
            style: {
              border: '1px solid #ff4444',
            }
          }
        }}
      />
    </Router>
  );
};

export default App;
