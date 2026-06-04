const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
const dbPath = path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  } else {
    console.log('✓ Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        mobile TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('✓ Users table ready');
    });

    // Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating expenses table:', err);
      else console.log('✓ Expenses table ready');
    });

    // Budget table
    db.run(`
      CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating budget table:', err);
      else console.log('✓ Budget table ready');
    });

    // Goals table
    db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target REAL NOT NULL,
        saved REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating goals table:', err);
      else console.log('✓ Goals table ready');
    });

    // Accounts table (for multiple mobile numbers/bank accounts)
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        mobile TEXT NOT NULL,
        bank_name TEXT,
        account_label TEXT,
        is_primary BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, mobile)
      )
    `, (err) => {
      if (err) console.error('Error creating accounts table:', err);
      else console.log('✓ Accounts table ready');
    });

    // Notifications table (for missed day alerts)
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        notification_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating notifications table:', err);
      else console.log('✓ Notifications table ready');
    });
  });
}

// Ensure legacy DB has `mobile` column in users table
function ensureMobileColumn() {
  db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('❌ PRAGMA error:', err);
      return;
    }
    const hasMobile = rows && rows.some((r) => r.name === 'mobile');
    if (!hasMobile) {
      db.run('ALTER TABLE users ADD COLUMN mobile TEXT', (err) => {
        if (err) console.error('❌ Error adding mobile column:', err);
        else console.log('✓ Added mobile column to users table');
      });
    } else {
      console.log('✓ Mobile column already exists');
    }
  });
}

// call after initialization
ensureMobileColumn();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTH ROUTES ====================

// Signup route
app.post('/signup', (req, res) => {
  const { username, password, mobile } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  bcryptjs.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    db.run(
      'INSERT INTO users (username, password, mobile) VALUES (?, ?, ?)',
      [username, hashedPassword, mobile || null],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }

        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      }
    );
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password, mobile } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    bcryptjs.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // If mobile provided at login, save/update it for the user
      if (mobile) {
        db.run('UPDATE users SET mobile = ? WHERE id = ?', [mobile, user.id], (err) => {
          if (err) console.error('Error updating mobile:', err);
        });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({ token, userId: user.id, username: user.username, mobile: mobile || user.mobile });
    });
  });
});

// ==================== DASHBOARD ROUTES ====================

app.get('/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
    `SELECT 
      SUM(amount) as total_expenses,
      COUNT(*) as expense_count
    FROM expenses WHERE user_id = ?`,
    [userId],
    (err, expenseData) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching expenses' });
      }

      db.get('SELECT amount FROM budget WHERE user_id = ?', [userId], (err, budgetData) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching budget' });
        }

        db.all(
          `SELECT SUM(amount) as total, category 
           FROM expenses WHERE user_id = ? 
           GROUP BY category`,
          [userId],
          (err, categoryData) => {
            if (err) {
              return res.status(500).json({ error: 'Error fetching category data' });
            }

            db.all(
              `SELECT amount, DATE(date) as expense_date
               FROM expenses WHERE user_id = ?
               ORDER BY date DESC
               LIMIT 30`,
              [userId],
              (err, monthlyData) => {
                if (err) {
                  return res.status(500).json({ error: 'Error fetching monthly data' });
                }

                // Monthly comparison for last 6 months
                db.all(
                  `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
                   FROM expenses WHERE user_id = ?
                   GROUP BY month
                   ORDER BY month DESC
                   LIMIT 6`,
                  [userId],
                  (err, monthlyComparison) => {
                    if (err) {
                      return res.status(500).json({ error: 'Error fetching monthly comparison' });
                    }

                    // reverse to chronological order
                    const monthlyComp = (monthlyComparison || []).slice().reverse();

                    res.json({
                      totalExpenses: expenseData?.total_expenses || 0,
                      expenseCount: expenseData?.expense_count || 0,
                      budget: budgetData?.amount || 0,
                      categoryBreakdown: categoryData || [],
                      recentExpenses: monthlyData || [],
                      monthlyComparison: monthlyComp,
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
});

// ==================== EXPENSE ROUTES ====================

// Get all expenses
app.get('/expenses', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC',
    [userId],
    (err, expenses) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching expenses' });
      }
      res.json(expenses || []);
    }
  );
});

// Add expense
app.post('/expenses', authenticateToken, (req, res) => {
  const { amount, category, date, description } = req.body;
  const userId = req.user.userId;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required' });
  }

  db.run(
    'INSERT INTO expenses (user_id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
    [userId, amount, category, date, description || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding expense' });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Expense added successfully',
      });
    }
  );
});

// Delete expense
app.delete('/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run(
    'DELETE FROM expenses WHERE id = ? AND user_id = ?',
    [id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting expense' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    }
  );
});

// ==================== BUDGET ROUTES ====================

// Get budget
app.get('/budget', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get('SELECT * FROM budget WHERE user_id = ?', [userId], (err, budget) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching budget' });
    }

    // Get total expenses
    db.get(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?',
      [userId],
      (err, expense) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching expenses' });
        }

        const budgetAmount = budget?.amount || 0;
        const totalExpenses = expense?.total || 0;
        const remaining = budgetAmount - totalExpenses;

        res.json({
          id: budget?.id,
          amount: budgetAmount,
          spent: totalExpenses,
          remaining: remaining > 0 ? remaining : 0,
          percentage: budgetAmount > 0 ? Math.round((totalExpenses / budgetAmount) * 100) : 0,
        });
      }
    );
  });
});

// Set/Update budget
app.post('/budget', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const userId = req.user.userId;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  db.run(
    `INSERT INTO budget (user_id, amount) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET amount = ?, updated_at = CURRENT_TIMESTAMP`,
    [userId, amount, amount],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error setting budget' });
      }

      res.json({ message: 'Budget updated successfully' });
    }
  );
});

// ==================== GOALS ROUTES ====================

// Get all goals
app.get('/goals', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, goals) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching goals' });
    }

    res.json(
      goals?.map((goal) => ({
        ...goal,
        progress: goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0,
      })) || []
    );
  });
});

// Create goal
app.post('/goals', authenticateToken, (req, res) => {
  const { name, target, saved } = req.body;
  const userId = req.user.userId;

  if (!name || !target) {
    return res.status(400).json({ error: 'Name and target are required' });
  }

  db.run(
    'INSERT INTO goals (user_id, name, target, saved) VALUES (?, ?, ?, ?)',
    [userId, name, target, saved || 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating goal' });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Goal created successfully',
      });
    }
  );
});

// Update goal
app.put('/goals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, target, saved } = req.body;
  const userId = req.user.userId;

  db.run(
    'UPDATE goals SET name = ?, target = ?, saved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [name, target, saved, id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating goal' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ message: 'Goal updated successfully' });
    }
  );
});

// Delete goal
app.delete('/goals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting goal' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  });
});

// ==================== EXTRA API ROUTES (Prediction & UPI) ====================

// AI-like expense prediction: compare current month to average of previous months
app.get('/api/prediction', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
     FROM expenses WHERE user_id = ?
     GROUP BY month
     ORDER BY month DESC
     LIMIT 6`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error calculating prediction' });
      }

      const months = rows || [];
      if (months.length === 0) {
        return res.json({ predictedExpense: 0, message: 'No expense data yet' });
      }

      // Current month (most recent)
      const currentMonth = months[0]?.total || 0;
      
      // Average of previous months
      const previousMonths = months.slice(1);
      const avgPrevious = previousMonths.length > 0
        ? previousMonths.reduce((s, r) => s + (r.total || 0), 0) / previousMonths.length
        : currentMonth;

      const predicted = (currentMonth + avgPrevious) / 2;
      const percentChange = avgPrevious > 0 ? ((currentMonth - avgPrevious) / avgPrevious) * 100 : 0;

      let message = 'Your spending looks stable';
      if (percentChange > 20) {
        message = `Spending up ${Math.round(percentChange)}% from average`;
      } else if (percentChange < -20) {
        message = `Spending down ${Math.round(Math.abs(percentChange))}% from average`;
      }

      res.json({ predictedExpense: parseFloat(predicted.toFixed(2)), message });
    }
  );
});

// Check if user updated expenses today
app.get('/api/updated-today', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND DATE(date) = ?`,
    [userId, today],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking updates' });
      }
      res.json({ updatedToday: (row?.count || 0) > 0 });
    }
  );
});

// Simulated UPI transactions import with date filtering (single date or date range)
app.get('/api/upi-transactions', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { date, startDate, endDate } = req.query;
  
  // Determine date range
  let start, end;
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else if (date) {
    start = new Date(date);
    end = new Date(date);
  } else {
    const today = new Date();
    start = today;
    end = today;
  }

  db.get('SELECT mobile FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error fetching user mobile' });

    // Generate dummy UPI data pool across multiple dates
    const allDummy = [
      {
        id: 1,
        amount: 520,
        category: 'Food',
        merchant: 'Cafe Blue',
        upi_id: 'cafeb@oksbi',
        note: 'Lunch with team',
        status: 'SUCCESS',
      },
      {
        id: 2,
        amount: 1240,
        category: 'Shopping',
        merchant: 'StyleMart',
        upi_id: 'stylemart@upi',
        note: 'New jacket',
        status: 'SUCCESS',
      },
      {
        id: 3,
        amount: 310,
        category: 'Transport',
        merchant: 'MetroRide',
        upi_id: 'metroride@okhdfc',
        note: 'Daily commute',
        status: 'SUCCESS',
      },
      {
        id: 4,
        amount: 450,
        category: 'Entertainment',
        merchant: 'Cinema Hall',
        upi_id: 'cinema@hdfc',
        note: 'Movie tickets',
        status: 'SUCCESS',
      },
      {
        id: 5,
        amount: 280,
        category: 'Health',
        merchant: 'Pharmacy Plus',
        upi_id: 'pharmacy@axis',
        note: 'Medicine',
        status: 'SUCCESS',
      },
    ];

    // Generate transactions across the date range
    const dummy = [];
    const now = new Date(start);
    
    while (now <= end) {
      const dateStr = now.toISOString().split('T')[0];
      const txCount = (now.getDate() % 3) + 1; // 1-3 transactions per day
      
      for (let i = 0; i < txCount && i < allDummy.length; i++) {
        const item = allDummy[i];
        dummy.push({
          ...item,
          date: dateStr,
          transaction_id: 'UPI' + dateStr.replace(/-/g, '') + String(i).padStart(3, '0'),
        });
      }
      
      now.setDate(now.getDate() + 1);
    }

    res.json(dummy);
  });
});

// ==================== ACCOUNTS MANAGEMENT (Multiple Bank Accounts) ====================

// Get all accounts for user
app.get('/accounts', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all('SELECT * FROM accounts WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC', [userId], (err, accounts) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching accounts' });
    }
    res.json(accounts || []);
  });
});

// Add a new account
app.post('/accounts', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { mobile, bank_name, account_label } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  // Check if mobile already exists for this user
  db.get('SELECT id FROM accounts WHERE user_id = ? AND mobile = ?', [userId, mobile], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (existing) {
      return res.status(400).json({ error: 'This mobile number is already registered' });
    }

    // Mobile doesn't exist, proceed with insert
    db.run(
      'INSERT INTO accounts (user_id, mobile, bank_name, account_label, is_primary) VALUES (?, ?, ?, ?, ?)',
      [userId, mobile, bank_name || null, account_label || null, 0],
      function (err) {
        if (err) {
          console.error('Error inserting account:', err);
          return res.status(500).json({ error: 'Failed to add account: ' + err.message });
        }

        res.status(201).json({
          id: this.lastID,
          message: 'Account added successfully',
          mobile: mobile,
          bank_name: bank_name,
          account_label: account_label,
        });
      }
    );
  });
});

// Delete an account
app.delete('/accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting account' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});

// ==================== NOTIFICATIONS ====================

// Get unread notifications
app.get('/notifications', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching notifications' });
      }
      const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
      res.json({ notifications: notifications || [], unreadCount });
    }
  );
});

// Create/check missed day notification
app.post('/notifications/check-missed-day', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  // Check if expense logged today
  db.get(
    `SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND DATE(date) = ?`,
    [userId, today],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking expenses' });
      }

      const hasEntry = (row?.count || 0) > 0;

      // If no entry, create notification
      if (!hasEntry) {
        db.get(
          `SELECT id FROM notifications WHERE user_id = ? AND notification_date = ? AND type = ?`,
          [userId, today, 'MISSED_DAY'],
          (err, existingNotif) => {
            if (err) {
              console.error('Error checking existing notification:', err);
              return res.json({ hasMissedDay: true, message: 'Already notified' });
            }

            if (!existingNotif) {
              // Create new notification for today
              db.run(
                `INSERT INTO notifications (user_id, type, message, notification_date, is_read) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, 'MISSED_DAY', '📝 You forgot to log your expenses today! Add them now.', today, 0],
                (insertErr) => {
                  if (insertErr) {
                    console.error('Error creating notification:', insertErr);
                  }
                  // Always respond with success
                  res.json({ hasMissedDay: true, message: 'Notification created' });
                }
              );
            } else {
              // Already notified today
              res.json({ hasMissedDay: true, message: 'Already notified' });
            }
          }
        );
      } else {
        // User has entry today
        res.json({ hasMissedDay: false, message: 'Entry exists' });
      }
    }
  );
});

// Mark notification as read
app.put('/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating notification' });
      }
      res.json({ message: 'Notification marked as read' });
    }
  );
});

// ==================== DEBUG/TEST ENDPOINTS ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Create test notification (for debugging)
app.post('/test/create-notification', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  db.run(
    `INSERT INTO notifications (user_id, type, message, notification_date, is_read) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, 'TEST', '🧪 Test Notification - Everything is working!', today, 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create test notification: ' + err.message });
      }
      res.json({ message: 'Test notification created', id: this.lastID });
    }
  );
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('✓ All routes loaded successfully');
  console.log('✓ Database initialized');
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
