import React from 'react';
import '../styles/Card.css';

function Card({ icon, title, amount, subtitle }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <p className="card-title">{title}</p>
        <p className="card-amount">{amount}</p>
        <p className="card-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

export default Card;
