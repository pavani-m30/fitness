# Finance Tracker - Quick Fix Guide

## Problem: 404 Errors on New Endpoints

**Error messages:**
- `POST http://localhost:5000/accounts 404 (Not Found)`
- `GET http://localhost:5000/notifications 404 (Not Found)`
- `GET http://localhost:5000/api/updated-today 404 (Not Found)`

**Root Cause:** Backend server hasn't been restarted after routes were added.

---

## Solution: Restart Backend Server

### Step 1: Stop Backend Server
If running in terminal:
```bash
# Press Ctrl+C to stop the server
^C
```

### Step 2: Start Backend Server Again
```bash
cd server
npm start
```

**Expected Output:**
```
✓ Connected to SQLite database at: /path/to/finance.db
✓ Users table ready
✓ Expenses table ready
✓ Budget table ready
✓ Goals table ready
✓ Accounts table ready
✓ Notifications table ready
✓ Added mobile column to users table
✓ Mobile column already exists

========================================
✓ Server running on http://localhost:5000
✓ All routes loaded successfully
✓ Database initialized
========================================
```

**If you see these messages, backend is working! ✅**

---

## Step 3: Test Backend is Running

Open this URL in browser or curl:
```
http://localhost:5000/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

---

## Step 4: Create Test Notification

1. Login to app (open http://localhost:3000)
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste this code:
```javascript
fetch('http://localhost:5000/test/create-notification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Notification created:', data))
.catch(e => console.error('Error:', e));
```

5. Press Enter
6. Should see in console: `Notification created: {message: "Test notification created", id: X}`

---

## Step 5: Verify Notification Appears

1. Refresh the page (F5)
2. Look at navbar - should see 🔔 bell with red badge **"1"**
3. Click bell - should see notification dropdown with test notification

---

## If Still Getting 404 Errors

**Checklist:**
- [ ] Backend server is running (check Step 2 output)
- [ ] Terminal shows "✓ Server running on http://localhost:5000"
- [ ] Terminal shows all 6 table "ready" messages
- [ ] You restarted server AFTER code changes
- [ ] Frontend is also running on port 3000

**If all checked and still failing:**

1. **Kill all previous processes:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

2. **Delete database and restart:**
```bash
cd server
rm finance.db  # or del finance.db on Windows
npm start      # Will recreate database
```

3. **Reinstall dependencies:**
```bash
cd server
rm node_modules
npm install
npm start
```

---

## Notification Creation Now Automatic

When you:
- ✅ Login to app → Checks for missed day
- ✅ Visit Dashboard → Creates notification if no entry today
- ✅ Visit Navbar → Creates notification if no entry today

**No manual creation needed!** Just make sure:
1. You have NO expenses logged for today
2. Backend is running
3. Page loads/refreshes

---

## Expected Behavior After Restart

| Action | Result |
|--------|--------|
| Login to app | ✅ Notification created (if no entry) |
| Check for missed day | ✅ Notification auto-created |
| View navbar | ✅ Bell badge shows count |
| Click notification | ✅ Mark as read, badge decreases |
| Add account | ✅ "Account added successfully!" alert |
| Fetch accounts | ✅ Account list loads |

---

## Quick Restart Script

Save as `restart-backend.sh` (macOS/Linux) or `restart-backend.bat` (Windows):

**macOS/Linux:**
```bash
#!/bin/bash
cd server
npm start
```

**Windows:**
```batch
@echo off
cd server
npm start
```

---

## Still Need Help?

Check browser console (F12 → Console) for actual error messages and share them. The errors should now show more details:
- Specific database errors
- Authentication issues
- Network problems

Most common issues:
1. **"Backend not running"** → Run `npm start` in server folder
2. **"Port 5000 already in use"** → Kill process on that port
3. **"Database locked"** → Restart server
4. **"Cannot POST /accounts"** → Backend didn't restart, try again

