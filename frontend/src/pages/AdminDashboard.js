import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import { Chart } from 'chart.js/auto';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [chartRef, setChartRef] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_token') !== null;
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    const fetchStats = async () => {
      try {
    
        const userRes = await fetch(API_BASE_URL + '/admin/user-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUserCount(userData.count);

        const helpRes = await fetch(API_BASE_URL +'/admin/help-posts-by-date', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const helpData = await helpRes.json();

        const dates = helpData.map((d) => d.date);
        const counts = helpData.map((d) => d.count);

        const ctx = document.getElementById('helpChart');
        if (chartRef) chartRef.destroy(); 

        const newChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Help Posts Created',
              data: counts,
              borderColor: 'rgba(37, 99, 235, 1)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.3
            }]
          }
        });
        setChartRef(newChart);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  return (
    <div className="landing-container">
      <div className="content">
        <h2 className="headline">Admin Dashboard</h2>
        <p><strong>Total Users Registered:</strong> {userCount}</p>
        <canvas id="helpChart" height="100"></canvas>
        <div style={{ marginTop: '2rem' }}>
          <button className="navbar-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
