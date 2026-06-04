# 💰 Personal Finance Tracker

A full-stack web application for tracking personal finances, managing expenses, setting budgets, and tracking savings goals. Built with React, Node.js/Express, and SQLite with a modern dark theme UI.

## ✨ Features

### 🔐 Authentication
- User signup and login
- Password encryption with bcryptjs
- JWT-based authentication
- Secure token storage in localStorage
- Protected routes for authenticated users only

### 📊 Dashboard
- Total balance overview
- Monthly expenses tracking
- Category-wise expense breakdown (Bar Chart)
- Daily expenses trend (Line Chart)
- Real-time data visualization with Chart.js

### 💳 Expense Tracker
- Add, view, and delete expenses
- Categorize expenses (Food, Transport, Entertainment, Shopping, Utilities, Health, Other)
- Filter by date and category
- Auto-refresh after add/delete operations

### 📈 Budget Management
- Set monthly budget
- Track spending vs budget
- Visual progress bar showing budget utilization
- Alerts when approaching or exceeding budget limit
- Real-time percentage calculation

### 🎯 Savings Goals
- Create multiple savings goals
- Track progress (saved vs target amount)
- Quick add buttons (₹100, ₹500)
- Edit and delete goals
- Progress percentage display

### 🌙 Dark Theme UI
- Modern fintech-style dark interface
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Custom scrollbar styling
- Intuitive navigation sidebar

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Lightweight database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin requests support

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React-ChartJS-2** - React wrapper for Chart.js
- **CSS3** - Styling with dark theme

## 📁 Project Structure

```
finance-app/
├── server/                   # Backend
│   ├── package.json
│   ├── index.js             # Main server file
│   └── finance.db           # SQLite database (auto-created)
│
├── client/                   # Frontend
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── Dashboard.js
│       │   ├── Expenses.js
│       │   ├── Budget.js
│       │   └── Goals.js
│       ├── components/
│       │   ├── Sidebar.js
│       │   ├── Navbar.js
│       │   └── Card.js
│       └── styles/
│           ├── index.css
│           ├── App.css
│           ├── Auth.css
│           ├── Sidebar.css
│           ├── Navbar.css
│           ├── Card.css
│           ├── Dashboard.css
│           ├── Expenses.css
│           ├── Budget.css
│           └── Goals.css
│
└── README.md
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Budget Table
```sql
CREATE TABLE budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Goals Table
```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target REAL NOT NULL,
  saved REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React app:**
   ```bash
   npm start
   ```
   
   App will open on `http://localhost:3000`

## 🔑 API Routes

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Login user and get JWT token

### Dashboard
- `GET /dashboard` - Get dashboard data (totals, charts data)

### Expenses
- `GET /expenses` - Get all user expenses
- `POST /expenses` - Add new expense
- `DELETE /expenses/:id` - Delete an expense

### Budget
- `GET /budget` - Get user budget and spending
- `POST /budget` - Set or update monthly budget

### Goals
- `GET /goals` - Get all user goals
- `POST /goals` - Create new goal
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal

## 🔐 Authentication Flow

1. User registers with username and password
2. Password is encrypted using bcryptjs
3. On login, credentials are verified
4. JWT token is generated with 7-day expiration
5. Token is stored in localStorage
6. Token is sent in Authorization header for protected routes
7. Backend verifies token before responding to requests

## 🎨 UI Features

### Dark Theme Colors
- Background: `#121212`
- Surfaces: `#1e1e1e`
- Borders: `#2a2a2a`
- Primary: `#45B7D1` (Cyan)
- Secondary: `#4ecdc4` (Teal)
- Success: `#68d682` (Green)
- Error: `#ff6b6b` (Red)

### Responsiveness
- **Desktop**: Full sidebar + main content layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Mobile sidebar drawer with overlay

### Components
- **Card**: Display summary statistics with icons
- **Sidebar**: Navigation with logout
- **Navbar**: Top bar with greeting
- **Charts**: Bar and Line charts for data visualization
- **Forms**: Input forms for adding expenses, setting budget, creating goals

## 🧪 Testing the App

### Test User (After Signup)
1. Create an account on the signup page
2. Username: `testuser` / Password: `password123`

### Test Flow
1. **Login** → Dashboard page
2. **Add Expenses** → View in Expenses page
3. **Set Budget** → View progress on Budget page
4. **Create Goals** → Track progress on Goals page
5. **View Charts** → Check Dashboard for visualizations

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Protected routes requiring valid token
- ✅ CORS enabled for frontend-backend communication
- ✅ User isolation (each user sees only their data)
- ✅ Secure token storage in localStorage

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "sqlite3": "^5.1.6",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Kill the process using port 5000
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# On Mac/Linux:
lsof -i :5000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

**Database errors:**
- Delete `finance.db` and restart server (it will auto-create)

### Frontend Issues

**Axios connection error:**
- Ensure backend server is running on port 5000
- Check if proxy is correctly set in `package.json`

**Charts not loading:**
- Install Chart.js: `npm install chart.js react-chartjs-2`

**Styling issues:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the development server

## 🚀 Deployment

### Backend Deployment (Heroku Example)
```bash
cd server
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret_key
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
cd client
npm install -g vercel
vercel
```

## 📝 Environment Variables

Create a `.env` file in the server directory (optional for production):
```
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5000
```

## 🎓 Learning Points

This project demonstrates:
- Full-stack web development
- User authentication with JWT
- Password hashing and security
- Database design and relationships
- RESTful API design
- React hooks (useState, useEffect)
- React Router for client-side navigation
- State management with localStorage
- Data visualization with Chart.js
- Responsive CSS design
- Error handling and validation

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📞 Support

For issues or questions, review the code comments or documentation within each file.

---

**Built with ❤️ for personal finance management**

Happy tracking! 💰
