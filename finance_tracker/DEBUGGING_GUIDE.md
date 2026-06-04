# Finance Tracker - Debugging & Testing Guide

## Issues Fixed

### 1. Account Adding Error
**Problem:** "Error adding account" message from localhost:3000

**Solution Applied:**
- ✅ Improved error handling in backend `/accounts` endpoint
- ✅ Better validation and duplicate check for mobile numbers
- ✅ Detailed error messages sent back to frontend
- ✅ Improved error display with backend port validation hint

**What Changed:**
```
Before: "Error adding account"
After: "Error adding account. Make sure backend is running on port 5000."
        OR "This mobile number is already registered"
        OR "Database error: [specific error]"
```

### 2. Notification Not Showing
**Problem:** No notifications visible even when no expenses logged

**Solution Applied:**
- ✅ Fixed notification creation logic (was sending response before DB write completed)
- ✅ Added await/timeout to ensure notification is created before fetching
- ✅ Added check in Dashboard to also trigger missed day check
- ✅ Improved notification fetch timing with 500ms delay

**What Changed:**
```
Before: Notification might be created after fetch completed
After: Check → Wait 500ms → Fetch (ensures notification exists)
```

---

## Testing Checklist

### Step 1: Start Backend
```bash
cd server
npm start
# Should show: "Server running on http://localhost:5000"
```

### Step 2: Start Frontend
```bash
cd client
npm start
# Should show: "Local: http://localhost:3000"
```

### Step 3: Test Account Adding
1. ✅ Login to app
2. ✅ Click "🏦 Accounts" in navbar
3. ✅ Enter mobile: `9876543210` (without +91 or spaces)
4. ✅ Enter Bank: `HDFC`
5. ✅ Enter Label: `Personal`
6. ✅ Click "Add Account"
7. ✅ Should see success alert: "Account added successfully!"
8. ✅ Account should appear in list below

**If Error Occurs:**
- Check browser console (F12 → Console tab)
- Error message will tell you exact issue:
  - "Backend not running" → Start server first
  - "Already registered" → Mobile was already added
  - "Database error" → Backend connectivity issue

### Step 4: Test Notifications
1. ✅ Make sure you have NO expenses for today
2. ✅ Refresh the page (or wait 2 seconds on Dashboard)
3. ✅ Look at navbar - should see 🔔 bell with red badge "1"
4. ✅ Click bell icon - should show notification:
   - "📝 You forgot to log your expenses today! Add them now."
5. ✅ Click the notification - badge should decrease to 0

**If Badge Doesn't Show:**
- Open browser console (F12)
- Check for errors logged
- Verify backend is running
- Try logging an expense for today first, then delete it, then refresh

### Step 5: Test Dashboard Alert
1. ✅ Go to Dashboard page
2. ✅ Should see orange alert box under header:
   - "📝 No expenses logged today"
   - "Remember to track your daily spending!"
3. ✅ If it doesn't appear, add an expense for today and refresh

---

## Debugging Commands

### Check if Backend is Running
```bash
curl http://localhost:5000/
# Should get connection or Hello response
```

### Check if Token is Valid
1. Open developer tools (F12)
2. Go to Application → Local Storage
3. Check if `token` exists and has a long string value
4. If missing, re-login

### View Database Notifications
```bash
# From server folder
sqlite3 finance.db
sqlite> SELECT * FROM notifications;
sqlite> SELECT * FROM accounts;
```

### Clear Old Data (if stuck)
```bash
# Delete notifications table and recreate
sqlite3 finance.db
sqlite> DELETE FROM notifications;
sqlite> DELETE FROM accounts;
sqlite> .quit
# Then restart backend
```

---

## Network Issues Checklist

❌ **Backend Port 5000 Not Available:**
```bash
# Find what's using port 5000
lsof -i :5000    # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process and restart
```

❌ **CORS Error (Red in console):**
- Backend should auto-handle this
- If still seeing it, backend might be down

❌ **Network ERR_FAILED:**
- Check backend is running
- Check firewall settings
- Try: `ping localhost:5000`

---

## Expected Console Output

### Backend
```
Connected to SQLite database
Added mobile column to users table
Server running on http://localhost:5000
```

### Frontend (after login)
```
Notification fetched successfully: [...]
Accounts fetched successfully: [...]
Dashboard data: {...}
```

---

## Common Issues & Fixes

### Issue: "Error adding account" still shows
**Fix:**
```
1. Check backend is running (npm start in server folder)
2. Check mobile number format (no spaces, no +91)
3. Ensure account not already added
4. Check browser console for full error message
```

### Issue: Notification badge shows but notification empty
**Fix:**
```
1. Refresh the page
2. Wait for dashboard check to complete
3. Check browser console for errors
4. Verify you have NO expenses logged for today
```

### Issue: Can't log in
**Fix:**
```
1. Clear browser cookies/cache
2. Make sure you signed up first
3. Use correct credentials
4. Check backend console for auth errors
```

---

## Success Indicators

✅ **Working Correctly When:**
- Account adds successfully with alert message
- 🔔 Bell shows red badge with count
- Clicking notification marks it as read
- Alert appears on Dashboard if no entry today
- All data updates without page refresh

✅ **Backend Output:**
```
Server running on http://localhost:5000
(no errors in console)
```

✅ **Frontend Console:**
```
Notification fetched successfully
Accounts fetched successfully  
(no red errors)
```

---

## Quick Start (TL;DR)

```bash
# Terminal 1: Backend
cd server
npm start
# Wait for: "Server running on http://localhost:5000"

# Terminal 2: Frontend  
cd client
npm start
# Wait for: "Compiled successfully!"

# Browser: http://localhost:3000
# Login → Click 🏦 Accounts → Add account → Check 🔔 badge
```

---

**If you still see errors after these fixes:**
1. Screenshot the error message
2. Check browser console (F12 → Console)
3. Copy exact error text
4. Share both for deeper debugging
