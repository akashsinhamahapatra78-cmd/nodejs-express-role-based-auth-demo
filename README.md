# Node.js Express Role-Based Access Control (RBAC) Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Overview

A comprehensive Node.js and Express.js backend application demonstrating **Role-Based Access Control (RBAC)** implementation. This project includes JWT authentication with role-based middleware, protected routes restricted to specific roles (Admin, Moderator, User), and proper error handling for unauthorized access.

## 🎯 Features

- ✅ **User Authentication** - Login route with username/password validation
- ✅ **JWT Token Generation** - Secure tokens with user role in payload
- ✅ **JWT Verification Middleware** - Validates tokens and extracts user information
- ✅ **Role-Based Authorization** - Middleware to check user roles
- ✅ **Protected Routes** - Separate endpoints for Admin, Moderator, and User roles
- ✅ **Error Handling** - Clear error messages for invalid/expired tokens and insufficient permissions
- ✅ **Hardcoded Users** - Pre-configured test users with different roles
- ✅ **Environment Configuration** - .env file for secure configuration management

## 📋 Project Structure

```
nodejs-express-role-based-auth-demo/
├── server.js              # Main Express server with routes and middleware
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (configure JWT_SECRET)
├── .gitignore             # Git ignore rules (Node.js)
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nodejs-express-role-based-auth-demo.git
   cd nodejs-express-role-based-auth-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Edit the `.env` file and set your JWT_SECRET:
   ```
   PORT=5000
   JWT_SECRET=your-very-secure-secret-key-change-in-production
   JWT_EXPIRY=1h
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## 👥 Test Users

The application comes with three pre-configured test users:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | `admin` | `admin123` | Admin dashboard, Moderator panel, User profile |
| Moderator | `moderator` | `mod123` | Moderator panel, User profile |
| User | `user` | `user123` | User profile only |

## 📡 API Endpoints

### Authentication

#### **Login** (Public)
- **POST** `/api/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "Admin"
    }
  }
  ```
- **Response** (Error - 401):
  ```json
  {
    "message": "Invalid username or password"
  }
  ```

### Protected Routes

#### **Admin Dashboard** (Admin only)
- **GET** `/api/admin`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Welcome to Admin Dashboard",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "Admin"
    },
    "adminData": {
      "totalUsers": 3,
      "totalModerators": 1,
      "systemStatus": "Running"
    }
  }
  ```

#### **Moderator Panel** (Moderator & Admin)
- **GET** `/api/moderator`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Welcome to Moderator Panel",
    "user": {
      "id": 2,
      "username": "moderator",
      "role": "Moderator"
    },
    "moderatorData": {
      "pendingReports": 5,
      "bannedUsers": 2,
      "reviewQueue": 10
    }
  }
  ```

#### **User Profile** (User, Moderator, & Admin)
- **GET** `/api/user`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Welcome to User Profile",
    "user": {
      "id": 3,
      "username": "user",
      "role": "User"
    },
    "userData": {
      "joinDate": "2023-01-01",
      "postCount": 5,
      "followers": 0
    }
  }
  ```

### Public Routes

#### **Public Endpoint** (No authentication)
- **GET** `/api/public`
- **Response**: `{ "message": "This is a public route" }`

#### **Health Check** (No authentication)
- **GET** `/api/health`
- **Response**: `{ "status": "Server is running" }`

## 🧪 Testing with cURL

### 1. Test with Admin User

```bash
# Step 1: Login as Admin
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Save the token from response and use it in subsequent requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Step 2: Access Admin Dashboard
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Access Moderator Panel (Admin has access)
curl -X GET http://localhost:5000/api/moderator \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Access User Profile (Admin has access)
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test with Moderator User

```bash
# Login as Moderator
TOKEN=$(curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "moderator", "password": "mod123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Try to access Admin Dashboard (should fail)
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer $TOKEN"
# Response: { "message": "Access denied. Required role: Admin. Your role: Moderator" }

# Access Moderator Panel (should succeed)
curl -X GET http://localhost:5000/api/moderator \
  -H "Authorization: Bearer $TOKEN"

# Access User Profile (should succeed)
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test with Regular User

```bash
# Login as User
TOKEN=$(curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Try to access Admin Dashboard (should fail)
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer $TOKEN"
# Response: { "message": "Access denied. Required role: Admin. Your role: User" }

# Try to access Moderator Panel (should fail)
curl -X GET http://localhost:5000/api/moderator \
  -H "Authorization: Bearer $TOKEN"
# Response: { "message": "Access denied. Required role: Moderator or Admin. Your role: User" }

# Access User Profile (should succeed)
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Error Scenarios

```bash
# Missing token
curl -X GET http://localhost:5000/api/admin
# Response: { "message": "Access token is missing" }

# Invalid token
curl -X GET http://localhost:5000/api/admin \
  -H "Authorization: Bearer invalid.token.here"
# Response: { "message": "Invalid or expired token" }

# Invalid credentials
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "wrongpassword"}'
# Response: { "message": "Invalid username or password" }

# Missing credentials
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{}'
# Response: { "message": "Username and password are required" }
```

## 🔐 Security Considerations

1. **Environment Variables**: Store sensitive data (JWT_SECRET) in .env file, never commit it
2. **HTTPS**: Use HTTPS in production for all API communications
3. **Token Expiry**: Set appropriate token expiration time (1h is default)
4. **Strong Secret**: Use a strong, random JWT_SECRET in production
5. **Password Security**: In production, hash passwords using bcryptjs
6. **Rate Limiting**: Implement rate limiting to prevent brute force attacks
7. **CORS**: Configure CORS appropriately for your frontend domain
8. **Input Validation**: Validate and sanitize all user inputs

## 📝 Middleware Explanation

### verifyToken Middleware
- Extracts JWT token from Authorization header
- Verifies token signature and expiration
- Decodes token and attaches user data to request object
- Returns 401 if token is missing
- Returns 403 if token is invalid or expired

### checkRole Middleware
- Checks if user's role is in the list of required roles
- Returns 403 with descriptive message if role doesn't match
- Allows multiple roles for a single route

## 🔄 Implementation Details

### Login Flow
1. User submits username and password
2. Server validates credentials against hardcoded users array
3. If valid, server generates JWT token with user info (id, username, role) and 1-hour expiry
4. Token is returned to client

### Protected Route Flow
1. Client includes token in Authorization header
2. verifyToken middleware validates the token
3. checkRole middleware verifies the user's role
4. If all checks pass, route handler is executed
5. Response is sent with role-specific data

## 📚 Dependencies

- **express**: ^4.18.2 - Web framework
- **jsonwebtoken**: ^9.0.0 - JWT token generation and verification
- **dotenv**: ^16.0.3 - Environment variable management
- **nodemon**: ^2.0.20 (dev) - Auto-restart server on file changes

## 🛠️ Extending the Application

### Add New Routes
```javascript
app.get('/api/new-route', verifyToken, checkRole(['Admin']), (req, res) => {
  res.json({ message: 'Only Admin can access this' });
});
```

### Add New Users
Modify the `users` array in server.js:
```javascript
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'newuser', password: 'pass123', role: 'User' }
];
```

### Add Database Integration
Replace the hardcoded users array with database queries:
```javascript
const user = await User.findOne({ username });
if (user && await bcrypt.compare(password, user.password)) {
  // Generate token
}
```

## 📖 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Authentication](https://nodejs.org/en/docs/)
- [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control)

## 🤝 Contributing

Fork the repository, create a feature branch, commit your changes, and submit a pull request.

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 👨‍💻 Author

Created for learning and demonstration purposes.

---

**Happy Coding! 🚀**
