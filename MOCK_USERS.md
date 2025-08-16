# Mock Users for Solara AI System

This document lists all the mock users created in the database for testing and demonstration purposes.

## 🔑 Universal Password
**All accounts use the same password: `password123`**

## 👤 Test Accounts

### 👑 Admin Accounts

#### 1. System Administrator
- **Email:** `admin@solara.ai`
- **Name:** Admin User
- **Role:** Admin
- **Subscription:** Enterprise
- **Status:** Active, Email Verified
- **Usage:** 45 campaigns this month
- **Last Login:** Now (just logged in)

#### 2. Mock Admin
- **Email:** `mock@admin.com`
- **Name:** Mock Admin
- **Role:** Admin  
- **Subscription:** Enterprise
- **Status:** Active, Email Verified
- **Usage:** 23 campaigns this month
- **Last Login:** 2 hours ago

### 👤 User Accounts

#### 3. Premium User
- **Email:** `mock@user.com`
- **Name:** Mock User
- **Role:** User
- **Subscription:** Premium
- **Status:** Active, Email Verified
- **Usage:** 67 campaigns this month
- **Last Login:** 30 minutes ago

#### 4. Business User
- **Email:** `john.doe@example.com`
- **Name:** John Doe
- **Role:** User
- **Subscription:** Business
- **Status:** Active, Email Verified
- **Usage:** 89 campaigns this month
- **Last Login:** 15 minutes ago

#### 5. Business Professional
- **Email:** `jane.smith@company.com`
- **Name:** Jane Smith
- **Role:** User
- **Subscription:** Business
- **Status:** Active, Email Verified
- **Usage:** 34 campaigns this month
- **Last Login:** 4 hours ago

#### 6. Startup Marketer
- **Email:** `marketer@startup.io`
- **Name:** Marketing Pro
- **Role:** User
- **Subscription:** Premium
- **Status:** Active, Email Verified
- **Usage:** 56 campaigns this month
- **Last Login:** 1 hour ago

#### 7. Free Tier User
- **Email:** `freelancer@creative.co`
- **Name:** Creative Freelancer
- **Role:** User
- **Subscription:** Free
- **Status:** Active, Email Verified
- **Usage:** 8 campaigns this month
- **Last Login:** 6 hours ago

#### 8. Enterprise Agency
- **Email:** `agency@digital.com`
- **Name:** Digital Agency
- **Role:** User
- **Subscription:** Enterprise
- **Status:** Active, Email Verified
- **Usage:** 234 campaigns this month
- **Last Login:** 3 hours ago

#### 9. Trial User
- **Email:** `newbie@trial.com`
- **Name:** Trial User
- **Role:** User
- **Subscription:** Free
- **Status:** **Unverified Email**
- **Usage:** 2 campaigns this month
- **Last Login:** 12 hours ago

#### 10. Enterprise Power User
- **Email:** `poweruser@enterprise.corp`
- **Name:** Enterprise PowerUser
- **Role:** User
- **Subscription:** Enterprise
- **Status:** Active, Email Verified
- **Usage:** 445 campaigns this month
- **Last Login:** 45 minutes ago

## 📊 Subscription Tier Breakdown

### 🆓 Free Tier (2 users)
- **Features:** 10 campaigns/month, Basic templates, Standard support
- **Users:** `freelancer@creative.co`, `newbie@trial.com`

### 💎 Premium Tier (2 users)
- **Features:** 100 campaigns/month, All templates, Priority support, Analytics
- **Users:** `mock@user.com`, `marketer@startup.io`

### 🏢 Business Tier (2 users)
- **Features:** 500 campaigns/month, Custom templates, Priority support, Advanced analytics, Team features
- **Users:** `john.doe@example.com`, `jane.smith@company.com`

### 🚀 Enterprise Tier (4 users)
- **Features:** Unlimited campaigns, Custom templates, 24/7 support, Advanced analytics, API access, White-label
- **Users:** `admin@solara.ai`, `mock@admin.com`, `agency@digital.com`, `poweruser@enterprise.corp`

## 🎯 Usage Patterns

### Heavy Users (200+ campaigns/month)
- `poweruser@enterprise.corp` - 445 campaigns
- `agency@digital.com` - 234 campaigns

### Moderate Users (50-100 campaigns/month)
- `john.doe@example.com` - 89 campaigns
- `mock@user.com` - 67 campaigns
- `marketer@startup.io` - 56 campaigns

### Light Users (Under 50 campaigns/month)
- `admin@solara.ai` - 45 campaigns
- `jane.smith@company.com` - 34 campaigns
- `mock@admin.com` - 23 campaigns
- `freelancer@creative.co` - 8 campaigns
- `newbie@trial.com` - 2 campaigns

## 🔧 How to Use These Accounts

### 1. Seed the Database
```bash
cd nestjs-service
npm run seed:dev
```

### 2. Login to Frontend
1. Go to `http://localhost:3001`
2. Use any email from the list above
3. Password: `password123`

### 3. Test Different User Experiences
- **Admin users** see additional management features
- **Enterprise users** have unlimited access
- **Free users** hit usage limits
- **Unverified users** see verification prompts

## 📝 Sample Data Included

### 📧 Campaigns
- **50 sample campaigns** distributed across users
- **Varied statuses:** Completed, Processing, Pending, Failed
- **Realistic content:** Product launches, social media, emails, etc.
- **Different creation dates:** Spread over last 30 days

### 📈 Analytics Data
- **Real usage metrics** for each user
- **Monthly limits** and reset dates
- **Login timestamps** for activity tracking
- **Campaign success rates** and performance data

## 🎨 Frontend Features to Test

### Dashboard Views
- **Admin Dashboard:** Overview of all users and system metrics
- **User Dashboard:** Personal campaigns and analytics
- **Campaign History:** Filterable list with status tracking
- **Templates Library:** Categorized campaign templates

### User Experience Testing
1. **Free Tier Limits:** Test with `freelancer@creative.co`
2. **Premium Features:** Use `mock@user.com` 
3. **Enterprise Access:** Try `agency@digital.com`
4. **Admin Functions:** Login as `admin@solara.ai`
5. **Unverified Account:** Test with `newbie@trial.com`

## 🔒 Security Notes

- All passwords are hashed using bcrypt
- Email verification tokens are included for unverified accounts
- Role-based access control is implemented
- Session management through JWT tokens

## 🚀 Getting Started

1. **Start the backend services:**
   ```bash
   docker-compose up --build
   ```

2. **Seed the database:**
   ```bash
   cd nestjs-service
   npm run seed:dev
   ```

3. **Start the frontend:**
   ```bash
   cd ui-frontend  
   npm run dev
   ```

4. **Login and explore!**
   Visit `http://localhost:3001` and use any of the accounts above.

---

**Note:** This is test data for development and demonstration purposes only. Do not use these accounts in production.