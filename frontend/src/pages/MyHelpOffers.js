import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import '../styles/LandingPage.css';

const MyHelpOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  useEffect(() => {
    const fetchMyOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_BASE_URL + '/help/my-offers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Failed to load your help offers');
        }

        const data = await res.json();
        setOffers(data);
      } catch (err) {
        setMessage('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOffers();
  }, []);

  return (
    <div className="landing-container">
      <Navbar loggedIn={!!localStorage.getItem('token')} />
      <div className="content">
        <h2 className="headline">My Help Offers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : message ? (
          <p className="error-message">{message}</p>
        ) : offers.length === 0 ? (
          <p>You haven't offered help to any requests yet.</p>
        ) : (
          <div className="card-grid">
            {offers.map((offer) => (
              <div className="help-card" key={offer._id}>
                <h3 className="help-title">{offer.help_heading}</h3>
                <p><strong>Status:</strong> {offer.status}</p>
                <p><strong>Requested By:</strong> {offer.help_author_name}</p>
                <p><strong>Comment:</strong> {offer.comment || '—'}</p>
                <p className="post-meta">{new Date(offer.timestamp).toLocaleString()}</p>
                <p><strong>Description:</strong> {offer.help_content}</p>
                <p><strong>Post Date:</strong> {new Date(offer.help_timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHelpOffers;
