-- Solara AI Mock Users and Campaigns SQL Script
-- Run this script to populate the database with test data

-- First, let's clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM campaigns;
-- DELETE FROM users;

-- Insert mock users with different roles and subscription tiers
INSERT INTO users (
  id, email, password, first_name, last_name, role, "subscriptionTier", 
  email_verified, campaigns_used_this_month, monthly_limit_reset_date, 
  last_login, created_at, updated_at
) VALUES 
-- Admin Users
(
  gen_random_uuid(), 
  'admin@solara.ai', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Admin', 
  'User', 
  'admin', 
  'enterprise',
  true, 
  45, 
  '2024-12-01T00:00:00Z', 
  NOW(), 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'mock@admin.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Mock', 
  'Admin', 
  'admin', 
  'enterprise',
  true, 
  23, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '2 hours', 
  NOW(), 
  NOW()
),

-- Regular Users
(
  gen_random_uuid(), 
  'mock@user.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Mock', 
  'User', 
  'user', 
  'premium',
  true, 
  67, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '30 minutes', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'john.doe@example.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'John', 
  'Doe', 
  'user', 
  'business',
  true, 
  89, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '15 minutes', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'jane.smith@company.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Jane', 
  'Smith', 
  'user', 
  'business',
  true, 
  34, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '4 hours', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'marketer@startup.io', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Marketing', 
  'Pro', 
  'user', 
  'premium',
  true, 
  56, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '1 hour', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'freelancer@creative.co', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Creative', 
  'Freelancer', 
  'user', 
  'free',
  true, 
  8, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '6 hours', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'agency@digital.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Digital', 
  'Agency', 
  'user', 
  'enterprise',
  true, 
  234, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '3 hours', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'newbie@trial.com', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Trial', 
  'User', 
  'user', 
  'free',
  false, -- unverified email
  2, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '12 hours', 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'poweruser@enterprise.corp', 
  '$2b$10$rQvkZpRGtgB9r8/YwQqeQe1V3KzKzUj8J7FqH.pLxYvN5Gz2M4cSC', -- password123
  'Enterprise', 
  'PowerUser', 
  'user', 
  'enterprise',
  true, 
  445, 
  '2024-12-01T00:00:00Z', 
  NOW() - INTERVAL '45 minutes', 
  NOW(), 
  NOW()
);

-- Insert sample campaigns
WITH user_ids AS (
  SELECT id, email FROM users WHERE email IN (
    'admin@solara.ai', 'mock@admin.com', 'mock@user.com', 'john.doe@example.com',
    'jane.smith@company.com', 'marketer@startup.io', 'freelancer@creative.co',
    'agency@digital.com', 'newbie@trial.com', 'poweruser@enterprise.corp'
  )
)
INSERT INTO campaigns (
  id, user_id, prompt, status, generated_text, image_path, error_message,
  current_step, progress_percentage, started_at, completed_at, created_at, updated_at
) VALUES
-- Sample campaigns for different users
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'mock@user.com'),
  'Create a compelling product launch announcement for our new AI-powered marketing tool',
  'completed',
  '# 🚀 Introducing SolaraAI: Your Marketing Game-Changer

We''re thrilled to announce the launch of **SolaraAI** - the revolutionary AI-powered marketing tool that''s about to transform how you create content!

## What makes SolaraAI special?

- **Lightning-fast content generation** in seconds
- **Multi-platform optimization** for all your channels  
- **Advanced AI** that understands your brand voice
- **Real-time analytics** to track performance

> "SolaraAI has increased our content output by 300% while maintaining quality" - Marketing Director, TechCorp

Ready to experience the future of marketing? Get started today!',
  'campaign_1_generated.png',
  NULL,
  'done',
  100,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'john.doe@example.com'),
  'Write engaging social media copy for a sustainable fashion brand targeting millennials',
  'completed',
  '# Sustainable Style, Conscious Choice 🌱

Fashion doesn''t have to cost the earth. Our new **eco-luxe collection** proves that sustainable can be stylish.

## Why choose sustainable fashion?

✨ **Reduce environmental impact**  
✨ **Support ethical manufacturing**  
✨ **Invest in quality pieces that last**  
✨ **Express your values through style**

Every piece in our collection is:
- Made from recycled or organic materials
- Produced in fair-trade facilities
- Designed to last for years, not seasons

**Join the sustainable fashion revolution** - because looking good should feel good too! 

*Shop the collection now and get 20% off your first sustainable purchase.*',
  'campaign_2_generated.png',
  NULL,
  'done',
  100,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '4 hours'
),
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'agency@digital.com'),
  'Generate email marketing content for a Black Friday sale with 40% off',
  'processing',
  NULL,
  NULL,
  NULL,
  'generating_text',
  35,
  NOW() - INTERVAL '10 minutes',
  NULL,
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '5 minutes'
),
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'freelancer@creative.co'),
  'Create blog content about the future of remote work in 2024',
  'pending',
  NULL,
  NULL,
  NULL,
  'queued',
  0,
  NULL,
  NULL,
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '5 minutes'
),
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'poweruser@enterprise.corp'),
  'Write ad copy for a fitness app targeting busy professionals',
  'failed',
  NULL,
  NULL,
  'Mock error for demonstration - AI service temporarily unavailable',
  'queued',
  25,
  NOW() - INTERVAL '1 hour',
  NULL,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM user_ids WHERE email = 'marketer@startup.io'),
  'Generate content for a tech startup funding announcement',
  'completed',
  '# 🎉 We''re Thrilled to Announce Our Series A Funding!

Today marks a major milestone for **TechStart Innovations** as we announce our successful **$15M Series A funding round** led by Venture Partners with participation from Innovation Capital and Angel Collective.

## What This Means for Our Mission

This investment accelerates our vision to **democratize AI-powered solutions** for small and medium businesses worldwide.

### 🚀 Our Growth Journey
- **2022**: Founded with a dream to simplify AI adoption
- **2023**: Reached 10K+ satisfied customers  
- **2024**: Expanded to 25 countries
- **Today**: Ready to scale globally with Series A funding

### 💡 What''s Next?
- **Product Innovation**: Enhanced AI capabilities
- **Team Expansion**: Hiring 50+ talented individuals
- **Market Expansion**: Entering new verticals
- **Customer Success**: Improved support and onboarding

> "This funding validates our belief that AI should be accessible to every business, regardless of size." - CEO, TechStart Innovations

**Ready to join our journey?** We''re hiring across engineering, sales, and customer success teams.',
  'campaign_3_generated.png',
  NULL,
  'done',
  100,
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '7 hours',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '7 hours'
);

-- Display success message
SELECT 
  '✅ Mock users and campaigns successfully created!' as message,
  COUNT(*) as total_users
FROM users 
WHERE email LIKE '%@%';

-- Display account summary
SELECT 
  '📋 Available Test Accounts:' as info,
  email,
  CASE 
    WHEN role = 'admin' THEN '👑 Admin'
    ELSE '👤 User'
  END as account_type,
  "subscriptionTier" as subscription,
  campaigns_used_this_month as monthly_usage,
  CASE 
    WHEN email_verified THEN '✅ Verified'
    ELSE '❌ Unverified'
  END as status
FROM users 
WHERE email LIKE '%@%'
ORDER BY 
  CASE WHEN role = 'admin' THEN 1 ELSE 2 END,
  "subscriptionTier" DESC,
  email;

-- Password reminder
SELECT '🔑 Universal Password: password123' as password_info;