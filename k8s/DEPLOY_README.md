# 🚀 Deployment Guide

> This guide will help you deploy the Application on Vultr Kubernetes Engine

---

## 1. Create Kubernetes Cluster

### Step 1: Login to Vultr Dashboard

1. Go to [my.vultr.com](https://my.vultr.com/)
2. Login with your registered account

### Step 2: Create Kubernetes Cluster

1. From the left menu, select **"Products"** → **"Kubernetes"**
2. Click **"Add Cluster"** or **"Deploy Cluster"**

### Step 3: Configure Cluster

```yaml
# Recommended settings for testing
Cluster Label: task-platform-cluster
Kubernetes Version: Latest stable (1.34.1+2 or newer)
Location: Singapore (sgp)

# Node Pools
Node Pool Label: worker-pool
Node Type:
  - vc2-2c-2gb ($15/mo)
Number of Nodes:
  - 2-3 nodes
```

### Step 4: Deploy Cluster

1. Review configuration
2. Click **"Deploy Now"**
3. Wait approximately **3-5 minutes** until status becomes **"Running"**

---

## 2. Install and Configure kubectl on Local Machine

### Step 1: Install kubectl (if not already installed)

- https://kubernetes.io/docs/tasks/tools/

#### Verify Installation

```powershell
kubectl version --client
```

### Step 2: Download Kubeconfig from Vultr

1. Go to **Kubernetes** in Vultr Dashboard
2. Select the cluster you created
3. Click **"Download Configuration"**
4. Save the file (e.g., `vke-xxxxxx-xxxx.yaml`)

### Step 3: Configure Kubeconfig

#### Windows PowerShell

1. Copy the downloaded kubeconfig and replace the existing config at C:\Users\User\.kube\

### Step 4: Test Connection

```powershell
# View nodes in cluster
kubectl get nodes

# View namespaces
kubectl get namespaces

# View all pods
kubectl get pods --all-namespaces
```

#### ✅ Expected Output

```
NAME                              STATUS   ROLES    AGE   VERSION
worker-pool-xxxx                  Ready    <none>   5m    v1.34.1
```

### Step 5: Enable metrics-server on Vultr

```powershell
# 1) Install metrics-server with official manifest
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2) Edit metrics-server deployment to support insecure TLS (required on Vultr)
kubectl -n kube-system edit deployment metrics-server
# Then modify spec.template.spec.containers[0].args to include:
args:
  - --kubelet-insecure-tls
  - --kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS,ExternalDNS
# Keep any existing args

# 3) Wait for metrics-server to be ready
kubectl get pods -n kube-system | grep metrics
```

### Step 6: Install NGINX Ingress Controller

```powershell
# Install NGINX Ingress Controller on Vultr
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.1/deploy/static/provider/cloud/deploy.yaml

# Wait a moment, then verify installation is complete
kubectl get pods -n ingress-nginx

# Check if NGINX has received an External IP
kubectl get svc -n ingress-nginx
```

### Step 7: Encode kubeconfig to base64

#### Windows PowerShell

```powershell
# Read file and convert to base64
$kubeconfigPath = "$env:USERPROFILE\.kube\config"
$kubeconfigContent = Get-Content $kubeconfigPath -Raw
$base64Config = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($kubeconfigContent))

# Display result (copy for use)
$base64Config | Set-Clipboard
Write-Host "Base64 kubeconfig copied to clipboard!"

# Or save to file
$base64Config | Out-File -FilePath "kubeconfig-base64.txt"
Write-Host "Saved to kubeconfig-base64.txt"
```

**Expected Output:**

```
NAME                       TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
ingress-nginx-controller   LoadBalancer   10.96.xxx.xxx  123.45.67.89     80:xxxxx/TCP,443:xxxxx/TCP
```

> ⏳ **Note:** `EXTERNAL-IP` may show as `<pending>` for a moment. Wait 2-5 minutes.

---

## 3. GitHub Settings

### Step 1: Create Environment Secrets

1. Go to Settings → Environments → New environment → create production and staging
2. Add DOMAIN_NAME using (External-IP from nginx load balancer).nip.io or production domain name
3. Add KUBE_CONFIG using base64 encoded kube config from Vultr
4. Add POSTGRES_USER
5. Add POSTGRES_PASSWORD
6. Add POSTGRES_DB
7. Add TIMESCALEDB_USER
8. Add TIMESCALEDB_PASSWORD
9. Add TIMESCALEDB_DB
10. Add MINIO_ROOT_USER
11. Add MINIO_ROOT_PASSWORD
12. Add JWT_SECRET

### Step 2: Create Action Secrets

1. Go to Settings → Secrets and variables → Actions → new repository secrets
2. Add SLACK_WEBHOOK_URL
3. Add CODECOV_TOKEN from [CodeCov](https://about.codecov.io/) for CI process

#### How to Create Slack Webhook

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new App or use an existing one
3. Enable **Incoming Webhooks**
4. Click **Add New Webhook to Workspace**
5. Select the desired channel
6. Copy Webhook URL

---

## 4. Test Deployment

### Step 1: Push Code to GitHub and Verify Actions Build Docker Image to GCR

1. Go to Repository → **Actions**
2. Check if workflow "Docker Build & Push" exists
3. If not, manually run workflow "Docker Build & Push" by clicking **"Run workflow"**

### Step 2: Run Deploy Workflow

1. Go to Repository → **Actions**
2. Select **"Deploy to Kubernetes"**
3. Click **"Run workflow"**
4. Select:
   - **Environment**: `production`
   - **Service**: `all` (or select specific service)
   - **Image tag**: `main`
   - **Protocol**: `http`
   - **Cookies Secure**: `false`
5. Click **"Run workflow"**

### Step 3: Verify Results

#### View in GitHub Actions

1. Click to view workflow run
2. Check each step

#### View in Vultr/kubectl

```powershell
# View pods
kubectl get pods -n task-platform-apps

# View services
kubectl get svc -n task-platform-apps

# View deployments
kubectl get deployments -n task-platform-apps

# View pod logs
kubectl logs <pod-name> -n task-platform-apps
```

#### View in Browser (External IP).nip.io if the following conditions are met:

1. DOMAIN_NAME uses (External-IP from nginx load balancer).nip.io
2. Deploy Workflow run with Protocol: http and Cookies Secure: false

---

## 5. Use Domain Name and Configure SSL/TLS with Cloudflare

### Step 1: Sign Up for Cloudflare

1. Go to [Cloudflare](https://cloudflare.com)

### Step 2: Add Domain to Cloudflare

1. Click **Add a Site**
2. Enter your domain (e.g., `yourdomain.com`)
3. Select **Free Plan** → Click **Continue**
4. Cloudflare will scan existing DNS records

### Step 3: Add DNS Records

Add A Record pointing to Vultr IP:

```
Type: A
Name: @ (means root domain)
Content: 123.45.67.89 (External IP from kubectl get svc -n ingress-nginx)
Proxy status: Proxied (🟠 orange cloud)
TTL: Auto
```

### Step 4: Change Nameservers at Your Domain Registrar (e.g., GoDaddy)

1. Cloudflare will display 2 Nameservers, e.g.:

   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

2. Go to GoDaddy → My Products → Domain → DNS
3. Find **Nameservers** → Click **Change Nameservers**
4. Select **I'll use my own nameservers**
5. Enter Cloudflare Nameservers
6. Save

### Step 5: Configure SSL in Cloudflare

1. Go to **SSL/TLS** in the left menu
2. Select **Full** (recommended)
3. Enable **Always Use HTTPS**

### Step 6: Wait for DNS Propagation

- Wait 5 minutes - 24 hours (usually no more than 1-2 hours)
- Check at [whatsmydns](https://www.whatsmydns.net/)

### Step 7: Update Ingress to Use Your Domain Name

1. Go to Github Repository → **Actions**
2. Select **"Update Domain Configuration"**
3. Click **"Run workflow"**
4. Select:
   - **Environment**: `production`
   - **New domain**: `your-domain.com`
   - **Protocol**: `https`
   - **Cookies Secure**: `true`
5. Click **"Run workflow"**

### Step 8: Access Application with Your Domain Name

1. Open your browser at (https://your-domain.com)

---
