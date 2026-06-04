import sqlite3

DB_NAME = "worksense.db"

def get_connection():
    return sqlite3.connect(DB_NAME, check_same_thread=False)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT CHECK(role IN ('employee','manager'))
        );
    """)

    # Tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            task_name TEXT,
            category TEXT,
            time_spent INTEGER,
            status TEXT,
            date TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    """)

    conn.commit()
    conn.close()


def add_user(username, password, role):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                   (username, password, role))
    conn.commit()
    conn.close()


def get_user(username, password):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?",
                   (username, password))
    user = cursor.fetchone()
    conn.close()
    return user


def add_task(user_id, task_name, category, time_spent, status, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO tasks (user_id, task_name, category, time_spent, status, date)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, task_name, category, time_spent, status, date))
    conn.commit()
    conn.close()


def get_user_tasks(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE user_id=?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return rows


def get_all_tasks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT tasks.*, users.username 
        FROM tasks 
        JOIN users ON users.user_id = tasks.user_id
    """)
    rows = cursor.fetchall()
    conn.close()
    return rows
def update_task(task_id, task_name, category, time_spent, status, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE tasks 
        SET task_name=?, category=?, time_spent=?, status=?, date=?
        WHERE task_id=?
    """, (task_name, category, time_spent, status, date, task_id))
    conn.commit()
    conn.close()
def delete_task(task_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE task_id=?", (task_id,))
    conn.commit()
    conn.close()