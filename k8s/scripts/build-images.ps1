# ============================================
# Build Docker Images Script for Minikube
# ============================================
# This script will build all Docker images into the Minikube Docker daemon.
# This allows Kubernetes to use images without having to push them to the registry.

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Building Docker Images for Minikube" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check that minikube is running.
$minikubeStatus = minikube status --format='{{.Host}}'
if ($minikubeStatus -ne "Running") {
    Write-Host "Error: Minikube is not running. Please start minikube first." -ForegroundColor Red
    Write-Host "Run: minikube start --driver=docker --cpus=4 --memory=8192" -ForegroundColor Yellow
    exit 1
}

# Set Docker environment to use Minikube
Write-Host "`nSetting Docker environment to use Minikube..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Change to the project root directory.
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot
Write-Host "Project root: $projectRoot" -ForegroundColor Gray

# Build all services
$services = @(
    @{Name = "auth-service"; Dockerfile = "apps/auth-service/Dockerfile" },
    @{Name = "task-service"; Dockerfile = "apps/task-service/Dockerfile" },
    @{Name = "graphql-gateway"; Dockerfile = "apps/graphql-gateway/Dockerfile" },
    @{Name = "notification-service"; Dockerfile = "apps/notification-service/Dockerfile" },
    @{Name = "analytics-service"; Dockerfile = "apps/analytics-service/Dockerfile" },
    @{Name = "file-service"; Dockerfile = "apps/file-service/Dockerfile" },
    @{Name = "svelte-web"; Dockerfile = "apps/svelte-web/Dockerfile" }
)
foreach ($service in $services) {
    Write-Host "`n----------------------------------------" -ForegroundColor Gray
    Write-Host "Building: task-platform/$($service.Name):latest" -ForegroundColor Green
    Write-Host "Dockerfile: $($service.Dockerfile)" -ForegroundColor Gray
    
    docker build -t "task-platform/$($service.Name):latest" -f $service.Dockerfile .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully built task-platform/$($service.Name):latest" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Failed to build task-platform/$($service.Name):latest" -ForegroundColor Red
        # Set Docker environment to use Local Machine before exiting
        Write-Host "`nSetting Docker environment back to use Local Machine..." -ForegroundColor Yellow
        & minikube -p minikube docker-env --unset --shell powershell | Invoke-Expression 2>$null
        exit 1
    }
}
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "All images built successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nSetting Docker environment back to use Local Machine..." -ForegroundColor Yellow
& minikube -p minikube docker-env --unset --shell powershell | Invoke-Expression 2>$null

# Show list of built images
Write-Host "`nBuilt images:" -ForegroundColor Yellow
docker images | Select-String "task-platform"
