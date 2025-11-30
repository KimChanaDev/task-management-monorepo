# 🔐 Kubernetes Secrets Management Guide

## Overview

This project uses Kubernetes Secrets to store sensitive data such as passwords and API keys.  
**⚠️ The actual `secret.yaml` files are NOT committed to Git**

---

## 📋 Secrets to Create

### Infrastructure Namespace (`task-platform-infra`)

| Secret Name          | Template File                                    | Required Keys                      |
| -------------------- | ------------------------------------------------ | ---------------------------------- |
| `postgres-secret`    | `infrastructure/postgres/secret.yaml.example`    | `username`, `password`, `database` |
| `timescaledb-secret` | `infrastructure/timescaledb/secret.yaml.example` | `username`, `password`, `database` |
| `minio-secret`       | `infrastructure/minio/secret.yaml.example`       | `root-user`, `root-password`       |

### Application Namespace (`task-platform-apps`)

| Secret Name                | Template File                                | Required Keys                                          |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `auth-service-secret`      | `apps/auth-service/secret.yaml.example`      | `database-url`, `jwt-secret`                           |
| `task-service-secret`      | `apps/task-service/secret.yaml.example`      | `database-url`                                         |
| `file-service-secret`      | `apps/file-service/secret.yaml.example`      | `database-url`, `minio-access-key`, `minio-secret-key` |
| `analytics-service-secret` | `apps/analytics-service/secret.yaml.example` | `database-url`                                         |

---

## 🚀 Quick Setup (for Development)

### Method 1: Use Automated Script

```powershell
# Run from k8s directory
.\scripts\setup-secrets.ps1
```

### Method 2: Create Manually

```powershell
# 1. Copy template files
Copy-Item "infrastructure\postgres\secret.yaml.example" "infrastructure\postgres\secret.yaml"
Copy-Item "infrastructure\timescaledb\secret.yaml.example" "infrastructure\timescaledb\secret.yaml"
Copy-Item "infrastructure\minio\secret.yaml.example" "infrastructure\minio\secret.yaml"
Copy-Item "apps\auth-service\secret.yaml.example" "apps\auth-service\secret.yaml"
Copy-Item "apps\task-service\secret.yaml.example" "apps\task-service\secret.yaml"
Copy-Item "apps\file-service\secret.yaml.example" "apps\file-service\secret.yaml"
Copy-Item "apps\analytics-service\secret.yaml.example" "apps\analytics-service\secret.yaml"

# 2. Edit values in each secret.yaml file

# 3. Apply secrets
kubectl apply -f infrastructure/postgres/secret.yaml
kubectl apply -f infrastructure/timescaledb/secret.yaml
# ... and others
```

### Method 3: Create directly with kubectl (no file needed)

```powershell
# PostgreSQL
kubectl create secret generic postgres-secret `
  --from-literal=username=taskuser `
  --from-literal=password=YourStrongPassword123! `
  --from-literal=database=taskdb `
  -n task-platform-infra

# Auth Service
kubectl create secret generic auth-service-secret `
  --from-literal=database-url="postgresql://taskuser:YourPassword@postgres:5432/taskdb?schema=auth" `
  --from-literal=jwt-secret="YourJWTSecretKey" `
  -n task-platform-apps
```

---

## 🔒 Security Best Practices

### Development

- ✅ Can use default values (taskuser/taskpass)
- ✅ Keep secret.yaml files locally
- ⚠️ Do NOT commit to Git

### Production

- ✅ Use External Secrets Operator or Sealed Secrets
- ✅ Use complex passwords (20+ characters, mixed with symbols)
- ✅ Enable encryption at rest in Kubernetes
- ✅ Use RBAC to restrict access to secrets
- ❌ NEVER commit secrets to Git

---

## ❓ Troubleshooting

### Secret not found

```powershell
# Check if secret exists
kubectl get secrets -n task-platform-infra
kubectl get secrets -n task-platform-apps

# View secret details
kubectl describe secret postgres-secret -n task-platform-infra
```

### Pod not starting due to Secret

```powershell
# View events
kubectl describe pod <pod-name> -n task-platform-apps

# You will typically see error:
# "secret 'xxx-secret' not found"
```

### Delete and recreate Secret

```powershell
kubectl delete secret postgres-secret -n task-platform-infra
kubectl apply -f infrastructure/postgres/secret.yaml
```
