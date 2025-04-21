import React from 'react';
import '../styles/LandingPage.css';


const Navbar = ({ loggedIn }) => {
  const handleLogin = () => {
    window.location.href = '/login';
  };
  const handleViewHelp = () => {
    window.location.href = '/viewhelp';
  };
  const handleAddHelp = () => {
    window.location.href = '/askhelp';
  };
  const handleViewUserHelp = () => {
    window.location.href = '/viewmyhelprequests';
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email'); // Remove the email from local storage
    window.location.href = '/';
  }

  const handleSignup = () => {
    window.location.href = '/signup';
  }

  const handleMyOffers = () => {
    window.location.href = '/my-offers';
  }

  return (
    <nav className="navbar">
      <h1 className="logo">iHelp</h1>
      <div>
        <div className='navbar-buttons'>
      <button onClick={handleViewHelp} className="navbar-button">
            View Active Help Posts
          </button>
        {!loggedIn ? (<>
          <button onClick={handleLogin} className="navbar-button">
            Log In
          </button>
           <button onClick={handleSignup} className="navbar-button">
           Sign Up
         </button>
         </>
        ) : (
            <>
          <button onClick={handleAddHelp} className="navbar-button">
            Ask for Help
          </button>
          <button onClick={handleViewUserHelp} className="navbar-button">
            View Your Help Requests
          </button>
          <button onClick={handleMyOffers} className="navbar-button">
            My Help Offers
          </button>
          <button onClick={handleLogout} className="navbar-button">
            Log Out
          </button>

          <span className="welcome-text">Logged in as: {localStorage.getItem("user_email").split("@")[0]}</span>    
          </>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
