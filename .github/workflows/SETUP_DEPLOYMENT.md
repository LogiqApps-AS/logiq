# Azure Container App Deployment Setup Guide

## Quick Setup Checklist

Follow these steps to enable automatic deployment to Azure Container Apps:

- [ ] Create Azure service principal
- [ ] Add GitHub secrets
- [ ] Verify Container App names
- [ ] Test deployment
- [ ] Monitor first deployment

---

## Step 1: Create Azure Service Principal

Create a service principal with permissions to deploy to your Container Apps:

```bash
# Login to Azure
az login

# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Subscription ID: $SUBSCRIPTION_ID"

# Get your resource group name (replace with your actual resource group)
RESOURCE_GROUP="your-resource-group-name"

# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-logiq-deploy" \
  --role Contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

**Copy the entire JSON output** - you'll need it in the next step.

---

## Step 2: Get Container App Names

Find your Container App names:

```bash
# List all Container Apps in your resource group
az containerapp list \
  --resource-group $RESOURCE_GROUP \
  --query "[].{Name:name, FQDN:properties.configuration.ingress.fqdn}" \
  --output table
```

Note down the names of your API and WebApp Container Apps.

---

## Step 3: Add GitHub Secrets

Go to your GitHub repository:

**Settings → Secrets and variables → Actions → Environment secrets (Env)**

Add the following secrets:

### 1. AZURE_CREDENTIALS
- Click "Add secret"
- Name: `AZURE_CREDENTIALS`
- Value: Paste the entire JSON output from Step 1

### 2. API_CONTAINER_APP_NAME
- Click "Add secret"
- Name: `API_CONTAINER_APP_NAME`
- Value: Your API Container App name (e.g., `logiq-api`)

### 3. WEBAPP_CONTAINER_APP_NAME
- Click "Add secret"
- Name: `WEBAPP_CONTAINER_APP_NAME`
- Value: Your WebApp Container App name (e.g., `logiq-webapp`)

### 4. AZURE_RESOURCE_GROUP
- Click "Add secret"
- Name: `AZURE_RESOURCE_GROUP`
- Value: Your Azure resource group name (e.g., `logiq-prod-rg`)

**Note:** The secrets `REGISTRY`, `ACR_USERNAME`, and `ACR_PASSWORD` should already exist from your previous setup.

---

## Step 4: Verify Configuration

Check that your Container Apps are configured correctly:

```bash
# Verify API Container App
az containerapp show \
  --name <API_CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --query "{Name:name, Image:properties.template.containers[0].image, Registry:properties.configuration.registries[0].server}" \
  --output table

# Verify WebApp Container App
az containerapp show \
  --name <WEBAPP_CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --query "{Name:name, Image:properties.template.containers[0].image, Registry:properties.configuration.registries[0].server}" \
  --output table
```

Expected output should show your ACR registry and image names.

---

## Step 5: Test Deployment

### Option 1: Push to Main Branch

```bash
git add .
git commit -m "Enable automatic deployment to Azure Container Apps"
git push origin main
```

### Option 2: Manual Workflow Run

1. Go to GitHub → Actions tab
2. Click "Build and Push Docker Images"
3. Click "Run workflow"
4. Ensure "Push images to registry" is checked ✅
5. Click "Run workflow"

---

## Step 6: Monitor Deployment

### In GitHub Actions:

1. Go to Actions tab
2. Click on the running workflow
3. Monitor these jobs:
   - `build-and-push-api` ✅
   - `deploy-api` ✅
   - `build-and-push-webapp` ✅
   - `deploy-webapp` ✅

### In Azure Portal:

1. Navigate to your Container App
2. Click "Revision management"
3. You should see a new revision being created
4. Traffic will automatically switch to the new revision

### Via Azure CLI:

```bash
# Watch API deployment
az containerapp revision list \
  --name <API_CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --query "[].{Name:name, Active:properties.active, Created:properties.createdTime, Traffic:properties.trafficWeight}" \
  --output table

# Watch WebApp deployment
az containerapp revision list \
  --name <WEBAPP_CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --query "[].{Name:name, Active:properties.active, Created:properties.createdTime, Traffic:properties.trafficWeight}" \
  --output table
```

---

## Troubleshooting

### Error: "AZURE_CREDENTIALS secret not found"

**Solution:** Ensure you added the secret to the **Environment secrets** (Env), not Repository secrets.

### Error: "Container App not found"

**Solution:** 
1. Verify the Container App name is correct
2. Check the resource group name matches
3. Ensure service principal has access to the resource group

```bash
# List all Container Apps
az containerapp list --resource-group $RESOURCE_GROUP -o table
```

### Error: "Insufficient permissions"

**Solution:** The service principal needs Contributor role on the resource group:

```bash
# Verify role assignment
az role assignment list \
  --assignee <SERVICE_PRINCIPAL_CLIENT_ID> \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --output table
```

### Error: "Image pull failed"

**Solution:** Ensure Container App has ACR credentials configured:

```bash
# Check registry configuration
az containerapp show \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.registries" \
  --output json
```

If empty, add ACR credentials:

```bash
az containerapp registry set \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --server <REGISTRY>.azurecr.io \
  --username <ACR_USERNAME> \
  --password <ACR_PASSWORD>
```

---

## Deployment Flow

Once configured, every push to main will:

1. ✅ Build Docker images for API and WebApp
2. ✅ Push images to Azure Container Registry with `latest` tag
3. ✅ Trigger Azure Container App deployment for API
4. ✅ Trigger Azure Container App deployment for WebApp
5. ✅ Azure creates new revisions
6. ✅ Traffic automatically switches to new revisions
7. ✅ Old revisions kept for rollback (if needed)

---

## Rollback Procedure

If a deployment fails or has issues:

### Via Azure CLI:

```bash
# List revisions
az containerapp revision list \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --output table

# Activate previous revision
az containerapp revision activate \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --revision <PREVIOUS_REVISION_NAME>

# Deactivate current revision
az containerapp revision deactivate \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --revision <CURRENT_REVISION_NAME>
```

### Via Azure Portal:

1. Go to Container App → Revision management
2. Find the previous working revision
3. Click "Activate"
4. Set traffic to 100%

---

## Best Practices

### 1. Monitor First Deployment Closely

Watch logs during the first deployment:

```bash
# Stream logs
az containerapp logs show \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --follow
```

### 2. Keep Multiple Revisions

Configure revision mode to keep history:

```bash
az containerapp update \
  --name <CONTAINER_APP_NAME> \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars "REVISION_MODE=Multiple"
```

### 3. Set Up Health Probes

Ensure your Container Apps have health checks configured to prevent bad deployments from receiving traffic.

### 4. Enable Alerts

Set up Azure Monitor alerts for:
- Deployment failures
- Container restart events
- High error rates

---

## Additional Resources

- [Root Cause Analysis Document](./DEPLOYMENT_ISSUE_ANALYSIS.md) - Detailed explanation of the issue
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Container Apps Deploy Action](https://github.com/Azure/container-apps-deploy-action)

---

## Support

If you encounter issues:

1. Check GitHub Actions logs for error messages
2. Review Azure Container App logs
3. Verify all secrets are correctly configured
4. Ensure service principal has correct permissions
5. Check the troubleshooting section above

For Azure-specific issues, use:
```bash
az containerapp logs show --name <CONTAINER_APP_NAME> --resource-group $RESOURCE_GROUP --tail 100
```
