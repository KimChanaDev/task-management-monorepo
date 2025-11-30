# 🚀 Kubernetes Quick Start Guide - Task Platform

## Step 1: Install Tools

### Install Chocolatey (if not already installed)

[Chocolatey](https://chocolatey.org/install)

### Install Minikube and kubectl

```powershell
choco install minikube kubernetes-cli -y
minikube version
kubectl version --client
```

## Step 2: Start Minikube

```powershell
minikube start --driver=docker --cpus=6 --memory=8192 --disk-size=50g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

minikube status
```

## Step 3: Setup secrets

```powershell
# -UseDefaults (optional) use default value of secrets
# -ApplyToCluster (optionl) apply to cluster after secrets created
.\scripts\setup-secrets.ps1 -UseDefaults
```

## Step 4: Deploy Application

```powershell
# Go to project directory
cd c:\Users\User\Desktop\NewLife\Udemy\Microservices\Personal1\task-realtime-management

# Run deploy script
# -WaitForReady (optional) for wait all pod to ready state
# -SkipBuild (optional) for not building Docker images, use the existing minikube daemon
.\k8s\scripts\deploy-all.ps1 -WaitForReady
```

## Step 5: Access Application

**ใช้ Ingress**

```powershell
# add hosts file entry (run PowerShell as Administrator)
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1 task-platform.local"
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1 api.task-platform.local"

# Run minikube tunnel (in a separate terminal)
minikube tunnel
```

Open your browser to: http://task-platform.local

---

## Optional: Delete Application

```powershell
# -KeepData (optional) for keep pvc (data) and namespaces
# -KeepInfra (optional) for keep infrastructure, remove data if not -KeepData
# -Force (optional) not ask for confirmation
.\k8s\scripts\delete-all.ps1
```

## Optional: Mornitoring

```powershell
.\k8s\scripts\status.ps1
```

## Frequently used commands

```powershell
# inspect pods
kubectl get pods -n task-platform-apps
kubectl get pods -n task-platform-infra

# inspect logs
kubectl logs -f deployment/auth-service -n task-platform-apps

# interact with the container
kubectl exec -it deployment/auth-service -n task-platform-apps -- /bin/sh

# Restart deployment (Usually used when editing code, then rebuilding the Docker image)
kubectl rollout restart deployment/auth-service -n task-platform-apps

# Apply menifest to cluster (Usually used when editing menifest yaml file)
kubectl apply -f apps/auth-service/ -n task-platform-apps
```

## Port Mappings

| Service              | HTTP Port | gRPC Port | Description     |
| -------------------- | --------- | --------- | --------------- |
| svelte-web           | 4003      | -         | Frontend        |
| graphql-gateway      | 4002      | -         | GraphQL API     |
| auth-service         | 4000      | 5000      | Authentication  |
| task-service         | 4001      | 5001      | Task Management |
| analytics-service    | 4005      | 5005      | Analytics       |
| file-service         | 4006      | 50046     | File Storage    |
| notification-service | 4004      | -         | WebSocket       |
| postgres             | 5432      | -         | Primary DB      |
| redis                | 6379      | -         | Cache           |
| timescaledb          | 5432      | -         | Time-series DB  |
| pulsar               | 6650      | 8080      | Message Broker  |
| minio                | 9000      | 9001      | Object Storage  |
