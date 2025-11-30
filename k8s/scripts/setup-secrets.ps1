# ============================================
# Setup Secrets Script
# ==========================================
# This script creates a secrets.yaml file from a template
# and applies it to the Kubernetes cluster.

param(
    [switch]$ApplyToCluster,   # Apply to cluster
    [switch]$UseDefaults       # Use default values ​​(for development)
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Setup Kubernetes Secrets" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$k8sRoot = Split-Path -Parent $PSScriptRoot
Set-Location $k8sRoot

# Default value for Development
$defaults = @{
    # PostgreSQL
    "POSTGRES_USER" = "taskuser"
    "POSTGRES_PASSWORD" = "taskpass"
    "POSTGRES_DB" = "taskdb"
    
    # TimescaleDB
    "TIMESCALE_USER" = "analyticsuser"
    "TIMESCALE_PASSWORD" = "analyticspass"
    "TIMESCALE_DB" = "analyticsdb"
    
    # MinIO
    "MINIO_ROOT_USER" = "minioadmin"
    "MINIO_ROOT_PASSWORD" = "minioadmin"
    
    # JWT
    "JWT_SECRET" = "your_jwt_secret_key_change_in_production_min_32_chars"
}

# Function for asking value from user
function Get-SecretValue {
    param(
        [string]$Name,
        [string]$Default,
        [switch]$IsPassword
    )
    
    if ($UseDefaults) {
        return $Default
    }
    
    if ($IsPassword) {
        $prompt = "$Name [default: ***hidden***]"
    } else {
        $prompt = "$Name [default: $Default]"
    }
    
    $value = Read-Host $prompt
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }
    return $value
}
# Function for copying and replacing values ​​in template.
function Copy-AndReplaceTemplate {
    param(
        [string]$TemplatePath,
        [string]$OutputPath,
        [hashtable]$Replacements
    )
    if (-not (Test-Path $TemplatePath)) {
        Write-Host "  ✗ Template not found: $TemplatePath" -ForegroundColor Red
        return $false
    }
    # Read content template and replace
    $content = Get-Content -Path $TemplatePath -Raw
    foreach ($key in $Replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $Replacements[$key]
    }
    # Save to output path
    $content | Out-File -FilePath $OutputPath -Encoding UTF8 -NoNewline
    Write-Host "  ✓ $OutputPath (from $TemplatePath)" -ForegroundColor Green
    return $true
}

Write-Host "`n[Step 1] Gathering Secret Values..." -ForegroundColor Yellow
if (-not $UseDefaults) {
    Write-Host "Press Enter to use default values, or type new values." -ForegroundColor Gray
    Write-Host "For production, use strong passwords!" -ForegroundColor Red
}
# Collect various values
$secrets = @{}
Write-Host "`n--- PostgreSQL ---" -ForegroundColor Cyan
$secrets.POSTGRES_USER = Get-SecretValue -Name "PostgreSQL Username" -Default $defaults.POSTGRES_USER
$secrets.POSTGRES_PASSWORD = Get-SecretValue -Name "PostgreSQL Password" -Default $defaults.POSTGRES_PASSWORD -IsPassword
$secrets.POSTGRES_DB = Get-SecretValue -Name "PostgreSQL Database" -Default $defaults.POSTGRES_DB
Write-Host "`n--- TimescaleDB ---" -ForegroundColor Cyan
$secrets.TIMESCALE_USER = Get-SecretValue -Name "TimescaleDB Username" -Default $defaults.TIMESCALE_USER
$secrets.TIMESCALE_PASSWORD = Get-SecretValue -Name "TimescaleDB Password" -Default $defaults.TIMESCALE_PASSWORD -IsPassword
$secrets.TIMESCALE_DB = Get-SecretValue -Name "TimescaleDB Database" -Default $defaults.TIMESCALE_DB
Write-Host "`n--- MinIO ---" -ForegroundColor Cyan
$secrets.MINIO_ROOT_USER = Get-SecretValue -Name "MinIO Root User" -Default $defaults.MINIO_ROOT_USER
$secrets.MINIO_ROOT_PASSWORD = Get-SecretValue -Name "MinIO Root Password" -Default $defaults.MINIO_ROOT_PASSWORD -IsPassword
Write-Host "`n--- JWT ---" -ForegroundColor Cyan
$secrets.JWT_SECRET = Get-SecretValue -Name "JWT Secret (min 32 chars)" -Default $defaults.JWT_SECRET -IsPassword


Write-Host "`n[Step 2] Creating Secret Files from Templates..." -ForegroundColor Yello
# PostgreSQL Secret
Copy-AndReplaceTemplate `
    -TemplatePath "infrastructure/postgres/secret.yaml.example" `
    -OutputPath "infrastructure/postgres/secret.yaml" `
    -Replacements @{
        "<USERNAME>" = $secrets.POSTGRES_USER
        "<PASSWORD>" = $secrets.POSTGRES_PASSWORD
        "<DATABASE>" = $secrets.POSTGRES_DB
    }

# TimescaleDB Secret
Copy-AndReplaceTemplate `
    -TemplatePath "infrastructure/timescaledb/secret.yaml.example" `
    -OutputPath "infrastructure/timescaledb/secret.yaml" `
    -Replacements @{
        "<USERNAME>" = $secrets.TIMESCALE_USER
        "<PASSWORD>" = $secrets.TIMESCALE_PASSWORD
        "<DATABASE>" = $secrets.TIMESCALE_DB
    }

# MinIO Secret
Copy-AndReplaceTemplate `
    -TemplatePath "infrastructure/minio/secret.yaml.example" `
    -OutputPath "infrastructure/minio/secret.yaml" `
    -Replacements @{
        "<ROOT_USER>" = $secrets.MINIO_ROOT_USER
        "<ROOT_PASSWORD>" = $secrets.MINIO_ROOT_PASSWORD
    }

# Auth Service Secret
Copy-AndReplaceTemplate `
    -TemplatePath "apps/auth-service/secret.yaml.example" `
    -OutputPath "apps/auth-service/secret.yaml" `
    -Replacements @{
        "<USER>" = $secrets.POSTGRES_USER
        "<PASSWORD>" = $secrets.POSTGRES_PASSWORD
        "<DATABASE>" = $secrets.POSTGRES_DB
        "<JWT_SECRET>" = $secrets.JWT_SECRET
    }

# Task Service Secret
Copy-AndReplaceTemplate `
    -TemplatePath "apps/task-service/secret.yaml.example" `
    -OutputPath "apps/task-service/secret.yaml" `
    -Replacements @{
        "<USER>" = $secrets.POSTGRES_USER
        "<PASSWORD>" = $secrets.POSTGRES_PASSWORD
        "<DATABASE>" = $secrets.POSTGRES_DB
    }

# File Service Secret
Copy-AndReplaceTemplate `
    -TemplatePath "apps/file-service/secret.yaml.example" `
    -OutputPath "apps/file-service/secret.yaml" `
    -Replacements @{
        "<USER>" = $secrets.POSTGRES_USER
        "<PASSWORD>" = $secrets.POSTGRES_PASSWORD
        "<DATABASE>" = $secrets.POSTGRES_DB
        "<MINIO_ROOT_USER>" = $secrets.MINIO_ROOT_USER
        "<MINIO_ROOT_PASSWORD>" = $secrets.MINIO_ROOT_PASSWORD
    }

# Analytics Service Secret (ใช้ TimescaleDB)
Copy-AndReplaceTemplate `
    -TemplatePath "apps/analytics-service/secret.yaml.example" `
    -OutputPath "apps/analytics-service/secret.yaml" `
    -Replacements @{
        "<USER>" = $secrets.TIMESCALE_USER
        "<PASSWORD>" = $secrets.TIMESCALE_PASSWORD
        "<DATABASE>" = $secrets.TIMESCALE_DB
    }

Write-Host "`n[Step 3] Summary" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Secret files created successfully!" -ForegroundColor Green

if ($ApplyToCluster) {
    Write-Host "`n[Step 4] Applying Secrets to Cluster..." -ForegroundColor Yellow
    # Namespaces must be created first.
    kubectl apply -f namespaces/ 2>$null
    
    kubectl apply -f infrastructure/postgres/secret.yaml
    kubectl apply -f infrastructure/timescaledb/secret.yaml
    kubectl apply -f infrastructure/minio/secret.yaml
    kubectl apply -f apps/auth-service/secret.yaml
    kubectl apply -f apps/task-service/secret.yaml
    kubectl apply -f apps/file-service/secret.yaml
    kubectl apply -f apps/analytics-service/secret.yaml
    Write-Host "`n✓ All secrets applied to cluster!" -ForegroundColor Green
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
