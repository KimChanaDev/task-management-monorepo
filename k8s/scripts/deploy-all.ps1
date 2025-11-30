# ============================================
# Deploy All Script for Kubernetes
# ============================================
# This script will deploy everything to your Kubernetes cluster in the correct order.

param(
    [switch]$SkipBuild,           # Skip build images
    [switch]$SkipMonitoring,      # Skip monitoring stack
    [switch]$WaitForReady         # Wait all pod ready
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Deploying Task Platform to Kubernetes" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check that kubectl is using the minikube context
$currentContext = kubectl config current-context
Write-Host "Current kubectl context: $currentContext" -ForegroundColor Gray

if ($currentContext -ne "minikube") {
    Write-Host "Warning: kubectl context is not 'minikube'" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne "y") {
        exit 0
    }
}

# Change to k8s directory
$k8sRoot = Split-Path -Parent $PSScriptRoot
Set-Location $k8sRoot
Write-Host "K8s manifests directory: $k8sRoot" -ForegroundColor Gray

# Build images if not SkipBuild
if (-not $SkipBuild) {
    Write-Host "`n[Step 1/6] Building Docker Images..." -ForegroundColor Cyan
    & "$k8sRoot\scripts\build-images.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build images" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "`n[Step 1/6] Skipping Docker image build..." -ForegroundColor Yellow
}

# Change to k8s directory
Set-Location $k8sRoot
Write-Host "`nK8s manifests directory: $k8sRoot" -ForegroundColor Gray

# Step 2: Create Namespaces
Write-Host "`n[Step 2/6] Creating Namespaces..." -ForegroundColor Cyan
kubectl apply -f namespaces/
Write-Host "✓ Namespaces created" -ForegroundColor Green

# Step 3: Deploy Infrastructure
Write-Host "`n[Step 3/6] Deploying Infrastructure Services..." -ForegroundColor Cyan
Write-Host "  - Deploying PostgreSQL..." -ForegroundColor Gray
kubectl apply -f infrastructure/postgres/
Write-Host "  - Deploying Redis..." -ForegroundColor Gray
kubectl apply -f infrastructure/redis/
Write-Host "  - Deploying TimescaleDB..." -ForegroundColor Gray
kubectl apply -f infrastructure/timescaledb/
Write-Host "  - Deploying Pulsar..." -ForegroundColor Gray
kubectl apply -f infrastructure/pulsar/
Write-Host "  - Deploying MinIO..." -ForegroundColor Gray
kubectl apply -f infrastructure/minio/
Write-Host "✓ Infrastructure services deployed" -ForegroundColor Green

# Wait for the infrastructure to be ready
Write-Host "`n[Step 3.5/6] Waiting for Infrastructure to be ready..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
$timeout = 300  # 5 minutes
$services = @("postgres", "redis", "timescaledb", "minio", "pulsar")
foreach ($service in $services) {
    Write-Host "  - Waiting for $service..." -ForegroundColor Gray
    kubectl wait --for=condition=ready pod -l app=$service -n task-platform-infra --timeout="${timeout}s" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $service is ready" -ForegroundColor Green
    }
    else {
        Write-Host "    ✗ $service timed out or failed" -ForegroundColor Red
    }
}

# Step 4: Deploy Application Services
Write-Host "`n[Step 4/6] Deploying Application Services..." -ForegroundColor Cyan
$appOrder = @(
    @{Name = "auth-service"; Path = "apps/auth-service/" },
    @{Name = "task-service"; Path = "apps/task-service/" },
    @{Name = "file-service"; Path = "apps/file-service/" },
    @{Name = "analytics-service"; Path = "apps/analytics-service/" },
    @{Name = "notification-service"; Path = "apps/notification-service/" },
    @{Name = "graphql-gateway"; Path = "apps/graphql-gateway/" },
    @{Name = "svelte-web"; Path = "apps/svelte-web/" }
)
foreach ($app in $appOrder) {
    Write-Host "  - Deploying $($app.Name)..." -ForegroundColor Gray
    kubectl apply -f $app.Path
}
Write-Host "✓ Application services deployed" -ForegroundColor Green

# Step 5: Deploy HPA
Write-Host "`n[Step 5/6] Deploying Horizontal Pod Autoscaler..." -ForegroundColor Cyan
kubectl apply -f apps/hpa.yaml
Write-Host "✓ HPA deployed" -ForegroundColor Green

# Step 6: Deploy Ingress
Write-Host "`n[Step 6/6] Deploying Ingress..." -ForegroundColor Cyan
kubectl apply -f ingress/
Write-Host "✓ Ingress deployed" -ForegroundColor Green

# Wait for all pods to be ready if selected WaitForReady
if ($WaitForReady) {
    Write-Host "`nWaiting for all application pods to be ready..." -ForegroundColor Yellow
    foreach ($app in $appOrder) {
        Write-Host "  - Waiting for $($app.Name)..." -ForegroundColor Gray
        kubectl wait --for=condition=ready pod -l app=$($app.Name) -n task-platform-apps --timeout="300s" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ $($app.Name) is ready" -ForegroundColor Green
        }
        else {
            Write-Host "    ✗ $($app.Name) timed out" -ForegroundColor Red
        }
    }
}

# Show status
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nPod Status:" -ForegroundColor Yellow
kubectl get pods -n task-platform-infra
Write-Host ""
kubectl get pods -n task-platform-apps

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get svc -n task-platform-apps

Write-Host "`nIngress:" -ForegroundColor Yellow
kubectl get ingress -n task-platform-apps

# Show how to access
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "How to Access:" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "1. Add to hosts file (C:\Windows\System32\drivers\etc\hosts):" -ForegroundColor Yellow
Write-Host "   127.0.0.1 task-platform.local" -ForegroundColor White
Write-Host "   127.0.0.1 api.task-platform.local" -ForegroundColor White

Write-Host "`n2. Enable Ingress addon (if not already):" -ForegroundColor Yellow
Write-Host "   minikube addons enable ingress" -ForegroundColor White

Write-Host "`n3. Run minikube tunnel (in another terminal):" -ForegroundColor Yellow
Write-Host "   minikube tunnel" -ForegroundColor White

Write-Host "`n4. Access the application:" -ForegroundColor Yellow
Write-Host "   Frontend: http://task-platform.local" -ForegroundColor White
Write-Host "   GraphQL:  http://task-platform.local/graphql" -ForegroundColor White

Write-Host "`n5. Alternative - Use port-forward:" -ForegroundColor Yellow
Write-Host "   .\scripts\port-forward.ps1" -ForegroundColor White
