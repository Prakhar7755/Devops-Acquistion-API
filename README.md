# Production API

A robust, scalable Node.js/Express API built with modern practices including JWT authentication, PostgreSQL/MySQL, and comprehensive error handling.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation Instructions](#installation-instructions)
- [Configuration Settings](#configuration-settings)
- [Usage Examples](#usage-examples)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [License Information](#license-information)
- [Contact Details](#contact-details)

## Project Overview

Production API is a backend service designed for enterprise applications requiring secure authentication, RESTful endpoints, and scalable architecture. The project implements industry-standard practices for security, performance, and maintainability.

### Key Features

- **JWT-based Authentication**: Secure login/signup with token refresh mechanisms
- **Role-Based Access Control**: Flexible permission system (user/admin roles)
- **Input Validation**: Comprehensive data validation using Zod schemas
- **Error Handling**: Centralized error management with meaningful responses
- **Database Abstraction**: ORM-based data access with migration support
- **Security Headers**: Protection against common web vulnerabilities
- **Request Logging**: Comprehensive audit trails with Winston logger
- **Environment Configuration**: Multiple environment support (dev/staging/prod)
- **API Documentation**: Self-documenting endpoints with clear response formats

## Technology Stack

- **Runtime**: Node.js >= 18.x
- **Framework**: Express.js 4.x
- **Language**: JavaScript (ESM) with JSDoc type checking
- **Database**: PostgreSQL/MySQL via Drizzle ORM
- **Authentication**: JSON Web Tokens (jsonwebtoken) + bcrypt
- **Validation**: Zod schema validation
- **Logging**: Winston with multiple transports
- **Security**: Helmet.js, CORS, rate limiting (planned)
- **Development**: Nodemon, ESLint, Prettier
- **Testing**: Jest (planned)

## Installation Instructions

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x or Yarn >= 1.22.x
- PostgreSQL >= 14.x or MySQL >= 8.0
- Git

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/production-api.git
   cd production-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Generate migrations (if needed)
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Optional: Seed initial data
   # npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

6. **Start in production mode**

   ```bash
   npm start
   ```

## Configuration Settings

Environment variables are loaded from `.env` file. Create this file based on `.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=production_api
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgresql

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Cookie Settings
COOKIE_MAX_AGE=900000  # 15 minutes in milliseconds

# Logging
LOG_LEVEL=info

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Important Configuration Notes

1. **JWT_SECRET**: Must be a strong, random string (minimum 32 characters)
2. **Database Credentials**: Use environment-specific credentials
3. **NODE_ENV**: Affects behavior:
   - `development`: Verbose logging, debug endpoints enabled
   - `production`: Optimized performance, error details hidden
   - `test`: Used for test suite execution

## Usage Examples

### Authentication Flow

#### User Registration

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "role": "user",
    "email": "john.doe@example.com"
  }
}
```

#### User Login

```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "User signed in successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "role": "user",
    "email": "john.doe@example.com"
  }
}
```

#### Access Protected Routes

Include the JWT token in the Authorization header:

```http
GET /api/profile
Authorization: Bearer <jwt_token>
```

### Making API Requests with cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","password":"password123","role":"admin"}'

# Login
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}' \
  -c cookies.txt

# Access protected endpoint
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $(cat cookies.txt | grep token | cut -f7)" \
  -b cookies.txt
```

## API Endpoints

### Authentication

| Method | Endpoint           | Description          | Access     |
|--------|--------------------|----------------------|------------|
| POST   | `/api/auth/sign-up`| User registration    | Public     |
| POST   | `/api/auth/sign-in`| User login           | Public     |
| POST   | `/api/auth/sign-out`| User logout         | Authenticated |

### User Management (Example)

| Method | Endpoint          | Description          | Access         |
|--------|-------------------|----------------------|----------------|
| GET    | `/api/users`      | List all users       | Admin only     |
| GET    | `/api/users/:id`  | Get specific user    | User/Admin     |
| PUT    | `/api/users/:id`  | Update user          | User/Admin     |
| DELETE | `/api/users/:id`  | Delete user          | Admin only     |

### Health Check

| Method | Endpoint    | Description        | Access |
|--------|-------------|--------------------|--------|
| GET    | `/health`   | Service health     | Public |

## Database Setup

### PostgreSQL

```bash
# Create database
createdb production_api

# Create user (if needed)
createuser -P api_user
# Enter password when prompted

# Grant privileges
psql -d production_api -c "GRANT ALL PRIVILEGES ON DATABASE production_api TO api_user;"
```

### MySQL

```bash
# Create database
CREATE DATABASE production_api;

# Create user
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON production_api.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```

Run migrations to create tables:

```bash
npm run db:migrate
```

## Contribution Guidelines

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Ensure code passes linting: `npm run lint`
5. Run tests: `npm test` (when implemented)
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Follow existing code formatting (2-space indentation)
- Use descriptive variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused
- Handle errors appropriately

### Commit Message Format

Use conventional commits:

```git
feat: add user authentication
fix: resolve cookie parsing issue
docs: update installation instructions
refactor: simplify validation logic
test: add login endpoint tests
chore: update dependencies
```

### Reporting Issues

Please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

## License Information

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Permissive**: Free to use, modify, and distribute
- ❌ **No Liability**: Provided "as is" without warranty
- 📄 **Copyright Notice**: Must include original copyright and license

## Contact Details

### Project Maintainer

- **Name**: 
- **Email**: <>
- **GitHub**: []()

### Community & Support

- **Issue Tracker**: [GitHub Issues]()
- **Discussions**: [GitHub Discussions]()
- **Security Concerns**: Please email <> directly

### Professional Support

For enterprise support, custom features, or deployment assistance:

- **Email**: <>
- **Website**: <>
- **Response Time**: Within 2 business hours for critical issues

---

*Last updated: May 22, 2026*  
*Version: 1.0.0*  
*© 2026 Production API Contributors. All rights reserved.*
