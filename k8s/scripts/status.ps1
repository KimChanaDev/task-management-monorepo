# =======================================================
# Status Check Script All resources in Kubernetes cluster
# =======================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Task Platform Status Check" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Check Minikube
Write-Host "`n[Minikube Status]" -ForegroundColor Yellow
minikube status

# Check Namespaces
Write-Host "`n[Namespaces]" -ForegroundColor Yellow
kubectl get namespaces | Select-String "task-platform"

# Infrastructure
Write-Host "`n[Infrastructure Services - task-platform-infra]" -ForegroundColor Yellow
Write-Host "Pods:" -ForegroundColor Gray
kubectl get pods -n task-platform-infra -o wide
Write-Host "`nServices:" -ForegroundColor Gray
kubectl get svc -n task-platform-infra
Write-Host "`nPVCs:" -ForegroundColor Gray
kubectl get pvc -n task-platform-infra

# Applications
Write-Host "`n[Application Services - task-platform-apps]" -ForegroundColor Yellow
Write-Host "Pods:" -ForegroundColor Gray
kubectl get pods -n task-platform-apps -o wide
Write-Host "`nServices:" -ForegroundColor Gray
kubectl get svc -n task-platform-apps
Write-Host "`nHPA:" -ForegroundColor Gray
kubectl get hpa -n task-platform-apps

# Ingress
Write-Host "`n[Ingress]" -ForegroundColor Yellow
kubectl get ingress -n task-platform-apps

# Monitoring (if exists)
Write-Host "`n[Monitoring Services - task-platform-monitor]" -ForegroundColor Yellow
kubectl get pods -n task-platform-monitor 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Monitoring namespace not found or no pods" -ForegroundColor Gray
}

# Resource Usage
Write-Host "`n[Resource Usage]" -ForegroundColor Yellow
kubectl top nodes 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Metrics server not available. Enable with: minikube addons enable metrics-server" -ForegroundColor Gray
}

# Recent Events
Write-Host "`n[Recent Events (last 5)]" -ForegroundColor Yellow
kubectl get events -n task-platform-apps --sort-by='.lastTimestamp' 2>$null | Select-Object -Last 5

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Status check complete" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan

# Quick tips
Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:       kubectl logs -f <pod-name> -n task-platform-apps" -ForegroundColor White
Write-Host "  Describe pod:    kubectl describe pod <pod-name> -n task-platform-apps" -ForegroundColor White
Write-Host "  Shell into pod:  kubectl exec -it <pod-name> -n task-platform-apps -- /bin/sh" -ForegroundColor White
Write-Host "  Watch pods:      kubectl get pods -n task-platform-apps -w" -ForegroundColor White
