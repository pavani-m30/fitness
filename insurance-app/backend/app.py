from flask import Flask, request, jsonify, session
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"
CORS(app)

DB = "database.db"

def connect_db():
    return sqlite3.connect(DB)

# ---------- AUTH ----------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                (data["username"], data["password"], data["role"]))
    conn.commit()
    conn.close()

    return jsonify({"message": "Registered"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username=? AND password=?",
                (data["username"], data["password"]))
    user = cur.fetchone()
    conn.close()

    if user:
        session["user"] = user[0]
        session["role"] = user[3]
        return jsonify({"role": user[3]})
    return jsonify({"error": "Invalid credentials"}), 401

# ---------- POLICIES ----------
@app.route("/api/policies")
def policies():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM policy_master")
    data = cur.fetchall()

    conn.close()
    return jsonify(data)

# ---------- BUY POLICY ----------
@app.route("/api/buy", methods=["POST"])
def buy():
    data = request.json
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO purchased_policies (user_id, policy_id, premium, status)
        VALUES (?, ?, ?, 'Active')
    """, (session["user"], data["policy_id"], data["premium"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Policy bought"})

# ---------- PAYMENTS ----------
@app.route("/api/pay", methods=["POST"])
def pay():
    data = request.json
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO payments (user_id, amount, status)
        VALUES (?, ?, 'Success')
    """, (session["user"], data["amount"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Payment done"})

# ---------- CLAIMS ----------
@app.route("/api/claim", methods=["POST"])
def claim():
    data = request.json
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO claims (user_id, policy_id, status)
        VALUES (?, ?, 'Submitted')
    """, (session["user"], data["policy_id"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Claim submitted"})

# ---------- NOTIFICATIONS ----------
@app.route("/api/notifications")
def notifications():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM notifications WHERE user_id=?", (session["user"],))
    data = cur.fetchall()

    conn.close()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)