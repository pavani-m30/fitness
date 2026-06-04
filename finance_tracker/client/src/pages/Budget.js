import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import '../styles/Budget.css';

function Budget({ onLogout, user }) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/budget', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudget(response.data);
      setBudgetAmount(response.data.amount.toString());
      setError('');
    } catch (err) {
      setError('Failed to load budget');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!budgetAmount || budgetAmount <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/budget',
        { amount: parseFloat(budgetAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Budget updated successfully!');
      setIsEditing(false);
      fetchBudget();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update budget');
    }
  };

  if (loading) {
    return (
      <div className="main-layout">
        <Sidebar onLogout={onLogout} />
        <div className="main-content">
          <Navbar user={user} onLogout={onLogout} />
          <div className="budget-container">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const percentage = budget?.percentage || 0;
  const spent = budget?.spent || 0;
  const total = budget?.amount || 0;
  const remaining = budget?.remaining || 0;

  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Navbar user={user} onLogout={onLogout} />

        <div className="budget-container">
          <div className="budget-header">
            <h1>Monthly Budget</h1>
            <p>Track your spending against your budget</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSetBudget} className="budget-form">
              <div className="form-group">
                <label>Set Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter budget amount"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Save Budget
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setBudgetAmount(budget.amount.toString());
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              ✏️ Edit Budget
            </button>
          )}

          <div className="stats-grid">
            <Card
              icon="💾"
              title="Total Budget"
              amount={`₹${total.toFixed(2)}`}
              subtitle="This month's budget"
            />
            <Card
              icon="📉"
              title="Spent"
              amount={`₹${spent.toFixed(2)}`}
              subtitle={`${percentage}% of budget`}
            />
            <Card
              icon="💚"
              title="Remaining"
              amount={`₹${remaining.toFixed(2)}`}
              subtitle="Left to spend"
            />
          </div>

          <div className="budget-chart">
            <h2>Budget Progress</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                  <span className="progress-text">{percentage}%</span>
                </div>
              </div>
              <div className="progress-info">
                <p>
                  You have spent <strong>₹{spent.toFixed(2)}</strong> out of{' '}
                  <strong>₹{total.toFixed(2)}</strong>
                </p>
                {remaining >= 0 ? (
                  <p className="positive">
                    You have <strong>₹{remaining.toFixed(2)}</strong> remaining
                  </p>
                ) : (
                  <p className="negative">
                    You have exceeded your budget by <strong>₹{Math.abs(remaining).toFixed(2)}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {percentage > 80 && percentage <= 100 && (
            <div className="warning-card">
              <p>⚠️ You're close to your budget limit! Only {100 - percentage}% left.</p>
            </div>
          )}

          {percentage > 100 && (
            <div className="danger-card">
              <p>🚨 You have exceeded your budget!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budget;
