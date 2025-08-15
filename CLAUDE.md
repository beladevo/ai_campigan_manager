# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Solara AI Mini System - a queue-based microservices architecture for AI-powered marketing content generation. The system consists of:

- **UI Frontend** (`ui-frontend/`): Modern React/Next.js web application for content creators and business owners
- **NestJS Service** (`nestjs-service/`): REST API that handles campaign requests, manages PostgreSQL database, and publishes to RabbitMQ
- **Python Generator** (`python-generator/`): FastAPI service containing all AI generation logic using Google Gemini 2.0 Flash
- **Python Worker** (`python-worker/`): Lightweight RabbitMQ consumer that delegates content generation to python-generator service
- **RabbitMQ**: Message broker handling asynchronous communication between services

## Development Commands

### Starting the System
```bash
# Start all services with Docker Compose (includes UI Frontend, RabbitMQ, PostgreSQL, NestJS, Python Generator, Python Worker)
docker-compose up --build

# Start individual services for development
cd ui-frontend && npm run dev         # React/Next.js frontend on port 3001
cd nestjs-service && npm run start:dev # NestJS API on port 3000
cd python-generator && python app.py  # FastAPI service with AI generation logic
cd python-worker && python main.py    # RabbitMQ consumer and message broker
```

### UI Frontend Commands
```bash
cd ui-frontend
npm install                    # Install dependencies
npm run dev                   # Start development server on port 3001
npm run build                 # Build for production
npm start                     # Start production server
```

### NestJS Service Commands
```bash
cd nestjs-service
npm install                    # Install dependencies
npm run start                  # Start production server
npm run start:dev             # Start development server with nodemon
```

### Python Services
```bash
cd python-generator
pip install -r requirements.txt
python app.py                 # Start FastAPI server on port 8000

cd python-worker
pip install -r requirements.txt
python main.py               # Start RabbitMQ consumer
```

## Architecture Details

### Data Flow (Queue-Based Architecture)
1. User interacts with React/Next.js frontend (port 3001) to create campaigns
2. Frontend sends `POST /campaigns` with userId and prompt to NestJS service (port 3000)
3. NestJS creates campaign record in PostgreSQL with PENDING status
4. NestJS publishes campaign generation message to RabbitMQ queue `campaign.generate`
5. NestJS updates campaign status to PROCESSING and returns response to frontend
6. Frontend polls `GET /campaigns/:id` for real-time status updates
7. Python Worker consumes message from `campaign.generate` queue
8. Python Worker delegates content generation to Python Generator service via HTTP
9. Python Generator generates text via Gemini 2.0 Flash and images via Gemini image generation
10. Python Worker publishes result to RabbitMQ queue `campaign.result`
11. NestJS consumes result from `campaign.result` queue and updates database
12. Frontend displays completed campaign with generated content and images

**Benefits of Queue Architecture:**
- ✅ **Horizontal Scaling**: Multiple Python workers can process campaigns concurrently
- ✅ **Reliability**: Message persistence ensures no lost campaigns
- ✅ **Decoupling**: Services communicate via reliable message broker
- ✅ **Better Resource Utilization**: No blocked HTTP connections during AI generation

### Key Components

**UI Frontend (`ui-frontend/src/`):**
- `app/page.tsx`: Main application page with campaign creation and dashboard
- `components/CampaignCreator.tsx`: Campaign creation interface with templates
- `components/CampaignDashboard.tsx`: Campaign management and status tracking
- `components/UserProfile.tsx`: User authentication and profile management
- `lib/api.ts`: API client for backend communication
- `types/campaign.ts`: TypeScript type definitions

**NestJS Service (`nestjs-service/src/`):**
- `main.ts`: Application bootstrap with CORS and static file serving
- `app.module.ts`: Root module with TypeORM PostgreSQL and static file configuration
- `campaign/campaign.controller.ts`: REST endpoints for campaign CRUD and user queries
- `campaign/campaign.service.ts`: Business logic with RabbitMQ integration and result consumption
- `campaign/entities/campaign.entity.ts`: Database entity with status enum (PENDING, PROCESSING, COMPLETED, FAILED)
- `rabbitmq/rabbitmq.service.ts`: RabbitMQ service for publishing and consuming messages
- `rabbitmq/rabbitmq.module.ts`: RabbitMQ module configuration

**Python Worker (`python-worker/`):**
- `main.py`: Lightweight RabbitMQ consumer that delegates content generation to Python Generator
- `CampaignWorker` class: Handles message consumption, HTTP delegation, and result publishing
- Acts as a message broker between RabbitMQ and Python Generator service
- No AI generation logic - purely for queue management and service orchestration

**Python Generator (`python-generator/`):**
- `app.py`: FastAPI application containing all AI generation logic
- `GeneratorService` class: Handles AI content generation using Google Gemini 2.0 Flash
- Uses enhanced marketing prompts for text generation and optimized visual prompts for images
- Implements fallback to enhanced placeholder images if generation fails  
- Saves generated images to `/app/output/` directory
- **Core service** - contains all AI generation business logic

### Database Schema
PostgreSQL database `solara` with campaigns table:
- `id`: UUID primary key
- `userId`: String
- `prompt`: String
- `status`: Enum (PENDING, PROCESSING, COMPLETED, FAILED)
- `generatedText`: Text (nullable)
- `imagePath`: String (nullable)
- `errorMessage`: String (nullable)
- Timestamps managed by TypeORM

### Environment Variables
Required environment variables (see docker-compose.yml):
- `GEMINI_API_KEY`: Google Gemini API key for AI generation (python-generator only)
- `POSTGRES_HOST`: Database host (default: postgres)
- `RABBITMQ_URL`: RabbitMQ connection string (default: amqp://rabbitmq:rabbitmq@rabbitmq:5672)
- `GENERATOR_URL`: Python Generator service URL for python-worker (default: http://python-generator:8000)

### RabbitMQ Configuration
- **Exchange**: `solara.campaigns` (direct exchange)
- **Queues**: 
  - `campaign.generate`: Campaign generation requests
  - `campaign.result`: Campaign generation results
- **Management UI**: http://localhost:15672 (rabbitmq/rabbitmq)

### Error Handling
- **Queue-level reliability**: RabbitMQ ensures message persistence and delivery guarantees
- **Worker error handling**: Python Worker sends error results back via queue if generation fails
- **Graceful degradation**: Fallback to enhanced placeholder images if AI generation fails
- **Structured logging**: Campaign ID correlation throughout the entire workflow
- **Database consistency**: Failed campaigns are marked with FAILED status and error messages
- **Dead letter queues**: Could be implemented for handling repeated failures

### Output Storage
Generated images are stored in `output/` directory with naming pattern:
`campaign_{campaignId}_{randomHash}.png`

## API Endpoints

**UI Frontend (localhost:3001):**
- User-friendly web interface for campaign creation and management
- Real-time status updates and content viewing
- Campaign templates for different business needs

**NestJS Service (localhost:3000):**
- `POST /campaigns` - Create new campaign
- `GET /campaigns/:id` - Get campaign status and results
- `GET /campaigns/user/:userId` - Get all campaigns for a specific user
- `GET /output/:imagePath` - Serve generated images

**Python Service (localhost:8000):**
- `POST /generate` - Generate content (called internally by NestJS)
- `GET /health` - Service health check
- `GET /` - Service information

## Docker Configuration
The system uses Docker Compose with:
- **UI Frontend** on port 3001 (React/Next.js with live reload)
- **RabbitMQ** 3-management on ports 5672 (AMQP) and 15672 (Management UI)
- **PostgreSQL** 15 on port 5432
- **NestJS service** on port 3000 with live reload and static file serving
- **Python generator** on port 8000 (core AI generation service)  
- **Python worker** (background consumer, no exposed port)
- **Shared volumes** for output files and node_modules

## Scaling Considerations
To scale the system:
1. **Multiple Python Workers**: Scale python-worker service in docker-compose for higher message throughput
2. **Multiple Python Generators**: Scale python-generator service for concurrent AI generation
3. **Database Connection Pooling**: Configure PostgreSQL connection limits
4. **RabbitMQ Clustering**: For high availability message brokering
5. **Load Balancing**: Add multiple NestJS and Python Generator instances behind load balancers