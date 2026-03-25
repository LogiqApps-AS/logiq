# Azure Container App Deployment Issue - Root Cause Analysis

## Issue Summary
**Problem:** Azure Container Apps do not automatically redeploy when new Docker images with the `latest` tag are pushed to Azure Container Registry (ACR).

**Impact:** Manual intervention required to trigger deployments after CI/CD pipeline completes.

**Date Identified:** March 11, 2026

---

## Root Cause Analysis

### 1. **Azure Container Apps Behavior**

Azure Container Apps **do NOT automatically pull and redeploy** when a new image with the same tag (e.g., `latest`) is pushed to the registry.

**Why?**
- Container Apps cache the image digest/SHA256 hash
- When you push a new image with tag `latest`, the tag points to a new digest
- However, Container Apps continue running the old digest unless explicitly told to update
- This is by design for stability and predictability

### 2. **Current Workflow Gap**

The existing GitHub Actions workflow (`docker-build-push.yml`) only:
- ✅ Builds Docker images
- ✅ Pushes images to ACR with `latest` tag
- ❌ **Does NOT trigger Azure Container App deployment**

**Missing Steps:**
```yaml
# Current workflow ends here:
- Build image
- Push to ACR with tag 'latest'
# ❌ No deployment trigger

# What's needed:
- Build image
- Push to ACR with tag 'latest'
# ✅ Trigger Container App to pull new image
```

### 3. **Technical Details**

**Docker Tag Behavior:**
- Tags like `latest` are **mutable** - they can point to different images over time
- Azure Container Apps use **immutable image digests** (SHA256 hashes)
- Pushing a new `latest` tag updates the tag pointer in ACR but doesn't notify Container Apps

**Azure Container Apps Deployment:**
- Requires explicit API call to update the container configuration
- Can be triggered via:
  - Azure CLI: `az containerapp update`
  - Azure Portal: Manual revision creation
  - GitHub Actions: `azure/container-apps-deploy-action`
  - Azure Resource Manager (ARM) templates

---

## Solution Implemented

### Added Deployment Jobs to Workflow

**New Jobs:**
1. `deploy-api` - Deploys API container after build
2. `deploy-webapp` - Deploys WebApp container after build

**Key Features:**
- ✅ Runs only when images are pushed (same condition as build jobs)
- ✅ Uses Azure service principal authentication
- ✅ Explicitly updates Container App with new `latest` image
- ✅ Triggers automatic revision creation in Azure
- ✅ Respects environment configuration

### Workflow Structure

```yaml
jobs:
  build-and-push-api:
    # Builds and pushes API image
    
  build-and-push-webapp:
    # Builds and pushes WebApp image
    
  deploy-api:
    needs: build-and-push-api
    # Triggers Azure Container App deployment for API
    
  deploy-webapp:
    needs: build-and-push-webapp
    # Triggers Azure Container App deployment for WebApp
```

### Required GitHub Secrets

The following secrets must be added to your GitHub repository:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `AZURE_CREDENTIALS` | Service principal JSON for Azure authentication | See setup instructions below |
| `API_CONTAINER_APP_NAME` | Name of the API Container App | From Azure Portal |
| `WEBAPP_CONTAINER_APP_NAME` | Name of the WebApp Container App | From Azure Portal |
| `AZURE_RESOURCE_GROUP` | Resource group containing Container Apps | From Azure Portal |
| `REGISTRY` | ACR login server (e.g., `myacr.azurecr.io`) | Already configured |

---

## Setup Instructions

### 1. Create Service Principal for Deployment

```bash
# Get your subscription ID
az account show --query id -o tsv

# Create service principal with Contributor role on resource group
az ad sp create-for-rbac \
  --name "github-actions-logiq-deploy" \
  --role Contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP_NAME> \
  --sdk-auth

# Output will be JSON - copy this entire output
```

**Expected Output:**
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 2. Add GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → Environment secrets (Env)**

Add the following secrets:

1. **AZURE_CREDENTIALS**
   - Value: Paste the entire JSON output from step 1

2. **API_CONTAINER_APP_NAME**
   - Value: Your API Container App name (e.g., `logiq-api`)
   - Find it: `az containerapp list -g <RESOURCE_GROUP> --query "[].name" -o tsv`

3. **WEBAPP_CONTAINER_APP_NAME**
   - Value: Your WebApp Container App name (e.g., `logiq-webapp`)
   - Find it: `az containerapp list -g <RESOURCE_GROUP> --query "[].name" -o tsv`

4. **AZURE_RESOURCE_GROUP**
   - Value: Your resource group name (e.g., `logiq-prod-rg`)

### 3. Verify Container App Configuration

Ensure your Container Apps are configured to pull from ACR:

```bash
# Check API Container App
az containerapp show \
  --name <API_CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.template.containers[0].image" -o tsv

# Check WebApp Container App
az containerapp show \
  --name <WEBAPP_CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.template.containers[0].image" -o tsv
```

Expected output: `<registry>.azurecr.io/logiq-api:latest`

---

## Deployment Flow

### Before (Broken)
```
1. Push to main branch
2. GitHub Actions builds images
3. Images pushed to ACR with 'latest' tag
4. ❌ Container Apps continue running old version
5. ❌ Manual intervention required to deploy
```

### After (Fixed)
```
1. Push to main branch
2. GitHub Actions builds images
3. Images pushed to ACR with 'latest' tag
4. ✅ GitHub Actions triggers Container App update
5. ✅ Azure creates new revision with new image
6. ✅ Traffic automatically switches to new revision
7. ✅ Deployment complete - no manual intervention
```

---

## Deployment Triggers

The deployment jobs run when:
- ✅ **Push to main branch** - Automatic deployment
- ✅ **Git tags (v*.*.*)** - Automatic deployment
- ✅ **Manual workflow** with `push_images=true` - Automatic deployment
- ❌ **Pull requests** - No deployment (build-only validation)
- ❌ **Manual workflow** with `push_images=false` - No deployment

---

## Monitoring and Verification

### Check Deployment Status

**Via GitHub Actions:**
1. Go to Actions tab
2. Click on the workflow run
3. Check `deploy-api` and `deploy-webapp` job status

**Via Azure CLI:**
```bash
# List revisions for API
az containerapp revision list \
  --name <API_CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "[].{Name:name, Active:properties.active, Created:properties.createdTime}" -o table

# List revisions for WebApp
az containerapp revision list \
  --name <WEBAPP_CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "[].{Name:name, Active:properties.active, Created:properties.createdTime}" -o table
```

**Via Azure Portal:**
1. Navigate to Container App
2. Click "Revision management"
3. See active revision and deployment history

### Verify Image Digest

```bash
# Check what image digest is currently deployed
az containerapp revision show \
  --name <REVISION_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.template.containers[0].image" -o tsv
```

---

## Troubleshooting

### Issue: Deployment fails with authentication error

**Solution:**
- Verify `AZURE_CREDENTIALS` secret is correctly formatted JSON
- Ensure service principal has Contributor role on resource group
- Check service principal hasn't expired

```bash
# Test service principal
az login --service-principal \
  --username <clientId> \
  --password <clientSecret> \
  --tenant <tenantId>
```

### Issue: Container App not found

**Solution:**
- Verify `API_CONTAINER_APP_NAME` and `WEBAPP_CONTAINER_APP_NAME` are correct
- Ensure `AZURE_RESOURCE_GROUP` matches where Container Apps are deployed
- Check Container Apps exist:

```bash
az containerapp list -g <RESOURCE_GROUP> -o table
```

### Issue: Image pull fails

**Solution:**
- Verify Container App has ACR credentials configured
- Check ACR admin credentials or managed identity is set up

```bash
# Check Container App registry configuration
az containerapp show \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.configuration.registries" -o json
```

### Issue: Deployment succeeds but old version still running

**Solution:**
- Check if multiple revisions are active with traffic split
- Ensure revision mode is set to "Single" not "Multiple"

```bash
# Check revision mode
az containerapp show \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.configuration.activeRevisionsMode" -o tsv
```

---

## Best Practices

### 1. Use Semantic Versioning for Production

While `latest` works for development, use semantic versioning for production:

```yaml
# Push with specific version
docker push myacr.azurecr.io/logiq-api:v1.2.3
docker push myacr.azurecr.io/logiq-api:latest
```

Deploy specific versions:
```yaml
imageToDeploy: ${{ secrets.REGISTRY }}/logiq-api:${{ github.ref_name }}
```

### 2. Enable Revision History

Keep multiple revisions for quick rollback:

```bash
az containerapp revision list \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP>
```

### 3. Implement Health Checks

Ensure Container Apps have proper health probes:

```bash
az containerapp show \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query "properties.template.containers[0].probes" -o json
```

### 4. Monitor Deployments

Set up alerts for deployment failures:
- Azure Monitor alerts on Container App revision failures
- GitHub Actions notifications on workflow failures

---

## Alternative Solutions (Not Implemented)

### Option 1: Azure Container Registry Webhooks
- Configure ACR webhook to trigger Azure Container App update
- **Pros:** No GitHub Actions changes needed
- **Cons:** Less control, harder to debug, no CI/CD integration

### Option 2: Azure DevOps Pipelines
- Use Azure Pipelines instead of GitHub Actions
- **Pros:** Native Azure integration
- **Cons:** Requires Azure DevOps setup, less GitHub integration

### Option 3: Manual Deployment
- Keep current workflow, deploy manually via Azure CLI
- **Pros:** Simple workflow
- **Cons:** Manual intervention required, not automated

### Option 4: Use Image Digest Instead of Tags
- Deploy using SHA256 digest instead of `latest` tag
- **Pros:** Immutable deployments
- **Cons:** More complex workflow, harder to track versions

**Selected Solution:** GitHub Actions deployment jobs (Option implemented)
- Best balance of automation, control, and maintainability
- Integrates seamlessly with existing CI/CD pipeline
- Clear audit trail in GitHub Actions

---

## Summary

**Root Cause:** Azure Container Apps do not automatically detect and deploy new images pushed with the same tag (`latest`).

**Solution:** Added explicit deployment steps to GitHub Actions workflow that trigger Azure Container App updates after images are pushed.

**Result:** Fully automated CI/CD pipeline from code commit to production deployment.

**Status:** ✅ Fixed - Deployment now automatic on every push to main branch.

---

## References

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Azure Container Apps Deploy Action](https://github.com/Azure/container-apps-deploy-action)
- [Docker Tag Best Practices](https://docs.docker.com/engine/reference/commandline/tag/)
