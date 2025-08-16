# Mock Users for Testing Solara AI Authentication System

## Test Users

### 1. Free Tier User
- **Email**: `john.doe@example.com`
- **Password**: `password123`
- **Name**: John Doe
- **Subscription**: Free (5 campaigns/month)
- **Role**: User

### 2. Premium Tier User
- **Email**: `jane.smith@example.com`
- **Password**: `password123`
- **Name**: Jane Smith
- **Subscription**: Premium (50 campaigns/month)
- **Role**: User

### 3. Business Tier User
- **Email**: `mike.johnson@example.com`
- **Password**: `password123`
- **Name**: Mike Johnson
- **Subscription**: Business (200 campaigns/month)
- **Role**: User

### 4. Admin User
- **Email**: `admin@solara.ai`
- **Password**: `admin123`
- **Name**: Admin User
- **Subscription**: Enterprise (unlimited campaigns)
- **Role**: Admin

## Quick Registration Guide

1. Start the application:
   ```bash
   docker-compose up --build
   ```

2. Navigate to `http://localhost:3001`

3. Click "Sign up" and register with any of the emails above

4. Use the corresponding passwords to log in

## API Testing with curl

### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get user profile (requires token):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create a campaign (requires token):
```bash
curl -X POST http://localhost:3000/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "prompt": "Create a marketing campaign for a new eco-friendly coffee brand"
  }'
```

## Features Available

✅ **Complete Authentication System**
- User registration with email/password
- JWT-based login with 7-day expiration
- Protected routes and API endpoints
- Password hashing with bcrypt
- Email verification tokens (ready for email integration)
- Password reset functionality

✅ **Subscription Tiers & Usage Limits**
- Free: 5 campaigns/month
- Premium: 50 campaigns/month 
- Business: 200 campaigns/month
- Enterprise: Unlimited campaigns
- Automatic monthly usage reset

✅ **User Management**
- User profiles with subscription info
- Campaign ownership and access control
- Role-based permissions (User/Admin)
- Usage tracking and quota enforcement

✅ **Frontend Integration**
- Complete React authentication flow
- Context-based state management
- Professional login/register forms
- Real-time authentication status
- Protected routes and components

## Database Schema

The system automatically creates these tables:
- `users` - User accounts with subscription info
- `campaigns` - Campaign data with user relationships

All tables are automatically synchronized with TypeORM.