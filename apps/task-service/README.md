# Task Service

Task Management Service with gRPC API built with NestJS and Prisma ORM.

## Features

- ✅ Create, Read, Update, Delete tasks
- ✅ Task assignment to users
- ✅ Task status management (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- ✅ Task priority levels (LOW, MEDIUM, HIGH, URGENT)
- ✅ Due date tracking
- ✅ User task filtering
- ✅ Pagination support
- ✅ gRPC communication

## Tech Stack

- **NestJS** - Framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **gRPC** - Communication protocol
- **TypeScript** - Programming language

## Getring Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://taskuser:taskpass@localhost:5432/taskdb?schema=task"

NODE_ENV="Local"
APP_VERSION=1.0.0
HTTP_PORT=4001
GRPC_PORT=5001

AUTH_SERVICE_GRPC_URL=localhost:5000

```

### Run Prisma migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Start the service

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## Database Schema

### Task Model

```prisma
model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(TODO)
  dueDate     DateTime?
  createdBy   String
  assignedTo  String?
  createdAt   DateTime     @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime     @updatedAt @db.Timestamptz(6)
}
```

### Enums

- **TaskStatus**: TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED
- **TaskPriority**: LOW, MEDIUM, HIGH, URGENT

## gRPC API

### Available Methods

1. **createTask** - Create a new task
2. **getTask** - Get task by ID
3. **getTasks** - Get all tasks with pagination and filters
4. **updateTask** - Update task details
5. **deleteTask** - Delete a task
6. **assignTask** - Assign task to a user
7. **updateTaskStatus** - Update task status
8. **getUserTasks** - Get tasks for a specific user

## Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:migrate:reset` - Reset database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## Integration

- Auth grpc service
