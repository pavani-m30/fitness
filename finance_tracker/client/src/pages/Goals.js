import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Goals.css';

function Goals({ onLogout, user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    saved: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.target) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.target <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        // Update goal
        await axios.put(
          `http://localhost:5000/goals/${editingId}`,
          {
            name: formData.name,
            target: parseFloat(formData.target),
            saved: parseFloat(formData.saved) || 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Goal updated successfully!');
        setEditingId(null);
      } else {
        // Create new goal
        await axios.post(
          'http://localhost:5000/goals',
          {
            name: formData.name,
            target: parseFloat(formData.target),
            saved: parseFloat(formData.saved) || 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Goal created successfully!');
      }

      setFormData({ name: '', target: '', saved: '' });
      setShowForm(false);
      fetchGoals();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save goal');
    }
  };

  const handleEditGoal = (goal) => {
    setFormData({
      name: goal.name,
      target: goal.target.toString(),
      saved: goal.saved.toString(),
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Goal deleted successfully!');
      fetchGoals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete goal');
    }
  };

  const handleUpdateSaved = async (goal, newSaved) => {
    if (newSaved < 0 || newSaved > goal.target) {
      setError('Saved amount must be between 0 and target');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/goals/${goal.id}`,
        {
          name: goal.name,
          target: goal.target,
          saved: newSaved,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Goal updated successfully!');
      fetchGoals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update goal');
    }
  };

  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Navbar user={user} onLogout={onLogout} />

        <div className="goals-container">
          <div className="goals-header">
            <div>
              <h1>Savings Goals</h1>
              <p>Set and track your financial goals</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: '', target: '', saved: '' });
              }}
              className="add-btn"
            >
              {showForm ? '✕ Cancel' : '+ New Goal'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {showForm && (
            <form onSubmit={handleAddGoal} className="goal-form">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Vacation, Car, House"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount Saved (₹)</label>
                  <input
                    type="number"
                    name="saved"
                    value={formData.saved}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                {editingId ? 'Update Goal' : 'Create Goal'}
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading goals...</p>
          ) : goals.length > 0 ? (
            <div className="goals-list">
              {goals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <h3>{goal.name}</h3>
                    <div className="goal-actions">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="edit-btn"
                        title="Edit goal"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="delete-btn"
                        title="Delete goal"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${goal.progress}%` }}
                      >
                        <span className="progress-text">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="goal-details">
                    <div className="detail-item">
                      <span>Saved</span>
                      <span className="amount">₹{goal.saved.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Target</span>
                      <span className="amount">₹{goal.target.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Remaining</span>
                      <span className="amount remaining">
                        ₹{(goal.target - goal.saved).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="goal-actions-bottom">
                    <button
                      onClick={() => handleUpdateSaved(goal, goal.saved + 100)}
                      className="add-amount-btn"
                    >
                      + ₹100
                    </button>
                    <button
                      onClick={() => handleUpdateSaved(goal, goal.saved + 500)}
                      className="add-amount-btn"
                    >
                      + ₹500
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No goals yet. Create your first savings goal!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
