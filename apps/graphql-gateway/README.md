# GraphQL Gateway

GraphQL Gateway service that federates Auth and Task services using GraphQL Yoga.

## Features

- ✅ GraphQL API with Yoga Server
- ✅ gRPC client connections to Auth Service and Task Service
- ✅ JWT authentication middleware
- ✅ Type-safe resolvers
- ✅ GraphiQL playground for testing

## Tech Stack

- NestJs - Framwork
- GraphQL Yoga - Modern GraphQL server
- TypeScript - Programming language
- gRPC - Service communication

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
APP_VERSION=1.0.0
HTTP_PORT=4002
AUTH_SECURE_COOKIES=true
AUTH_SERVICE_GRPC_URL=localhost:5000
TASK_SERVICE_GRPC_URL=localhost:5001

ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

### Start the service

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## API Usage

### Access GraphiQL Playground

Open your browser and navigate to: `http://localhost:HTTP_PORT/graphql`

### Authentication Operations

#### 1. Register a new user

```graphql
mutation Register {
  register(
    input: {
      email: "user@example.com"
      password: "Password#000"
      username: "John Doe"
    }
  ) {
    id
    email
    username
    role
    createAt
  }
}
```

#### 2. Login

```graphql
mutation Login {
  register(input: { email: "user@example.com", password: "Password#000" }) {
    id
    email
    username
    role
    createAt
  }
}
```

**Note:** Login automatically sets the tokens in cookies

#### 3. Get current user (me)

**Authentication Required:** Access token cookies

```graphql
query Me {
  me {
    id
    email
    username
    role
    createAt
  }
}
```

#### 4. Get user by ID

**Authentication Required**

```graphql
query GetUser {
  user(id: "user-id-here") {
    id
    email
    username
    role
    createAt
  }
}
```

#### 5. Refresh access token

Uses the refresh token from cookies to get a new access token:

```graphql
mutation RefreshToken {
  refreshAccessToken {
    message
  }
}
```

#### 6. Logout

**Authentication Required**

```graphql
mutation Logout {
  logout {
    message
  }
}
```

### Task Operations

**Note:** All task operations require authentication.

#### 1. Create a task

```graphql
mutation CreateTask {
  createTask(
    input: {
      title: "Complete project",
      description: "Finish the GraphQL gateway", //optional
      priority: HIGH, //optional, default LOW
      status: TODO, //optional, default TODO
      dueDate: "2025-12-31T23:59:59Z", //optional
      assignedTo: "assigned_user_id" //optional
    }
  ) {
    id
    title
    description
    status
    priority
    dueDate
    assignedTo
    createdBy
    createdAt
    updatedAt
  }
}
```

#### 2. Get my tasks

Get tasks where the current user is either creator or assignee:

```graphql
query MyTasks {
  myTasks(
      filter: {
        status: TODO, //optional
        priority: MEDIUM, //optional
	      search: '', //optional
        page: 1,
        limit: 10
    }
  ) {
    tasks {
      id
      title
      description
      status
      priority
      dueDate
      assignedTo
      createdBy
      createdAt
      updatedAt
    }
    total
  }
}
```

#### 3. Get all tasks

```graphql
query AllTasks {
  tasks(filter: { status: IN_PROGRESS, priority: URGENT, page: 1, limit: 10 }) {
    id
    title
    description
    status
    priority
    dueDate
    assignedTo
    createdBy
    createdAt
    updatedAt
  }
}
```

#### 4. Get a specific task

```graphql
query GetTask {
  task(id: "task-id") {
    id
    title
    description
    status
    priority
    dueDate
    assignedTo
    createdBy
    createdAt
    updatedAt
  }
}
```

#### 5. Update a task

```graphql
mutation UpdateTask {
  updateTask(
    input: {
      id: "task-id-here"
      title: "Updated title"
      description: "Updated description"
      status: IN_PROGRESS
      priority: URGENT
      dueDate: "2025-12-31T23:59:59Z"
      assignedTo: "assignee-id"
    }
  ) {
    id
    title
    description
    status
    priority
    dueDate
    assignedTo
    createdBy
    createdAt
    updatedAt
  }
}
```

#### 6. Delete a task

```graphql
mutation DeleteTask {
  deleteTask(id: "task-id-here")
}
```

Returns: `"Task deleted successfully"`

#### 7. Assign a task to a user

```graphql
mutation AssignTask {
  assignTask(id: "task-id-here", assignedTo: "user-id-here") {
    id
    title
    description
    status
    priority
    dueDate
    assignedTo
    createdBy
    createdAt
    updatedAt
  }
}
```

### GraphQL Types

#### TaskStatus Enum

- `TODO`
- `IN_PROGRESS`
- `REVIEW`
- `DONE`
- `CANCELLED`

#### TaskPriority Enum

- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

#### Role Enum

- `USER`
- `ADMIN`
- `MANAGER`

### Analytics Operations

**Note:** All analytics operations require authentication.

#### 1. Get User Productivity

Get productivity metrics for the current user:

```graphql
query GetUserProductivity {
  getUserProductivity(
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
    granularity: "DAY" # optional, default: DAY (options: DAY, WEEK, MONTH)
  ) {
    data {
      date
      tasksCreated
      tasksCompleted
      tasksInProgress
      tasksOverdue
      averageCompletionTime
      productivityScore
    }
    summary {
      totalTasksCreated
      totalTasksCompleted
      averageProductivityScore
      completionRate
      averageCompletionTime
    }
  }
}
```

#### 2. Get Task Metrics

Get overall task metrics across the system:

```graphql
query GetTaskMetrics {
  getTaskMetrics(
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
    granularity: "WEEK" # optional, default: DAY
  ) {
    data {
      date
      totalTasks
      tasksCreated
      tasksCompleted
      tasksInProgress
      tasksInReview
      tasksCancelled
      tasksOverdue
      completionRate
      averageCompletionTime
    }
    summary {
      totalTasks
      totalCompleted
      overallCompletionRate
      averageCompletionTime
    }
  }
}
```

#### 3. Get Priority Distribution

Get distribution of tasks by priority:

```graphql
query GetPriorityDistribution {
  getPriorityDistribution(
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
  ) {
    data {
      date
      low
      medium
      high
      urgent
    }
    summary {
      totalLow
      totalMedium
      totalHigh
      totalUrgent
    }
  }
}
```

#### 4. Get Status Distribution

Get distribution of tasks by status:

```graphql
query GetStatusDistribution {
  getStatusDistribution(
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
  ) {
    data {
      date
      todo
      inProgress
      review
      completed
      cancelled
    }
    summary {
      totalTodo
      totalInProgress
      totalReview
      totalCompleted
      totalCancelled
    }
  }
}
```

#### 5. Get User Activity Heatmap

Get activity heatmap for the current user:

```graphql
query GetUserActivityHeatmap {
  getUserActivityHeatmap(
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
  ) {
    data {
      date
      hour
      activityCount
    }
    totalActivities
    peakHour
  }
}
```

## Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## Integration

- Auth service
- Task service
- Analytics service
