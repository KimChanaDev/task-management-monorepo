# ============================================
# Delete All Script for Kubernetes
# ==========================================
# This script deletes everything deployed.

param(
    [switch]$KeepInfra,       # Keep infrastructure
    [switch]$KeepData,        # Keep PVC (data)
    [switch]$Force            # Do not ask for confirmation
)

Write-Host "============================================" -ForegroundColor Red
Write-Host "Delete Task Platform from Kubernetes" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red

if (-not $Force) {
    Write-Host "`nThis will delete all deployed resources!" -ForegroundColor Yellow
    if (-not $KeepInfra) {
        Write-Host "  - Infrastructure services (Postgres, Redis, etc.)" -ForegroundColor Gray
    }
    if (-not $KeepData) {
        Write-Host "  - All persistent data (PVCs)" -ForegroundColor Gray
    }
    Write-Host "  - All application services" -ForegroundColor Gray
    Write-Host "  - All configurations and secrets" -ForegroundColor Gray
    
    $confirm = Read-Host "`nAre you sure? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

$k8sRoot = Split-Path -Parent $PSScriptRoot
Set-Location $k8sRoot

# Delete Ingress
Write-Host "`n[Step 1] Deleting Ingress..." -ForegroundColor Cyan
kubectl delete -f ingress/ --ignore-not-found=true
Write-Host "✓ Ingress deleted" -ForegroundColor Green

# Delete HPA
Write-Host "`n[Step 2] Deleting HPA..." -ForegroundColor Cyan
kubectl delete -f apps/hpa.yaml --ignore-not-found=true
Write-Host "✓ HPA deleted" -ForegroundColor Green

# Delete Application Services
Write-Host "`n[Step 3] Deleting Application Services..." -ForegroundColor Cyan
$apps = @("svelte-web", "graphql-gateway", "notification-service", "analytics-service", "file-service", "task-service", "auth-service")
foreach ($app in $apps) {
    Write-Host "  - Deleting $app..." -ForegroundColor Gray
    kubectl delete -f "apps/$app/" --ignore-not-found=true 2>$null
}
Write-Host "✓ Application services deleted" -ForegroundColor Green

if (-not $KeepInfra) {
    # Delete Infrastructure
    Write-Host "`n[Step 4] Deleting Infrastructure..." -ForegroundColor Cyan
    $infra = @("minio", "pulsar", "timescaledb", "redis", "postgres")
    foreach ($i in $infra) {
        Write-Host "  - Deleting $i..." -ForegroundColor Gray
        # delete all yaml files except pvc.yaml
        Get-ChildItem -Path "infrastructure/$i/" -Filter "*.yaml" | Where-Object { $_.Name -ne "pvc.yaml" } | ForEach-Object {
            kubectl delete -f $_.FullName --ignore-not-found=true 2>$null
        }
    }
    Write-Host "✓ Infrastructure deleted" -ForegroundColor Green
} else {
    Write-Host "`n[Step 4] Keeping Infrastructure (--KeepInfra flag)" -ForegroundColor Yellow
}

if (-not $KeepData) {
    # Delete PVCs
    Write-Host "`n[Step 5] Deleting Persistent Volume Claims..." -ForegroundColor Cyan
    kubectl delete pvc --all -n task-platform-infra --ignore-not-found=true
    Write-Host "✓ PVCs deleted" -ForegroundColor Green

    # Delete Namespaces (optional - delete everything in the namespace)
    $deleteNamespaces = Read-Host "Delete namespaces too? (y/n)"
    if ($deleteNamespaces -eq "y") {
        kubectl delete -f namespaces/ --ignore-not-found=true
        Write-Host "✓ Namespaces deleted" -ForegroundColor Green
    } else {
        Write-Host "  Namespaces kept" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[Step 5] Keeping PVCs (--KeepData flag)" -ForegroundColor Yellow
    Write-Host "`n[Step 6] Keeping Namespaces (--KeepData flag)" -ForegroundColor Yellow
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

# Show status
Write-Host "`nRemaining resources:" -ForegroundColor Yellow
kubectl get all -n task-platform-infra 2>$null
kubectl get all -n task-platform-apps 2>$null
