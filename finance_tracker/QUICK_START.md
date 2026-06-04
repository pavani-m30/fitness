# Finance Tracker - Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Open Two Terminals

#### Terminal 1 - Backend Server
```bash
cd c:\Users\m.pavani\Desktop\finance_tracker\server
npm install
npm start
```

**Expected output:**
```
Server running on http://localhost:5000
Connected to SQLite database
```

#### Terminal 2 - Frontend App
```bash
cd c:\Users\m.pavani\Desktop\finance_tracker\client
npm install
npm start
```

**Expected output:**
```
React app running on http://localhost:3000
Opening http://localhost:3000 in the browser...
```

## ✅ Verification Checklist

- [ ] Backend server running on http://localhost:5000
- [ ] React app opened in browser on http://localhost:3000
- [ ] Finance Tracker login page is visible
- [ ] Database file `server/finance.db` was created

## 🧪 Test Workflow

1. **Sign Up**
   - Click "Sign up here" link
   - Create account with username and password
   - Get redirected to Dashboard

2. **Add Expense**
   - Go to Expenses page
   - Click "+ Add Expense"
   - Fill in amount, category, date
   - Click "Add Expense"
   - Expense appears in list

3. **Set Budget**
   - Go to Budget page
   - Click "✏️ Edit Budget"
   - Enter a monthly budget amount
   - Click "Save Budget"
   - See progress bar update

4. **Create Goal**
   - Go to Goals page
   - Click "+ New Goal"
   - Enter goal name and target amount
   - Click "Create Goal"
   - Use "+ ₹100" buttons to add savings

5. **View Dashboard**
   - Go to Dashboard
   - See charts with expenses breakdown
   - View total spending and budget summary

## 🔧 If Something Goes Wrong

### Port 5000 in use?
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Port 3000 in use?
```bash
# Same steps as above, replace 5000 with 3000
```

### Database issues?
```bash
# Delete the database (it will be recreated)
rm server/finance.db
# Restart the server
```

### npm install fails?
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

## 📂 Files Created

**23 Frontend Files:**
- 1 public HTML file
- 6 page components
- 3 UI components  
- 10 CSS stylesheets
- 2 main app files

**2 Backend Files:**
- 1 server with all routes
- 1 package.json

**Database:**
- 4 tables (users, expenses, budget, goals)
- Auto-created on first run

## 🎯 Features Ready to Use

✅ Authentication (Signup/Login with JWT)
✅ Dashboard with charts
✅ Expense tracking (Add/Delete)
✅ Budget management
✅ Savings goals tracking
✅ Dark theme UI
✅ Responsive design
✅ All validations & error handling

## 💡 Next Steps

Once running, try:
1. Create multiple accounts
2. Add expenses across different categories
3. Set different budgets
4. Create multiple goals
5. Watch the charts update in real-time
6. Test responsive design (resize browser)

## 📞 Support

All code is fully commented. Check the files for detailed explanations.

---

**Everything is complete and ready to run!** 🎉
