# GitHub Actions Workflows

This directory contains CI/CD workflows for the LogIQ project.

## Workflows

### `docker-build-push.yml` - Docker Build and Push

Builds and pushes Docker images to Azure Container Registry on every push to `main` branch or when tags are created.

#### Triggers

- **Push to main branch** - Builds and pushes images with `latest` tag
- **Pull requests** - Builds images without pushing (validation only)
- **Git tags** (v*.*.*) - Builds and pushes with semantic version tags

#### Images Built

1. **logiq-api** - .NET 10.0 backend API
2. **logiq-webapp** - React frontend application

#### Versioning Strategy

The workflow uses `docker/metadata-action` to automatically generate tags:

- **Semantic versioning** - `v1.2.3` → `1.2.3`, `1.2`, `1`
- **Branch names** - `main` → `main`
- **Git SHA** - `main-abc1234`
- **Latest** - `latest` (only on main branch)

#### Features

✅ **Multi-platform builds** - Supports `linux/amd64` and `linux/arm64`
✅ **Layer caching** - Uses GitHub Actions cache for faster builds
✅ **Security scanning** - Trivy vulnerability scanning with SARIF upload
✅ **Metadata labels** - OCI-compliant image labels
✅ **Parallel builds** - API and WebApp build simultaneously

## Setup

### 1. Azure Container Registry

Create an Azure Container Registry:

```bash
# Create resource group
az group create --name logiq-rg --location eastus

# Create container registry
az acr create --resource-group logiq-rg \
  --name logiqacr \
  --sku Basic

# Get login server
az acr show --name logiqacr --query loginServer --output tsv
```

### 2. Service Principal

Create a service principal for GitHub Actions:

```bash
# Get ACR ID
ACR_ID=$(az acr show --name logiqacr --query id --output tsv)

# Create service principal with push permissions
az ad sp create-for-rbac \
  --name "github-actions-logiq" \
  --role AcrPush \
  --scopes $ACR_ID \
  --sdk-auth

# Save the JSON output - you'll need it for GitHub secrets
```

### 3. GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `ACR_LOGIN_SERVER` | Azure Container Registry URL | `logiqacr.azurecr.io` |
| `ACR_USERNAME` | Service principal app ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `ACR_PASSWORD` | Service principal password | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |

**To add secrets:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the values from the service principal output

### 4. Enable Security Scanning (Optional)

To enable Trivy security scanning results in GitHub Security tab:

1. Go to repository Settings → Code security and analysis
2. Enable "Dependency graph"
3. Enable "Dependabot alerts"
4. Enable "Code scanning" (requires GitHub Advanced Security for private repos)

## Usage

### Automatic Builds

Builds trigger automatically on:
- Push to `main` branch
- Pull request to `main` branch
- Creating a git tag matching `v*.*.*`

### Manual Trigger

You can also trigger builds manually:

1. Go to Actions tab
2. Select "Build and Push Docker Images"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Creating a Release

To create a versioned release:

```bash
# Tag the commit
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag
git push origin v1.0.0
```

This will create images with tags:
- `logiqacr.azurecr.io/logiq-api:1.0.0`
- `logiqacr.azurecr.io/logiq-api:1.0`
- `logiqacr.azurecr.io/logiq-api:1`
- `logiqacr.azurecr.io/logiq-api:latest`

## Best Practices Implemented

### Security
- ✅ Service principal with minimal permissions (AcrPush only)
- ✅ Secrets stored in GitHub Secrets (never in code)
- ✅ Vulnerability scanning with Trivy
- ✅ SARIF upload to GitHub Security tab
- ✅ Non-root user in Docker images

### Performance
- ✅ Docker Buildx for multi-platform builds
- ✅ GitHub Actions cache for layer caching
- ✅ Parallel job execution
- ✅ Optimized Dockerfile with multistage builds

### Versioning
- ✅ Semantic versioning (SemVer)
- ✅ Git SHA tagging for traceability
- ✅ Branch-based tagging
- ✅ Latest tag on main branch only

### Reliability
- ✅ Pull request validation (build without push)
- ✅ Metadata labels for image tracking
- ✅ Build date and VCS ref in labels
- ✅ Explicit platform targeting

## Troubleshooting

### Build Fails with "unauthorized"

Check that your ACR credentials are correct:
```bash
# Test login
az acr login --name logiqacr
```

### Images Not Appearing in ACR

Verify the workflow ran successfully:
1. Check Actions tab for workflow status
2. Review logs for any errors
3. Ensure secrets are set correctly

### Security Scan Fails

If Trivy scanning fails:
1. Check if image was pushed successfully
2. Verify ACR credentials allow pulling images
3. Review Trivy action logs for specific errors

## Monitoring

### View Workflow Runs
- Go to Actions tab to see all workflow runs
- Click on a run to see detailed logs
- Download artifacts if needed

### View Images in ACR
```bash
# List repositories
az acr repository list --name logiqacr --output table

# List tags for a repository
az acr repository show-tags --name logiqacr \
  --repository logiq-api \
  --output table

# Get image manifest
az acr repository show --name logiqacr \
  --image logiq-api:latest
```

## Advanced Configuration

### Custom Build Arguments

To add custom build arguments, modify the workflow:

```yaml
build-args: |
  BUILD_DATE=${{ github.event.head_commit.timestamp }}
  VCS_REF=${{ github.sha }}
  VERSION=${{ steps.meta.outputs.version }}
  CUSTOM_ARG=value
```

### Different Tagging Strategy

Modify the `tags` section in `docker/metadata-action`:

```yaml
tags: |
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
  type=raw,value=stable,enable={{is_default_branch}}
```

### Additional Platforms

Add more platforms to the build:

```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## References

- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
