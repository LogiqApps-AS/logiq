# LogIQ Docker Deployment

This directory contains Docker configuration for running the LogIQ application stack.

## Services

- **API** - .NET 10.0 backend API service (port 5000)
- **WebApp** - React frontend application (port 3000)
- **Azurite** - Azure Storage emulator for local development (ports 10000-10002)

## Quick Start

### 1. Prerequisites

- Docker Desktop installed
- Docker Compose v2+

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your Azure credentials (or use Azurite defaults for local development).

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/scalar/v1

## Development

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build api
docker-compose build webapp

# Rebuild all services
docker-compose build
```

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f webapp
```

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# Inspect health
docker inspect logiq-api --format='{{.State.Health.Status}}'
docker inspect logiq-webapp --format='{{.State.Health.Status}}'
```

## Architecture

### Multistage Builds

Both Dockerfile implementations use multistage builds for:
- **Smaller images** - Only runtime dependencies in final image
- **Security** - Build tools not included in production image
- **Performance** - Faster deployments and reduced attack surface

### API Dockerfile Stages

1. **Build Stage** - Restore dependencies and compile .NET application
2. **Runtime Stage** - Minimal ASP.NET runtime with published app

### WebApp Dockerfile Stages

1. **Dependencies** - Install npm packages
2. **Builder** - Build React application
3. **Runner** - Nginx serving static files

### Security Best Practices

- ✅ Non-root user execution
- ✅ Minimal base images
- ✅ No secrets in images
- ✅ Health checks for reliability
- ✅ .dockerignore to exclude sensitive files

## Environment Variables

### API Service

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage or Azurite connection | Azurite local |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | - |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | - |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | gpt-4 |
| `AZURE_SEARCH_ENDPOINT` | Azure AI Search endpoint | - |
| `AZURE_SEARCH_API_KEY` | Azure AI Search API key | - |

### WebApp Service

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://api:8080 |

## Troubleshooting

### API won't start

Check Azure Storage connection:
```bash
docker-compose logs azurite
docker-compose logs api
```

### WebApp can't connect to API

Verify network connectivity:
```bash
docker-compose exec webapp ping api
```

### Clear all data and restart

```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

For production deployments:

1. Use proper Azure Storage (not Azurite)
2. Configure Azure OpenAI credentials
3. Use environment-specific `.env` files
4. Enable HTTPS/TLS
5. Configure proper resource limits
6. Set up monitoring and logging
7. Use container orchestration (Kubernetes, Azure Container Apps, etc.)

## Network

All services communicate via the `logiq-network` bridge network:
- Services can reference each other by service name
- Isolated from host network by default
- Exposed ports mapped to host as needed
