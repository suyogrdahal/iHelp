import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';

const CreateHelpPost = () => {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const author = localStorage.getItem('user_email');

    const payload = {
      heading,
      content,
      author,
      status: 'active',
      helped: false,
      helper: null,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(API_BASE_URL + '/help/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create help post');
      setMessage('Help post created successfully!');
      setHeading('');
      setContent('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="landing-container">
      <Navbar loggedIn={!!localStorage.getItem('token')} />
      <div className="content">
        <h2 className="headline">Create a Help Post</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
          />
          <textarea
            rows="5"
            placeholder="Describe what you need help with..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="navbar-button big">Post Help Request</button>
        </form>
        {message && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default CreateHelpPost;
