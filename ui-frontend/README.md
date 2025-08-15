# Solara AI Content Studio - Frontend

A modern, responsive web application for creating AI-powered marketing content. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🎨 User-Friendly Interface
- **Campaign Templates**: Pre-built templates for e-commerce, social media, blog posts, email campaigns, and advertisements
- **Custom Campaigns**: Create campaigns from scratch with detailed prompts
- **Real-time Status Updates**: Live tracking of campaign generation progress
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Campaign Management
- **Dashboard View**: Overview of all your campaigns with status indicators
- **Campaign Details**: View generated text and images in a modal overlay
- **Content Actions**: Copy text to clipboard and download generated images
- **User Profiles**: Simple user management with persistent sessions

### 🚀 Modern Tech Stack
- **Next.js 15**: Latest React framework with app directory
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful, customizable icons
- **Axios**: HTTP client for API communication

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   cd ui-frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
ui-frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout component
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── CampaignCreator.tsx    # Campaign creation interface
│   │   ├── CampaignDashboard.tsx  # Campaign management dashboard
│   │   └── UserProfile.tsx       # User management component
│   ├── lib/                   # Utility libraries
│   │   └── api.ts            # API client functions
│   └── types/                 # TypeScript type definitions
│       └── campaign.ts        # Campaign-related types
├── public/                    # Static assets
├── tailwind.config.js        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
└── package.json              # Dependencies and scripts
```

## API Integration

The frontend communicates with the NestJS backend API:

### Endpoints Used
- `POST /campaigns` - Create new campaign
- `GET /campaigns/:id` - Get specific campaign
- `GET /campaigns/user/:userId` - Get all campaigns for a user
- `GET /output/:imagePath` - Access generated images

### Error Handling
- Network error handling with user-friendly messages
- Automatic retry for failed campaign status updates
- Loading states for better user experience

## Campaign Templates

The application includes 5 pre-built campaign templates:

1. **Product Launch** - For e-commerce product announcements
2. **Social Media Post** - Engaging social content creation
3. **Blog Article** - Professional blog content generation
4. **Email Campaign** - Marketing email content
5. **Advertisement Copy** - High-converting ad copy

Each template provides a structured prompt that users can customize.

## User Experience Features

### Real-time Updates
- Campaigns automatically refresh every 3 seconds when in PENDING or PROCESSING status
- Visual status indicators (pending, processing, completed, failed)
- Loading animations for better perceived performance

### Responsive Design
- Mobile-first design approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatible

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Style
- ESLint configuration for consistent code style
- TypeScript strict mode enabled
- Prettier for code formatting (recommended)

## Docker Support

The application includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up ui-frontend

# Access the application
open http://localhost:3001
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test on multiple screen sizes
4. Ensure accessibility standards are met

## License

This project is part of the Solara AI Mini System.