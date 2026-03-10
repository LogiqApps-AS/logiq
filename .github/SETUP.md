# GitHub Actions Setup Guide

This guide will help you set up GitHub Actions for automated Docker image builds and deployments to Azure Container Registry.

## Prerequisites

- Azure subscription
- Azure CLI installed
- GitHub repository with admin access
- Docker installed locally (for testing)

## Step-by-Step Setup

### 1. Create Azure Container Registry

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="logiq-rg"
LOCATION="eastus"
ACR_NAME="logiqacr"  # Must be globally unique, lowercase, alphanumeric only

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create container registry (Basic tier for development, Standard/Premium for production)
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic

# Get the login server URL (save this for GitHub secrets)
ACR_LOGIN_SERVER=$(az acr show \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv)

echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

### 2. Create Service Principal

Create a service principal with push permissions to ACR:

```bash
# Get ACR resource ID
ACR_ID=$(az acr show \
  --name $ACR_NAME \
  --query id \
  --output tsv)

# Create service principal with AcrPush role
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "github-actions-logiq" \
  --role AcrPush \
  --scopes $ACR_ID \
  --sdk-auth)

# Display the output (SAVE THIS - you'll need it for GitHub)
echo "$SP_OUTPUT"
```

The output will look like:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**Save the `clientId` and `clientSecret` values!**

### 3. Configure GitHub Secrets

Go to your GitHub repository:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `ACR_LOGIN_SERVER` | `logiqacr.azurecr.io` | From step 1 output |
| `ACR_USERNAME` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `clientId` from step 2 |
| `ACR_PASSWORD` | `xxxxxxxxxxxxxxxxxxxxxxxxxx` | `clientSecret` from step 2 |

### 4. Test the Setup

#### Test ACR Login Locally

```bash
# Login using service principal
az acr login \
  --name $ACR_NAME \
  --username <ACR_USERNAME> \
  --password <ACR_PASSWORD>

# Should output: "Login Succeeded"
```

#### Test Docker Build Locally

```bash
# Build API image
cd api
docker build -t logiqacr.azurecr.io/logiq-api:test .

# Build WebApp image
cd ../webapp
docker build -t logiqacr.azurecr.io/logiq-webapp:test .

# Push test images
docker push logiqacr.azurecr.io/logiq-api:test
docker push logiqacr.azurecr.io/logiq-webapp:test
```

### 5. Trigger First Build

#### Option A: Push to Main Branch

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

#### Option B: Create a Release Tag

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

### 6. Monitor the Build

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Click on the running workflow
4. Watch the build progress in real-time

### 7. Verify Images in ACR

```bash
# List all repositories
az acr repository list \
  --name $ACR_NAME \
  --output table

# List tags for API image
az acr repository show-tags \
  --name $ACR_NAME \
  --repository logiq-api \
  --output table

# List tags for WebApp image
az acr repository show-tags \
  --name $ACR_NAME \
  --repository logiq-webapp \
  --output table
```

Expected output:
```
Result
--------
latest
main
v1.0.0
1.0.0
1.0
1
```

## Optional: Enable Security Scanning

### Enable GitHub Advanced Security (for private repos)

1. Go to repository **Settings** → **Code security and analysis**
2. Enable **Dependency graph**
3. Enable **Dependabot alerts**
4. Enable **Code scanning** (requires GitHub Advanced Security)

### View Security Scan Results

After the workflow runs:
1. Go to **Security** tab
2. Click **Code scanning**
3. View Trivy scan results for both images

## Production Recommendations

### 1. Use Premium ACR Tier

For production, upgrade to Premium tier for:
- Geo-replication
- Content trust
- Private link
- Increased storage and throughput

```bash
az acr update \
  --name $ACR_NAME \
  --sku Premium
```

### 2. Enable Content Trust

```bash
# Enable content trust
az acr config content-trust update \
  --name $ACR_NAME \
  --status enabled
```

### 3. Set Up Geo-Replication

```bash
# Replicate to another region
az acr replication create \
  --registry $ACR_NAME \
  --location westus
```

### 4. Configure Network Security

```bash
# Restrict access to specific IP ranges
az acr network-rule add \
  --name $ACR_NAME \
  --ip-address 203.0.113.0/24
```

### 5. Enable Diagnostic Logging

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name logiq-logs

# Get workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name logiq-logs \
  --query id \
  --output tsv)

# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name acr-diagnostics \
  --resource $ACR_ID \
  --workspace $WORKSPACE_ID \
  --logs '[{"category": "ContainerRegistryRepositoryEvents", "enabled": true}]' \
  --metrics '[{"category": "AllMetrics", "enabled": true}]'
```

## Troubleshooting

### Issue: "unauthorized: authentication required"

**Solution:** Check that secrets are set correctly in GitHub:
```bash
# Verify service principal still has access
az role assignment list \
  --assignee <ACR_USERNAME> \
  --scope $ACR_ID
```

### Issue: "manifest unknown"

**Solution:** The image doesn't exist yet. Check workflow logs to see if push succeeded.

### Issue: Build fails with "no space left on device"

**Solution:** GitHub Actions runners have limited disk space. Try:
- Reducing image size
- Using multi-stage builds more effectively
- Cleaning up intermediate layers

### Issue: Security scan fails

**Solution:** 
1. Ensure image was pushed successfully
2. Check ACR allows pulling (service principal needs AcrPull or AcrPush role)
3. Review Trivy action logs for specific errors

## Maintenance

### Rotate Service Principal Credentials

Every 90 days (or per your security policy):

```bash
# Create new credential
az ad sp credential reset \
  --id <ACR_USERNAME>

# Update GitHub secret ACR_PASSWORD with new value
```

### Clean Up Old Images

```bash
# Delete images older than 30 days
az acr run \
  --registry $ACR_NAME \
  --cmd "acr purge --filter 'logiq-api:.*' --ago 30d" \
  /dev/null

az acr run \
  --registry $ACR_NAME \
  --cmd "acr purge --filter 'logiq-webapp:.*' --ago 30d" \
  /dev/null
```

### Monitor Costs

```bash
# View ACR costs
az consumption usage list \
  --start-date $(date -d '30 days ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(instanceName, '$ACR_NAME')]"
```

## Next Steps

1. **Set up Azure Container Apps** - Deploy containers from ACR
2. **Configure CD pipeline** - Auto-deploy on successful builds
3. **Add integration tests** - Test images before pushing
4. **Set up monitoring** - Application Insights, Log Analytics
5. **Implement blue-green deployments** - Zero-downtime updates

## Support

For issues or questions:
- Check [GitHub Actions documentation](https://docs.github.com/actions)
- Review [Azure Container Registry docs](https://docs.microsoft.com/azure/container-registry/)
- Open an issue in the repository
