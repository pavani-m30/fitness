import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Expenses.css';

function Expenses({ onLogout, user }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [upiImportDate, setUpiImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyMode, setWeeklyMode] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [weekEndDate, setWeekEndDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load expenses');
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

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/expenses', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Expense added successfully!');
      setFormData({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setShowForm(false);

      // Refresh expenses list
      fetchExpenses();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Expense deleted successfully!');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleImportUPI = async () => {
    setError('');
    setSuccess('');
    setImporting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Build query based on mode
      let url = 'http://localhost:5000/api/upi-transactions?';
      if (weeklyMode) {
        url += `startDate=${weekStartDate}&endDate=${weekEndDate}`;
      } else {
        url += `date=${upiImportDate}`;
      }

      // Fetch UPI transactions
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const transactions = response.data || [];
      if (!Array.isArray(transactions) || transactions.length === 0) {
        const period = weeklyMode ? `${weekStartDate} to ${weekEndDate}` : upiImportDate;
        setError(`No UPI transactions available for ${period}`);
        setImporting(false);
        return;
      }

      // Import each transaction
      const results = await Promise.allSettled(
        transactions.map((tx) =>
          axios.post(
            'http://localhost:5000/expenses',
            {
              amount: parseFloat(tx.amount),
              category: tx.category || 'Other',
              date: tx.date,
              description: `${tx.merchant || 'UPI'} - ${tx.note || 'Imported transaction'}`,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      const failed = results.filter((r) => r.status === 'rejected').length;
      const successful = results.filter((r) => r.status === 'fulfilled').length;

      if (successful > 0) {
        const period = weeklyMode ? `weekly (${weekStartDate} to ${weekEndDate})` : 'daily';
        setSuccess(`Imported ${successful} ${period} transactions${failed > 0 ? ` (${failed} failed)` : ''}`);
        fetchExpenses();
      } else {
        setError('Failed to import UPI transactions');
      }

      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err) {
      console.error('UPI import error:', err);
      setError(err.response?.data?.error || 'Failed to import UPI transactions');
    } finally {
      setImporting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Navbar user={user} onLogout={onLogout} />

        <div className="expenses-container">
          <div className="expenses-header">
            <div>
              <h1>Expenses</h1>
              <p>Track and manage your expenses</p>
            </div>
            <div className="expense-actions">
              <button
                onClick={() => setShowForm(!showForm)}
                className="add-btn"
              >
                {showForm ? '✕ Cancel' : '+ Add Expense'}
              </button>
              <button
                onClick={() => setWeeklyMode(!weeklyMode)}
                className={`mode-toggle ${weeklyMode ? 'active' : ''}`}
                title="Toggle between daily and weekly import"
              >
                {weeklyMode ? '📅 Weekly' : '📆 Daily'}
              </button>
              <div className="upi-import-group">
                {weeklyMode ? (
                  <>
                    <input
                      type="date"
                      value={weekStartDate}
                      onChange={(e) => setWeekStartDate(e.target.value)}
                      className="upi-date-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={weekEndDate}
                      onChange={(e) => setWeekEndDate(e.target.value)}
                      className="upi-date-input"
                    />
                  </>
                ) : (
                  <input
                    type="date"
                    value={upiImportDate}
                    onChange={(e) => setUpiImportDate(e.target.value)}
                    className="upi-date-input"
                  />
                )}
                <button
                  onClick={handleImportUPI}
                  className="import-btn"
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import UPI'}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {showForm && (
            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add a note..."
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Add Expense
              </button>
            </form>
          )}

          <div className="expenses-summary">
            <h3>Total Expenses: ₹{totalExpenses.toFixed(2)}</h3>
          </div>

          {loading ? (
            <p>Loading expenses...</p>
          ) : expenses.length > 0 ? (
            <div className="expenses-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-details">
                    <div className="expense-category">{expense.category}</div>
                    <div className="expense-info">
                      <p className="expense-description">{expense.description || 'No description'}</p>
                      <p className="expense-date">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="expense-amount">
                    <p className="amount">₹{parseFloat(expense.amount).toFixed(2)}</p>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="delete-btn"
                      title="Delete expense"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No expenses yet. Add your first expense!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Expenses;
