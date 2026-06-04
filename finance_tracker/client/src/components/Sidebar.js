import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>💰 Finance</h2>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
            📊 Dashboard
          </Link>
          <Link to="/expenses" className="nav-link" onClick={() => setIsOpen(false)}>
            💳 Expenses
          </Link>
          <Link to="/budget" className="nav-link" onClick={() => setIsOpen(false)}>
            📈 Budget
          </Link>
          <Link to="/goals" className="nav-link" onClick={() => setIsOpen(false)}>
            🎯 Goals
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default Sidebar;
