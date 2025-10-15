# Auth Service

Authentication and Authorization Service with gRPC API built with NestJS and Prisma ORM.

## Features

- ✅ User registration and authentication
- ✅ JWT access token and refresh token with token rotation
- ✅ Token family tracking for enhanced security
- ✅ Device and session management
- ✅ Role-based access control (USER, ADMIN, MANAGER)
- ✅ Password hashing with bcrypt
- ✅ Redis integration for session management
- ✅ Graceful token degradation
- ✅ gRPC communication
- ✅ Background job processing for clean up token with Bull Queue

## Tech Stack

- **NestJS** - Framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Session storage and caching
- **gRPC** - Communication protocol
- **JWT** - Token-based authentication
- **Bull Queue** - Background job processing
- **TypeScript** - Programming language

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://taskuser:taskpass@localhost:5432/taskdb?schema=auth"

NODE_ENV="Local"
APP_VERSION="1.0.0"
HTTP_PORT=4000
GRPC_PORT=5000

JWT_SECRET="your_jwt_secret_key"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

REDIS_HOST="localhost"
REDIS_PORT=6379
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

### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?
  lastName  String?
  avatar    String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  refreshTokens RefreshToken[]
}
```

### RefreshToken Model

```prisma
model RefreshToken {
  id          String    @id @default(uuid())
  token       String    @unique
  tokenFamily String
  userId      String
  deviceId    String?
  deviceName  String?
  ipAddress   String?
  userAgent   String?
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  isRevoked   Boolean   @default(false)
  revokedAt   DateTime?

  user User @relation(fields: [userId], references: [id])
}
```

### Enums

- **Role**: USER, ADMIN, MANAGER

## gRPC API

### Available Methods

1. **register** - Register a new user
2. **login** - Authenticate user and get tokens
3. **logout** - Revoke refresh token and clear session
4. **refreshToken** - Get new access token using refresh token
5. **validateToken** - Validate access token
6. **validateUser** - Validate user by ID

## Features in Detail

### Token Rotation

The service implements secure token rotation with token families:

- Each login creates a new token family
- Refresh tokens are rotated on each refresh
- Detects token reuse and revokes entire family
- Tracks device information for security

### Session Management

- Redis-based session storage
- Device tracking (device ID, name, IP, user agent)
- Session expiration handling
- Graceful degradation when Redis is unavailable

### Background Jobs

- Automatic cleanup of expired tokens

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

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Token Rotation**: Automatic rotation of refresh tokens
- **Token Family**: Tracks token lineage for security
- **Token Reuse Detection**: Revokes entire family on reuse attempt
- **Device Tracking**: Monitors device information
- **Graceful Degradation**: Continues to work if Redis is down
- **Token Expiration**: Short-lived access tokens (15m)
- **Refresh Token Expiration**: Long-lived refresh tokens (7d)

## Integration

- GraphQL Gateway - Main API entry point
- Task Service - For user task operations
- Redis - Session and cache storage
