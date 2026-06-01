import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="error-code">403</div>
        <h1 className="error-title">Access Denied</h1>
        <p className="error-message">
          You don't have permission to access this page. Please sign in with appropriate credentials.
        </p>
        <button 
          className="signin-button"
          onClick={() => navigate('/auth/signin')}
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;