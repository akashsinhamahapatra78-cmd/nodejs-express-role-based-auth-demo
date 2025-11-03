const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json());

// Hardcoded users with roles
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'moderator', password: 'mod123', role: 'Moderator' },
  { id: 3, username: 'user', password: 'user123', role: 'User' }
];

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check user roles
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${requiredRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// ===== LOGIN ROUTE =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// ===== PROTECTED ROUTES =====

// Admin-only route
app.get('/api/admin', verifyToken, checkRole(['Admin']), (req, res) => {
  res.json({
    message: 'Welcome to Admin Dashboard',
    user: req.user,
    adminData: {
      totalUsers: 3,
      totalModerators: 1,
      systemStatus: 'Running'
    }
  });
});

// Moderator-only route
app.get('/api/moderator', verifyToken, checkRole(['Moderator', 'Admin']), (req, res) => {
  res.json({
    message: 'Welcome to Moderator Panel',
    user: req.user,
    moderatorData: {
      pendingReports: 5,
      bannedUsers: 2,
      reviewQueue: 10
    }
  });
});

// User route (accessible to all authenticated users)
app.get('/api/user', verifyToken, checkRole(['User', 'Moderator', 'Admin']), (req, res) => {
  res.json({
    message: 'Welcome to User Profile',
    user: req.user,
    userData: {
      joinDate: '2023-01-01',
      postCount: 5,
      followers: 0
    }
  });
});

// Public route (no authentication required)
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\nTest Users:`);
  console.log(`  Admin    - username: admin,      password: admin123`);
  console.log(`  Moderator - username: moderator, password: mod123`);
  console.log(`  User     - username: user,       password: user123\n`);
});

module.exports = app;
