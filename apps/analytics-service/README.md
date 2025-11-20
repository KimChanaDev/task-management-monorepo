# Analytics Service

Analytics Service for Task Platform with TimescaleDB integration for time-series metrics and user productivity statistics.

## Features

- 📊 Task completion metrics
- 👤 User productivity statistics
- 📈 Time-series data aggregation
- 🔄 Real-time event processing via Apache Pulsar
- 🎯 gRPC API for analytics queries

## Tech Stack

- **NestJS** - Framework
- **TimescaleDB** - Time-series database
- **Prisma** - ORM
- **gRPC** - Service communication
- **Apache Pulsar** - Event streaming
- **TypeScript** - Programming language

## Getting Started

### Installation

```bash
npm install
```

### Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Environment Variables

```env
DATABASE_URL="postgresql://analyticsuser:analyticspass@localhost:5433/analyticsdb?schema=analytics"
NODE_ENV="Local"
APP_VERSION=1.0.0
HTTP_PORT=4005
GRPC_PORT=5005
PULSAR_SERVICE_URL="pulsar://localhost:6650"
```

## API Endpoints

### gRPC

- `GetUserProductivity` - Get user productivity metrics
- `GetTaskMetrics` - Get task completion metrics
- `GetPriorityDistribution` - Get priority distribution of tasks in the system
- `GetStatusDistribution` - Get status distribution of tasks in the system
- `GetUserActivityHeatmap` - Get activity heatmap of user

### Health Check

```
GET http://localhost:4005/healthcheck
```

## Events Consumed

The service subscribes to the following Pulsar topics:

- `task-created` - New task events
- `task-updated` - Task update events
- `task-deleted` - Task deletion events
