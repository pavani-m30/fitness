import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard({ onLogout, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedToday, setUpdatedToday] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkMissedDay();
  }, []);

  const checkMissedDay = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/notifications/check-missed-day', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error checking missed day:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dashRes, predRes, updateRes] = await Promise.all([
        axios.get('http://localhost:5000/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/prediction', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        axios.get('http://localhost:5000/api/updated-today', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);

      setDashboardData(dashRes.data);
      if (predRes && predRes.data) {
        setPrediction(predRes.data);
      }
      if (updateRes && updateRes.data) {
        setUpdatedToday(updateRes.data.updatedToday);
      }
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-layout">
        <Sidebar onLogout={onLogout} />
        <div className="main-content">
          <Navbar user={user} onLogout={onLogout} />
          <div className="dashboard-header">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-layout">
        <Sidebar onLogout={onLogout} />
        <div className="main-content">
          <Navbar user={user} onLogout={onLogout} />
          <div className="dashboard-header">
            <p className="error">{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabels = dashboardData?.categoryBreakdown?.map((cat) => cat.category) || [];
  const categoryAmounts = dashboardData?.categoryBreakdown?.map((cat) => cat.total) || [];

  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Expenses by Category',
        data: categoryAmounts,
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
        borderColor: '#1e1e1e',
        borderWidth: 2,
      },
    ],
  };

  // Prepare monthly data
  const monthlyExpenses = {};
  dashboardData?.recentExpenses?.forEach((expense) => {
    const date = expense.expense_date;
    monthlyExpenses[date] = (monthlyExpenses[date] || 0) + expense.amount;
  });

  const sortedDates = Object.keys(monthlyExpenses).sort();
  const monthlyChartData = {
    labels: sortedDates.slice(-7), // Last 7 days
    datasets: [
      {
        label: 'Daily Expenses',
        data: sortedDates.slice(-7).map((date) => monthlyExpenses[date]),
        borderColor: '#45B7D1',
        backgroundColor: 'rgba(69, 183, 209, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Navbar user={user} onLogout={onLogout} />

        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Welcome back, {user}! Here's your financial overview.</p>
          </div>

          {!updatedToday && (
            <div className="alert-notification">
              <span>📝</span>
              <div>
                <p className="alert-title">No expenses logged today</p>
                <p className="alert-message">Remember to track your daily spending!</p>
              </div>
            </div>
          )}

          <div className="stats-grid">
            <Card
              icon="💰"
              title="Total Expenses"
              amount={`₹${(dashboardData?.totalExpenses || 0).toFixed(2)}`}
              subtitle={`${dashboardData?.expenseCount || 0} transactions`}
            />
            <Card
              icon="💳"
              title="Monthly Budget"
              amount={`₹${(dashboardData?.budget || 0).toFixed(2)}`}
              subtitle="Allocated for this month"
            />
            <Card
              icon="�"
              title="Prediction"
              amount={`₹${(prediction?.predictedExpense || 0).toFixed(2)}`}
              subtitle={prediction?.message || 'Prediction unavailable'}
            />
            <Card
              icon="�📊"
              title="Remaining"
              amount={`₹${Math.max(0, (dashboardData?.budget || 0) - (dashboardData?.totalExpenses || 0)).toFixed(2)}`}
              subtitle="Budget left"
            />
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h2>Expenses by Category (Pie)</h2>
              {categoryLabels.length > 0 ? (
                <Pie
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: true,
                        labels: { color: '#fff' },
                      },
                    },
                  }}
                />
              ) : (
                <p className="no-data">No expense data available</p>
              )}
            </div>

            <div className="chart-card">
              <h2>Daily Expenses Trend (Line)</h2>
              {sortedDates.length > 0 ? (
                <Line
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: true,
                        labels: { color: '#fff' },
                      },
                    },
                    scales: {
                      y: {
                        ticks: { color: '#aaa' },
                        grid: { color: '#333' },
                      },
                      x: {
                        ticks: { color: '#aaa' },
                        grid: { color: '#333' },
                      },
                    },
                  }}
                />
              ) : (
                <p className="no-data">No expense data available</p>
              )}
            </div>

            <div className="chart-card">
              <h2>Monthly Comparison (Last 6 months)</h2>
              {dashboardData?.monthlyComparison?.length > 0 ? (
                <Bar
                  data={{
                    labels: dashboardData.monthlyComparison.map((m) => m.month),
                    datasets: [
                      {
                        label: 'Monthly Total',
                        data: dashboardData.monthlyComparison.map((m) => m.total),
                        backgroundColor: '#45B7D1',
                        borderColor: '#1e1e1e',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
                      x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
                    },
                  }}
                />
              ) : (
                <p className="no-data">No monthly comparison data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
