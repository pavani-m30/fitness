const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mock Data
let users = [
    { username: 'customer', password: 'password', role: 'customer' },
    { username: 'operations', password: 'password', role: 'operations' }
];

let notifications = [];
let claims = [];
let kycSubmissions = [];

// Routes
// Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.status(200).json({ message: 'Login successful', role: user.role });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Notifications
app.get('/api/notifications', (req, res) => {
    res.status(200).json(notifications);
});

// Claims
app.post('/api/claims', (req, res) => {
    const claim = { id: claims.length + 1, ...req.body, status: 'Pending' };
    claims.push(claim);
    res.status(201).json({ message: 'Claim submitted successfully', claim });
});

app.get('/api/claims', (req, res) => {
    res.status(200).json(claims);
});

// KYC Submissions
app.post('/api/kyc', (req, res) => {
    const kyc = { id: kycSubmissions.length + 1, ...req.body, status: 'Pending' };
    kycSubmissions.push(kyc);
    res.status(201).json({ message: 'KYC submitted successfully', kyc });
});

app.get('/api/kyc', (req, res) => {
    res.status(200).json(kycSubmissions);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});