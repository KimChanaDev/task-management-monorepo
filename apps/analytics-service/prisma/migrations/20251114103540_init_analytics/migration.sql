-- CreateTable
CREATE TABLE "task_events" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT,
    "priority" TEXT,
    "assignedTo" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_productivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tasksCreated" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksInProgress" INTEGER NOT NULL DEFAULT 0,
    "tasksOverdue" INTEGER NOT NULL DEFAULT 0,
    "totalCompletionTime" INTEGER NOT NULL DEFAULT 0,
    "averageCompletionTime" DOUBLE PRECISION,
    "productivityScore" DOUBLE PRECISION,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_productivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_metrics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "tasksCreated" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksInProgress" INTEGER NOT NULL DEFAULT 0,
    "tasksInReview" INTEGER NOT NULL DEFAULT 0,
    "tasksCancelled" INTEGER NOT NULL DEFAULT 0,
    "tasksOverdue" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION,
    "averageCompletionTime" DOUBLE PRECISION,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_analytics" (
    "id" TEXT NOT NULL,
    "teamId" TEXT DEFAULT 'default',
    "date" DATE NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "totalTasksCreated" INTEGER NOT NULL DEFAULT 0,
    "totalTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "teamProductivityScore" DOUBLE PRECISION,
    "collaborationScore" DOUBLE PRECISION,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priority_distribution" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "low" INTEGER NOT NULL DEFAULT 0,
    "medium" INTEGER NOT NULL DEFAULT 0,
    "high" INTEGER NOT NULL DEFAULT 0,
    "urgent" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priority_distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_distribution" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "todo" INTEGER NOT NULL DEFAULT 0,
    "inProgress" INTEGER NOT NULL DEFAULT 0,
    "review" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "cancelled" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_distribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_events_taskId_idx" ON "task_events"("taskId");

-- CreateIndex
CREATE INDEX "task_events_userId_idx" ON "task_events"("userId");

-- CreateIndex
CREATE INDEX "task_events_eventType_idx" ON "task_events"("eventType");

-- CreateIndex
CREATE INDEX "task_events_timestamp_idx" ON "task_events"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "user_productivity_userId_idx" ON "user_productivity"("userId");

-- CreateIndex
CREATE INDEX "user_productivity_date_idx" ON "user_productivity"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_productivity_userId_date_key" ON "user_productivity"("userId", "date");

-- CreateIndex
CREATE INDEX "task_metrics_date_idx" ON "task_metrics"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "task_metrics_date_key" ON "task_metrics"("date");

-- CreateIndex
CREATE INDEX "team_analytics_teamId_idx" ON "team_analytics"("teamId");

-- CreateIndex
CREATE INDEX "team_analytics_date_idx" ON "team_analytics"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "team_analytics_teamId_date_key" ON "team_analytics"("teamId", "date");

-- CreateIndex
CREATE INDEX "priority_distribution_date_idx" ON "priority_distribution"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "priority_distribution_date_key" ON "priority_distribution"("date");

-- CreateIndex
CREATE INDEX "status_distribution_date_idx" ON "status_distribution"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "status_distribution_date_key" ON "status_distribution"("date");
