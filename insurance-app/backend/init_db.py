import sqlite3

conn = sqlite3.connect("database.db")
cur = conn.cursor()

# USERS
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    role TEXT
)
""")

# POLICIES
cur.execute("""
CREATE TABLE policy_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    premium REAL
)
""")

# PURCHASED
cur.execute("""
CREATE TABLE purchased_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    policy_id INTEGER,
    premium REAL,
    status TEXT
)
""")

# PAYMENTS
cur.execute("""
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    status TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# CLAIMS
cur.execute("""
CREATE TABLE claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    policy_id INTEGER,
    status TEXT
)
""")

# NOTIFICATIONS
cur.execute("""
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT
)
""")

# SUPPORT
cur.execute("""
CREATE TABLE support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    status TEXT
)
""")

# INSERT SAMPLE DATA
cur.execute("INSERT INTO policy_master (name, category, premium) VALUES ('Car Insurance Basic', 'Vehicle', 5000)")
cur.execute("INSERT INTO policy_master (name, category, premium) VALUES ('Health Shield', 'Health', 7000)")

conn.commit()
conn.close()

print("Database initialized ✅")