import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/LandingPage.css'; 
import Navbar from '../components/Navbar';

const messages = [
  'Get Help Fast.',
  'Offer Help Freely.',
  'Connect. Support. Empower.'
];

const LandingPage = () => {
  const [index, setIndex] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoggedIn(!!token);

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="landing-container">
      <Navbar loggedIn={loggedIn} />

      <div className="content">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="headline"
        >
          {messages[index]}
        </motion.h1>
        {!loggedIn ? (
          <button onClick={handleLogin} className="login-button big">
            Log In
          </button>
        ) : (
            <span className="welcome-text"></span>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
