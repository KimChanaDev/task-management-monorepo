# File Service

## 📋 Overview

The **File Service** is a microservice responsible for managing file uploads, downloads, and storage using **MinIO** (S3-compatible object storage). It provides gRPC APIs for file operations and integrates with the Task Service to attach files to tasks.

## 🎯 Features

- ✅ File upload with validation (type, size)
- ✅ File download with presigned URLs
- ✅ File deletion with authorization
- ✅ Image thumbnail generation (using Sharp)
- ✅ MinIO/S3 integration
- ✅ File metadata storage (PostgreSQL + Prisma)
- ✅ gRPC API for microservices communication
- ✅ RESTful HTTP endpoints for direct access
- ✅ File listing and filtering
- ✅ Task-file association

## 📦 Tech Stack

- **NestJS** - Framework
- **gRPC** - Inter-service communication
- **MinIO** - Object storage (S3-compatible)
- **Prisma** - ORM for PostgreSQL
- **Sharp** - Image processing
- **TypeScript** - Programming language

## 🚀 Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- MinIO (or S3-compatible storage)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm prisma:generate

# Run database migrations
npm prisma:migrate
```

### Environment Variables

Create a `.env` file:

```env
NODE_ENV=Local
APP_VERSION: "1.0.0"
HTTP_PORT=5006
GRPC_PORT=50056

# Database
DATABASE_URL="postgresql://taskuser:taskpass@localhost:5432/taskdb?schema=file"

# MinIO/S3 Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=task-files


# File Upload Configuration
MAX_FILE_SIZE=10485760 # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain

# Thumbnail Configuration
THUMBNAIL_WIDTH=200
THUMBNAIL_HEIGHT=200
THUMBNAIL_QUALITY=80

```

### Running the Service

```bash
# Development mode
npm run dev

```

## 📡 API Reference

### gRPC API

#### UploadFile

Upload a file to MinIO

**Request:**

```protobuf
message UploadFileRequest {
  bytes content = 1;
  string filename = 2;
  string mimeType = 3;
  string uploadedBy = 4;
  optional string taskId = 5;
  optional string description = 6;
}
```

**Response:**

```protobuf
message UploadFileResponse {
  string id = 1;
  string filename = 2;
  string url = 3;
  optional string thumbnailUrl = 4;
  int64 size = 5;
  string message = 6;
}
```

#### GetFile

Get file metadata and URL

**Request:**

```protobuf
message GetFileRequest {
  string id = 1;
}
```

#### DeleteFile

Delete a file (with authorization)

**Request:**

```protobuf
message DeleteFileRequest {
  string id = 1;
  string userId = 2;
}
```

### ListFiles

- List all files with pagination

#### GetFilesByTask

- Get files attached to a specific task

#### GetFilesByUser

- Get files uploaded by a specific user

## 🖼️ Image Thumbnail Generation

The service automatically generates thumbnails for image files:

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Thumbnail size**: 200x200 (configurable)
- **Quality**: 80% (configurable)
- **Storage**: Stored alongside original file in MinIO

## 🔒 Security

- File type validation (MIME type whitelist)
- File size limits (default: 10MB)

## 📊 Monitoring

The service includes health check endpoints:

- `GET /healthcheck` - Service health status
- `GET /healthcheck/check` - Overall health status

## 🐳 Docker Support

```bash
# Build image
docker compose -f docker-compose.local.yaml -d
# Run with Docker Compose
docker-compose up file-service -d
```
