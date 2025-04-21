import React, { useState } from 'react';
import '../styles/LandingPage.css'; 
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      navigate('/');
    }
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      };


      const data = await response.json();
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_email', email); 
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-container">

      <div className="content">
        <h2 className="headline">Admin Side Login - iHelp</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button big">Log In</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
