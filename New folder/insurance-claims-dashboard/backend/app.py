from flask import Flask, request, jsonify

app = Flask(__name__)

# Mock Data
users = [
    {"username": "customer", "password": "password", "role": "customer"},
    {"username": "operations", "password": "password", "role": "operations"}
]

notifications = []
claims = []
kyc_submissions = []

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = next((u for u in users if u['username'] == username and u['password'] == password), None)
    if user:
        return jsonify({"message": "Login successful", "role": user['role']}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    return jsonify(notifications), 200

@app.route('/api/claims', methods=['POST'])
def submit_claim():
    data = request.json
    claim = {"id": len(claims) + 1, **data, "status": "Pending"}
    claims.append(claim)
    return jsonify({"message": "Claim submitted successfully", "claim": claim}), 201

@app.route('/api/claims', methods=['GET'])
def get_claims():
    return jsonify(claims), 200

@app.route('/api/kyc', methods=['POST'])
def submit_kyc():
    data = request.json
    kyc = {"id": len(kyc_submissions) + 1, **data, "status": "Pending"}
    kyc_submissions.append(kyc)
    return jsonify({"message": "KYC submitted successfully", "kyc": kyc}), 201

@app.route('/api/kyc', methods=['GET'])
def get_kyc():
    return jsonify(kyc_submissions), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)