import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Navbar.css';

function Navbar({ user, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAccounts, setShowAccounts] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ mobile: '', bank_name: '', account_label: '' });

  useEffect(() => {
    fetchNotifications();
    fetchAccounts();
    // Check for missed day and create notification if needed
    checkMissedDayAndRefresh();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const checkMissedDayAndRefresh = async () => {
    try {
      const token = localStorage.getItem('token');
      // First check for missed day which will create notification if needed
      await axios.post('http://localhost:5000/notifications/check-missed-day', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Then fetch latest notifications
      setTimeout(() => fetchNotifications(), 500);
    } catch (err) {
      console.error('Error checking missed day:', err);
      // Still try to fetch notifications even if check fails
      fetchNotifications();
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.mobile) {
      alert('Please enter a mobile number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/accounts', newAccount, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Success
      alert('Account added successfully!');
      setNewAccount({ mobile: '', bank_name: '', account_label: '' });
      fetchAccounts();
    } catch (err) {
      console.error('Add account error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error adding account. Make sure backend is running on port 5000.';
      alert(errorMsg);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Delete this account?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts();
    } catch (err) {
      alert('Error deleting account');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">💰 Finance Tracker</h1>
        <div className="navbar-right">
          <span className="user-greeting">Hello, {user}! 👋</span>
          
          {/* Accounts Button */}
          <div className="navbar-icon-group">
            <button
              className="navbar-icon-btn"
              onClick={() => setShowAccounts(!showAccounts)}
              title="Manage accounts"
            >
              🏦 Accounts
            </button>
            {showAccounts && (
              <div className="dropdown-menu accounts-dropdown">
                <h3>Bank Accounts</h3>
                <div className="accounts-list">
                  {accounts.length === 0 ? (
                    <p className="empty-message">No accounts added yet</p>
                  ) : (
                    accounts.map((acc) => (
                      <div key={acc.id} className="account-item">
                        <div className="account-info">
                          <p className="account-label">{acc.account_label || 'Account'}</p>
                          <p className="account-details">{acc.bank_name || 'Bank'} • {acc.mobile}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="account-delete-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddAccount} className="add-account-form">
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={newAccount.mobile}
                    onChange={(e) => setNewAccount({ ...newAccount, mobile: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bank name (HDFC, ICICI...)"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Account label"
                    value={newAccount.account_label}
                    onChange={(e) => setNewAccount({ ...newAccount, account_label: e.target.value })}
                  />
                  <button type="submit" className="add-account-btn">Add Account</button>
                </form>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="navbar-icon-group">
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="dropdown-menu notifications-dropdown">
                <h3>Notifications</h3>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="empty-message">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                        <p className="notification-message">{notif.message}</p>
                        <p className="notification-date">
                          {notif.notification_date || new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
